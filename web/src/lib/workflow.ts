import "server-only";
import { randomUUID } from "node:crypto";
import { requireReportsPool, type ReportSource, type ReportStatus, type ReportTheme, type ReportVerdict } from "@/lib/reports";
import { sendMail, managerEmails } from "@/lib/mailer";

// Seuils volontairement simples et explicables : aucune note n’est présentée comme un verdict.
export const DUPLICATE_SIMILARITY = 0.45;
export const INSTANT_SIMILARITY = 0.5;
export const PEAK_THRESHOLD = 5;

const PRIORITY_SQL = `
  (CASE r.theme WHEN 'health' THEN 30 WHEN 'safety' THEN 30 WHEN 'politics' THEN 20 WHEN 'education' THEN 15 WHEN 'economy' THEN 15 WHEN 'agriculture' THEN 10 ELSE 5 END)
  + LEAST(m.size, 10) * 5 + LEAST(m.recent * 8, 40)
  + CASE WHEN r.region IS NOT NULL THEN 5 ELSE 0 END
  + CASE r.status WHEN 'new' THEN 10 WHEN 'in_review' THEN 5 ELSE 0 END`;

const MEMBERS_CTE = `
  WITH m AS (
    SELECT COALESCE(cluster_id, id) AS root, count(*)::int AS size,
      (count(*) FILTER (WHERE submitted_at > now() - interval '24 hours'))::int AS recent
    FROM laverta_reports WHERE expires_at > now() GROUP BY 1
  )`;

export type QueueItem = {
  id: string; tracking_hint: string; assertion: string; theme: ReportTheme; language: string; region: string | null;
  channel: string; status: ReportStatus; verdict: ReportVerdict | null; assigned_to: string | null; referred_to: string | null;
  org_status: string | null; submitted_at: Date; has_media: boolean; size: number; recent: number; priority: number;
};

export async function listQueue() {
  const result = await requireReportsPool().query<QueueItem>(
    `${MEMBERS_CTE}
     SELECT r.id, r.tracking_hint, r.assertion, r.theme, r.language, r.region, r.channel, r.status, r.verdict, r.assigned_to,
       r.referred_to, r.org_status, r.submitted_at, r.media_ciphertext IS NOT NULL AS has_media, m.size, m.recent,
       (${PRIORITY_SQL})::int AS priority
     FROM laverta_reports r JOIN m ON m.root = r.id
     WHERE r.cluster_id IS NULL AND r.expires_at > now()
     ORDER BY CASE WHEN r.status IN ('verified', 'closed') THEN 1 ELSE 0 END, priority DESC, r.submitted_at DESC
     LIMIT 300`,
  );
  return result.rows;
}

export type CaseRow = {
  id: string; tracking_hint: string; assertion: string; context: string; theme: ReportTheme; language: string; region: string | null;
  channel: string; source_url: string | null; status: ReportStatus; verdict: ReportVerdict | null; rationale: string | null;
  correction: string | null; sources: ReportSource[]; media_mime_type: string | null; media_size: number | null; media_sha256: string | null;
  submitted_at: Date; expires_at: Date; published_at: Date | null; submitted_by: string | null; assigned_to: string | null;
  cluster_id: string | null; instant_publication_id: string | null; referred_to: string | null; referral_summary: string | null;
  referred_at: Date | null; org_status: string | null; org_response: string | null; org_links: ReportSource[];
  org_responder: string | null; org_responded_at: Date | null; notified_count: number;
};

const CASE_COLUMNS = `id, tracking_hint, assertion, context, theme, language, region, channel, source_url, status, verdict, rationale, correction,
  sources, media_mime_type, media_size, media_sha256, submitted_at, expires_at, published_at, submitted_by, assigned_to, cluster_id,
  instant_publication_id, referred_to, referral_summary, referred_at, org_status, org_response, org_links, org_responder, org_responded_at, notified_count`;

