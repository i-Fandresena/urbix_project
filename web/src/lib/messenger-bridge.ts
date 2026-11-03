import "server-only";
import { requireReportsPool, type ReportVerdict } from "@/lib/reports";
import { findInstantMatch, processNewReport } from "@/lib/workflow";
import type { Reply } from "@/lib/messenger-flow";

const GRAPH_MESSAGES_URL = "https://graph.facebook.com/v26.0/me/messages";
type Lang = "fr" | "mg" | "en";

// Libellés malgaches provisoires : à faire relire par un locuteur natif.
export const VERDICT_WORDS: Record<Lang, Record<ReportVerdict, string>> = {
  fr: { false: "FAUX", true: "VRAI", misleading: "TROMPEUR", unverifiable: "NON VÉRIFIABLE" },
  en: { false: "FALSE", true: "TRUE", misleading: "MISLEADING", unverifiable: "UNVERIFIABLE" },
  mg: { false: "DISO", true: "MARINA", misleading: "MAMITAKA", unverifiable: "TSY AZO HAMARININA" },
};

const TEMPLATES: Record<Lang, { result: string; instant: string; details: string }> = {
  fr: { result: "Laverta · Résultat de la vérification {code}", instant: "Cette information a déjà été vérifiée par un journaliste :", details: "Détails et sources" },
  en: { result: "Laverta · Verification result {code}", instant: "A journalist has already checked this claim:", details: "Details and sources" },
  mg: { result: "Laverta · Valin'ny fanamarinana {code}", instant: "Efa nohamarinin'ny mpanao gazety io vaovao io :", details: "Antsipiriany sy loharano" },
};

function lang(value: string | null | undefined): Lang {
  return value === "fr" || value === "en" ? value : "mg";
}

function publicationText(language: Lang, header: string, publication: { id: string; verdict: ReportVerdict; correction: string }) {
  const base = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  const words = VERDICT_WORDS[language];
  return `${header}\n\n${words[publication.verdict]} — ${publication.correction.slice(0, 1200)}\n\n${TEMPLATES[language].details} : ${base}/verifications/${publication.id}`;
}

// Même requête que le rattrapage de scripts/migrate-signalements.mjs.
export async function mirrorSignalement(signalementId: number) {
  const result = await requireReportsPool().query<{ id: string }>(
    `INSERT INTO laverta_reports (id, tracking_hash, tracking_hint, assertion, context, theme, language, channel, region, signalement_id, submitted_at, expires_at)
     SELECT gen_random_uuid(), encode(sha256(convert_to('messenger:' || s.code, 'UTF8')), 'hex'), right(s.code, 4),
       CASE WHEN char_length(s.content) < 12 THEN s.content || ' · Messenger' ELSE left(s.content, 500) END,
       left(concat_ws(' · ', CASE WHEN s.kind = 'check' THEN 'Demande de vérification (Messenger)' ELSE 'Signalement (Messenger)' END, 'Vu sur : ' || s.seen_on, CASE WHEN s.attachment_count > 0 THEN s.attachment_count || ' fichier(s) non conservé(s)' END), 1200),
       CASE s.theme WHEN 'sante' THEN 'health' WHEN 'economie' THEN 'economy' WHEN 'politique' THEN 'politics' WHEN 'securite' THEN 'safety' WHEN 'education' THEN 'education' WHEN 'agriculture' THEN 'agriculture' ELSE 'other' END,
       CASE WHEN s.language IN ('fr', 'mg', 'en') THEN s.language ELSE 'mg' END,
       'messenger', left(s.region, 80), s.id, s.created_at, s.created_at + interval '30 days'
     FROM signalement s WHERE s.id = $1 ON CONFLICT DO NOTHING RETURNING id`,
    [signalementId],
  );
  const reportId = result.rows[0]?.id;
  return reportId ? processNewReport(reportId) : null;
}

// Réponse instantanée dans Messenger quand la rumeur correspond à une vérification publiée.
export async function instantReplyFor(code: string, language: string): Promise<Reply | null> {
  const row = (await requireReportsPool().query<{ content: string }>("SELECT content FROM signalement WHERE code = $1", [code])).rows[0];
  if (!row) return null;
  const match = await findInstantMatch(row.content);
  if (!match) return null;
  const l = lang(language);
  return { text: publicationText(l, TEMPLATES[l].instant, match) };
}

// Commande SUIVI : ajoute la correction publiée au statut du signalement.
export async function publishedReplyFor(psid: string, code: string, language: string): Promise<Reply | null> {
  const result = await requireReportsPool().query<{ id: string; verdict: ReportVerdict; correction: string }>(
    `SELECT p.id, p.verdict, p.correction FROM signalement s
     JOIN laverta_reports r ON r.signalement_id = s.id
     JOIN laverta_publications p ON p.report_id = COALESCE(r.cluster_id, r.id) AND p.withdrawn_at IS NULL
     WHERE s.reporter_psid = $1 AND s.code = $2`,
    [psid, code],
  );
  const publication = result.rows[0];
  if (!publication) return null;
  const l = lang(language);
  return { text: publicationText(l, TEMPLATES[l].result.replace("{code}", code), publication) };
}

// Retour aux signaleurs : Meta n’autorise l’envoi libre que 24 h après leur dernier message ; les autres retrouvent la correction avec SUIVI.
export async function notifyMessengerReporters(rootId: string, publicationId: string) {
  const token = process.env.MESSENGER_PAGE_ACCESS_TOKEN;
  if (!token) return 0;
  const db = requireReportsPool();
  const publication = (await db.query<{ id: string; verdict: ReportVerdict; correction: string }>("SELECT id, verdict, correction FROM laverta_publications WHERE id = $1", [publicationId])).rows[0];
  if (!publication) return 0;
  const reporters = await db.query<{ report_id: string; psid: string; code: string; language: string | null }>(
    `SELECT r.id AS report_id, s.reporter_psid AS psid, s.code, s.language FROM laverta_reports r JOIN signalement s ON s.id = r.signalement_id
     WHERE (r.id = $1 OR r.cluster_id = $1) AND r.notified_count = 0`,
    [rootId],
  );
  let delivered = 0;
  for (const reporter of reporters.rows) {
    const l = lang(reporter.language);
    const response = await fetch(GRAPH_MESSAGES_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ recipient: { id: reporter.psid }, messaging_type: "RESPONSE", message: { text: publicationText(l, TEMPLATES[l].result.replace("{code}", reporter.code), publication) } }),
    }).catch(() => null);
    if (response?.ok) {
      delivered++;
      await db.query("UPDATE laverta_reports SET notified_count = notified_count + 1 WHERE id = $1", [reporter.report_id]);
    }
  }
  if (delivered) await db.query("UPDATE laverta_publications SET reach_count = reach_count + $2 WHERE id = $1", [publicationId, delivered]);
  return delivered;
}