export async function getCase(id: string) {
  const db = requireReportsPool();
  const result = await db.query<CaseRow>(`SELECT ${CASE_COLUMNS} FROM laverta_reports WHERE id = $1 AND expires_at > now()`, [id]);
  return result.rows[0] ?? null;
}

export async function getCaseDetails(id: string) {
  const db = requireReportsPool();
  const [members, audit, publication, related] = await Promise.all([
    db.query<{ id: string; tracking_hint: string; assertion: string; channel: string; region: string | null; submitted_at: Date }>(
      "SELECT id, tracking_hint, assertion, channel, region, submitted_at FROM laverta_reports WHERE cluster_id = $1 AND expires_at > now() ORDER BY submitted_at DESC",
      [id],
    ),
    db.query<{ actor_email: string; action: string; created_at: Date; after_state: Record<string, unknown> }>(
      "SELECT actor_email, action, created_at, after_state FROM laverta_report_audit WHERE report_id = $1 ORDER BY created_at DESC LIMIT 25",
      [id],
    ),
    db.query<{ id: string; published_at: Date; reach_count: number; instant_answer_count: number; withdrawn_at: Date | null }>(
      "SELECT id, published_at, reach_count, instant_answer_count, withdrawn_at FROM laverta_publications WHERE report_id = $1",
      [id],
    ),
    // Rapprochement : vérifications publiées proches, proposées au journaliste sans décision automatique.
    db.query<{ id: string; assertion: string; verdict: ReportVerdict; published_at: Date; score: number }>(
      `SELECT p.id, p.assertion, p.verdict, p.published_at, similarity(p.assertion, r.assertion)::float AS score
       FROM laverta_publications p, laverta_reports r
       WHERE r.id = $1 AND p.withdrawn_at IS NULL AND (p.report_id IS NULL OR p.report_id <> r.id) AND similarity(p.assertion, r.assertion) > 0.25
       ORDER BY score DESC LIMIT 4`,
      [id],
    ),
  ]);
  return { members: members.rows, audit: audit.rows, publication: publication.rows[0] ?? null, related: related.rows };
}

async function audit(reportId: string, actor: string, action: string, after: Record<string, unknown>, before: Record<string, unknown> = {}) {
  await requireReportsPool().query(
    "INSERT INTO laverta_report_audit (report_id, actor_email, action, before_state, after_state) VALUES ($1, $2, $3, $4::jsonb, $5::jsonb)",
    [reportId, actor, action, JSON.stringify(before), JSON.stringify(after)],
  );
}

export async function findInstantMatch(text: string) {
  const result = await requireReportsPool().query<{ id: string; report_id: string | null; verdict: ReportVerdict; correction: string; assertion: string }>(
    `SELECT id, report_id, verdict, correction, assertion FROM laverta_publications
     WHERE withdrawn_at IS NULL AND similarity(assertion, $1) > $2 ORDER BY similarity(assertion, $1) DESC LIMIT 1`,
    [text, INSTANT_SIMILARITY],
  );
  return result.rows[0] ?? null;
}

// Après chaque nouveau dossier : réponse instantanée si déjà vérifié, sinon regroupement avec un dossier proche.
export async function processNewReport(reportId: string) {
  const db = requireReportsPool();
  const report = (await db.query<{ assertion: string }>("SELECT assertion FROM laverta_reports WHERE id = $1", [reportId])).rows[0];
  if (!report) return null;
  const match = await findInstantMatch(report.assertion);
  let root: string | null = null;
  if (match) {
    await db.query("UPDATE laverta_reports SET instant_publication_id = $2 WHERE id = $1", [reportId, match.id]);
    await db.query("UPDATE laverta_publications SET instant_answer_count = instant_answer_count + 1, reach_count = reach_count + 1, report_count = report_count + 1 WHERE id = $1", [match.id]);
    if (match.report_id) {
      const exists = await db.query("SELECT 1 FROM laverta_reports WHERE id = $1 AND cluster_id IS NULL AND expires_at > now()", [match.report_id]);
      if (exists.rowCount) root = match.report_id;
    }
  }
  if (!root) {
    const similar = await db.query<{ id: string }>(
      `SELECT id FROM laverta_reports WHERE id <> $1 AND cluster_id IS NULL AND expires_at > now() AND status <> 'closed'
         AND similarity(assertion, $2) > $3 ORDER BY similarity(assertion, $2) DESC, submitted_at ASC LIMIT 1`,
      [reportId, report.assertion, DUPLICATE_SIMILARITY],
    );
    root = similar.rows[0]?.id ?? null;
  }
  if (root) {
    await db.query("UPDATE laverta_reports SET cluster_id = $2, status = (SELECT status FROM laverta_reports WHERE id = $2) WHERE id = $1", [reportId, root]);
    await checkPeak(root);
  }
  return match;
}

async function checkPeak(rootId: string) {
  const db = requireReportsPool();
  const result = await db.query<{ recent: number; assertion: string; peak_alerted_at: Date | null }>(
    `SELECT (SELECT count(*) FROM laverta_reports WHERE (id = $1 OR cluster_id = $1) AND submitted_at > now() - interval '24 hours')::int AS recent,
       assertion, peak_alerted_at FROM laverta_reports WHERE id = $1`,
    [rootId],
  );
  const row = result.rows[0];
  if (!row || row.recent < PEAK_THRESHOLD || row.peak_alerted_at) return;
  await db.query("UPDATE laverta_reports SET peak_alerted_at = now() WHERE id = $1", [rootId]);
  const base = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  const recipients = await managerEmails();
  await Promise.allSettled(recipients.map((to) => sendMail(to, "Laverta · Pic de signalements",
    `${row.recent} signalements similaires en 24 h :\n« ${row.assertion.slice(0, 200)} »\n\nDossier : ${base}/redaction/dossiers/${rootId}`)));
}

export async function listPeaks() {
  const result = await requireReportsPool().query<{ id: string; assertion: string; recent: number; theme: ReportTheme }>(
    `${MEMBERS_CTE}
     SELECT r.id, r.assertion, m.recent, r.theme FROM laverta_reports r JOIN m ON m.root = r.id
     WHERE r.cluster_id IS NULL AND m.recent >= $1 AND r.status NOT IN ('verified', 'closed') ORDER BY m.recent DESC LIMIT 5`,
    [PEAK_THRESHOLD],
  );
  return result.rows;
}

export async function assignCase(id: string, assignee: string | null, actor: string) {
  const db = requireReportsPool();
  const before = await db.query<{ assigned_to: string | null; assertion: string }>("SELECT assigned_to, assertion FROM laverta_reports WHERE id = $1", [id]);
  if (!before.rows[0]) return false;
  await db.query("UPDATE laverta_reports SET assigned_to = $2, status = CASE WHEN status = 'new' AND $2::text IS NOT NULL THEN 'in_review' ELSE status END, updated_at = now() WHERE id = $1 OR cluster_id = $1", [id, assignee]);
  await audit(id, actor, "assign", { assigned_to: assignee }, { assigned_to: before.rows[0].assigned_to });
  if (assignee && assignee !== actor) {
    const base = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
    await sendMail(assignee, "Laverta · Un dossier vous est attribué", `« ${before.rows[0].assertion.slice(0, 200)} »\n\n${base}/redaction/dossiers/${id}`).catch(() => undefined);
  }
  return true;
}

export async function referCase(id: string, organization: string, summary: string, actor: string) {
  const db = requireReportsPool();
  const result = await db.query(
    `UPDATE laverta_reports SET referred_to = $2, referral_summary = $3, referred_at = now(), org_status = 'pending', org_response = NULL,
       org_links = '[]'::jsonb, org_responder = NULL, org_responded_at = NULL, status = 'referred', updated_at = now()
     WHERE id = $1 AND expires_at > now()`,
    [id, organization, summary],
  );
  if (!result.rowCount) return false;
  await db.query("UPDATE laverta_reports SET status = 'referred' WHERE cluster_id = $1", [id]);
  await syncMessengerStatus(id, "referred");
  await audit(id, actor, "refer", { referred_to: organization });
  const recipients = await db.query<{ email: string }>("SELECT email FROM laverta_staff WHERE role = 'organization' AND active AND organization = $1", [organization]);
  const base = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  await Promise.allSettled(recipients.rows.map(({ email }) => sendMail(email, "Laverta · Demande de vérification", `Une rédaction vous transmet une demande anonymisée :\n\n${summary}\n\nRépondre : ${base}/organisme/dossiers/${id}`)));
  return true;
}

export async function detachMember(memberId: string, rootId: string, actor: string) {
  const result = await requireReportsPool().query("UPDATE laverta_reports SET cluster_id = NULL, status = 'new' WHERE id = $1 AND cluster_id = $2", [memberId, rootId]);
  if (result.rowCount) await audit(rootId, actor, "detach", { member: memberId });
  return result.rowCount === 1;
}

export type OrgCase = { id: string; theme: ReportTheme; region: string | null; referral_summary: string; referred_at: Date; org_status: string; org_response: string | null; org_links: ReportSource[]; org_responded_at: Date | null };

export async function listOrgCases(organization: string) {
  const result = await requireReportsPool().query<OrgCase>(
    `SELECT id, theme, region, referral_summary, referred_at, org_status, org_response, org_links, org_responded_at FROM laverta_reports
     WHERE referred_to = $1 AND expires_at > now() AND cluster_id IS NULL ORDER BY (org_status = 'done'), referred_at DESC LIMIT 100`,
    [organization],
  );
  return result.rows;
}

export async function getOrgCase(id: string, organization: string) {
  const result = await requireReportsPool().query<OrgCase>(
    `SELECT id, theme, region, referral_summary, referred_at, org_status, org_response, org_links, org_responded_at FROM laverta_reports
     WHERE id = $1 AND referred_to = $2 AND expires_at > now()`,
    [id, organization],
  );
  return result.rows[0] ?? null;
}

export async function respondAsOrg(id: string, organization: string, status: "in_progress" | "done", response: string, links: ReportSource[], actor: string) {
  const db = requireReportsPool();
  const result = await db.query<{ assigned_to: string | null }>(
    `UPDATE laverta_reports SET org_status = $3, org_response = $4, org_links = $5::jsonb, org_responder = $6, org_responded_at = now(), updated_at = now()
     WHERE id = $1 AND referred_to = $2 AND expires_at > now() RETURNING assigned_to`,
    [id, organization, status, response, JSON.stringify(links), actor],
  );
  if (!result.rowCount) return false;
  await audit(id, actor, "org_response", { org_status: status, organization });
  const base = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  const to = result.rows[0].assigned_to ? [result.rows[0].assigned_to] : await managerEmails();
  await Promise.allSettled(to.map((email) => sendMail(email, `Laverta · Réponse de ${organization}`, `${response.slice(0, 600)}\n\n${base}/redaction/dossiers/${id}`)));
  return true;
}

const SIGNALEMENT_STATUS: Record<ReportStatus, string> = { new: "new", in_review: "in_review", referred: "forwarded", verified: "verified", closed: "closed" };

async function syncMessengerStatus(rootId: string, status: ReportStatus) {
  await requireReportsPool().query(
    `UPDATE signalement SET status = $2 WHERE id IN (SELECT signalement_id FROM laverta_reports WHERE (id = $1 OR cluster_id = $1) AND signalement_id IS NOT NULL)`,
    [rootId, SIGNALEMENT_STATUS[status]],
  ).catch(() => undefined);
}

export type Decision = { id: string; status: ReportStatus; verdict: ReportVerdict | null; rationale: string; correction: string; sources: ReportSource[]; publicAssertion: string };

// Décision humaine : met à jour le dossier, ses doublons, la base publique et le bot. Renvoie l’identifiant publié s’il est nouveau.
export async function saveDecision(input: Decision, actor: string) {
  const db = requireReportsPool();
  const client = await db.connect();
  let newPublication: string | null = null;
  try {
    await client.query("BEGIN");
    const before = (await client.query<{ status: ReportStatus; verdict: ReportVerdict | null; rationale: string | null; correction: string | null; sources: ReportSource[]; region: string | null; theme: string }>(
      "SELECT status, verdict, rationale, correction, sources, region, theme FROM laverta_reports WHERE id = $1 AND expires_at > now() AND cluster_id IS NULL FOR UPDATE",
      [input.id],
    )).rows[0];
    if (!before) { await client.query("ROLLBACK"); return { ok: false as const }; }
    await client.query(
      `UPDATE laverta_reports SET status = $2, verdict = $3, rationale = $4, correction = $5, sources = $6::jsonb, updated_at = now(),
        published_at = CASE WHEN $2 = 'verified' THEN COALESCE(published_at, now()) WHEN $2 IN ('new', 'in_review', 'referred') THEN NULL ELSE published_at END
       WHERE id = $1`,
      [input.id, input.status, input.verdict, input.rationale || null, input.correction || null, JSON.stringify(input.sources)],
    );
    await client.query("UPDATE laverta_reports SET status = $2, updated_at = now() WHERE cluster_id = $1", [input.id, input.status]);
    if (input.status === "verified" && input.verdict) {
      const existing = await client.query<{ id: string }>("SELECT id FROM laverta_publications WHERE report_id = $1", [input.id]);
      const stats = (await client.query<{ first: Date; count: number }>("SELECT min(submitted_at) AS first, count(*)::int AS count FROM laverta_reports WHERE id = $1 OR cluster_id = $1", [input.id])).rows[0];
      if (existing.rows[0]) {
        await client.query(
          `UPDATE laverta_publications SET assertion = $2, verdict = $3, rationale = $4, correction = $5, sources = $6::jsonb, report_count = GREATEST(report_count, $7), updated_at = now(), withdrawn_at = NULL WHERE id = $1`,
          [existing.rows[0].id, input.publicAssertion, input.verdict, input.rationale, input.correction, JSON.stringify(input.sources), stats.count],
        );
      } else {
        newPublication = randomUUID();
        await client.query(
          `INSERT INTO laverta_publications (id, report_id, assertion, theme, region, verdict, rationale, correction, sources, first_reported_at, report_count, published_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11, $12)`,
          [newPublication, input.id, input.publicAssertion, before.theme, before.region, input.verdict, input.rationale, input.correction, JSON.stringify(input.sources), stats.first, stats.count, actor],
        );
      }
    } else {
      await client.query("UPDATE laverta_publications SET withdrawn_at = COALESCE(withdrawn_at, now()) WHERE report_id = $1", [input.id]);
    }
    await client.query(
      "INSERT INTO laverta_report_audit (report_id, actor_email, action, before_state, after_state) VALUES ($1, $2, 'editorial_update', $3::jsonb, $4::jsonb)",
      [input.id, actor, JSON.stringify({ status: before.status, verdict: before.verdict }), JSON.stringify({ status: input.status, verdict: input.verdict, sources: input.sources.length })],
    );
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
  await syncMessengerStatus(input.id, input.status);
  if (newPublication) {
    const { notifyMessengerReporters } = await import("@/lib/messenger-bridge");
    await notifyMessengerReporters(input.id, newPublication).catch(() => undefined);
  }
  return { ok: true as const };
}

export type Publication = {
  id: string; assertion: string; theme: ReportTheme; region: string | null; verdict: ReportVerdict; rationale: string; correction: string;
  sources: ReportSource[]; first_reported_at: Date; published_at: Date; updated_at: Date; report_count: number; reach_count: number;
};

const PUBLICATION_COLUMNS = "id, assertion, theme, region, verdict, rationale, correction, sources, first_reported_at, published_at, updated_at, report_count, reach_count";

export async function listPublications(query: string, theme: string) {
  const params: unknown[] = [];
  const where = ["withdrawn_at IS NULL"];
  if (theme) { params.push(theme); where.push(`theme = $${params.length}`); }
  if (query) { params.push(query); where.push(`(assertion ILIKE '%' || $${params.length} || '%' OR correction ILIKE '%' || $${params.length} || '%' OR similarity(assertion, $${params.length}) > 0.2)`); }
  const result = await requireReportsPool().query<Publication>(
    `SELECT ${PUBLICATION_COLUMNS} FROM laverta_publications WHERE ${where.join(" AND ")} ORDER BY published_at DESC LIMIT 60`,
    params,
  );
  return result.rows;
}

export async function getPublication(id: string) {
  const result = await requireReportsPool().query<Publication>(`SELECT ${PUBLICATION_COLUMNS} FROM laverta_publications WHERE id = $1 AND withdrawn_at IS NULL`, [id]);
  return result.rows[0] ?? null;
}

export async function getStatistics() {
  const db = requireReportsPool();
  const [delay, totals, byTheme, byRegion, orgs, channels] = await Promise.all([
    db.query<{ median_hours: number | null; avg_hours: number | null; published: number }>(
      `SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY extract(epoch FROM published_at - first_reported_at) / 3600)::float AS median_hours,
         (avg(extract(epoch FROM published_at - first_reported_at)) / 3600)::float AS avg_hours, count(*)::int AS published
       FROM laverta_publications WHERE withdrawn_at IS NULL`,
    ),
    db.query<{ reports: number; instant: number; reach: number; instant_answers: number }>(
      `SELECT (SELECT count(*) FROM laverta_reports WHERE expires_at > now())::int AS reports,
         (SELECT count(*) FROM laverta_reports WHERE expires_at > now() AND instant_publication_id IS NOT NULL)::int AS instant,
         (SELECT COALESCE(sum(reach_count), 0) FROM laverta_publications)::int AS reach,
         (SELECT COALESCE(sum(instant_answer_count), 0) FROM laverta_publications)::int AS instant_answers`,
    ),
    db.query<{ theme: ReportTheme; total: number; recent: number }>(
      `SELECT theme, count(*)::int AS total, (count(*) FILTER (WHERE submitted_at > now() - interval '7 days'))::int AS recent
       FROM laverta_reports WHERE expires_at > now() GROUP BY theme ORDER BY total DESC`,
    ),
    db.query<{ region: string; total: number }>(
      `SELECT COALESCE(NULLIF(trim(region), ''), '—') AS region, count(*)::int AS total FROM laverta_reports WHERE expires_at > now()
       GROUP BY 1 ORDER BY total DESC LIMIT 12`,
    ),
    db.query<{ organization: string; referred: number; answered: number; avg_hours: number | null }>(
      `SELECT referred_to AS organization, count(*)::int AS referred, (count(*) FILTER (WHERE org_responded_at IS NOT NULL))::int AS answered,
         (avg(extract(epoch FROM org_responded_at - referred_at)) / 3600)::float AS avg_hours
       FROM laverta_reports WHERE referred_to IS NOT NULL GROUP BY referred_to ORDER BY referred DESC`,
    ),
    db.query<{ channel: string; total: number }>("SELECT channel, count(*)::int AS total FROM laverta_reports WHERE expires_at > now() GROUP BY channel"),
  ]);
  return { delay: delay.rows[0], totals: totals.rows[0], byTheme: byTheme.rows, byRegion: byRegion.rows, orgs: orgs.rows, channels: channels.rows };
}

export async function listOwnReports(email: string) {
  const result = await requireReportsPool().query<{ id: string; tracking_hint: string; assertion: string; theme: ReportTheme; region: string | null; status: ReportStatus; submitted_at: Date; publication_id: string | null }>(
    `SELECT r.id, r.tracking_hint, r.assertion, r.theme, r.region, r.status, r.submitted_at, p.id AS publication_id
     FROM laverta_reports r LEFT JOIN laverta_publications p ON p.report_id = COALESCE(r.cluster_id, r.id) AND p.withdrawn_at IS NULL
     WHERE r.submitted_by = $1 AND r.expires_at > now() ORDER BY r.submitted_at DESC LIMIT 50`,
    [email],
  );
  return result.rows;
}
