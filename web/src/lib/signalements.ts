import { randomInt } from "node:crypto";
import { pool } from "@/lib/db";
import { STEPS, type CompleteDraft, type Conversation, type SignalementSummary } from "@/lib/messenger-flow";
import { isLanguage, type Language } from "@/lib/messenger-messages";

// Sans 0, O, 1, I ni L pour qu’un code se recopie sans erreur.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

type SummaryRow = { code: string; theme: string; status: string; created_at: Date };

function database() {
  if (!pool) throw new Error("DATABASE_URL n’est pas configurée.");
  return pool;
}

function newCode() {
  return `LV-${Array.from({ length: 6 }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join("")}`;
}

function toSummary(row: SummaryRow): SignalementSummary {
  return { code: row.code, theme: row.theme, status: row.status, createdAt: row.created_at };
}

// Meta peut renvoyer le même événement : seul le premier passage est traité.
export async function claimEvent(mid: string) {
  const db = database();
  await db.query("DELETE FROM messenger_event WHERE received_at < now() - interval '2 days'");
  const result = await db.query("INSERT INTO messenger_event (mid) VALUES ($1) ON CONFLICT DO NOTHING", [mid]);
  return result.rowCount === 1;
}

export async function loadConversation(psid: string): Promise<Conversation> {
  const db = database();
  // Un brouillon abandonné depuis 24 h est effacé ; seule la langue choisie est gardée.
  await db.query("UPDATE messenger_conversation SET step = 'idle', draft = '{}'::jsonb WHERE step <> 'idle' AND updated_at < now() - interval '24 hours'");
  const result = await db.query<{ step: Conversation["step"]; draft: Conversation["draft"]; language: string | null }>(
    "SELECT step, draft, language FROM messenger_conversation WHERE psid = $1",
    [psid],
  );
  const row = result.rows[0];
  const language = isLanguage(row?.language) ? row.language : undefined;
  return row && STEPS.includes(row.step) ? { step: row.step, draft: row.draft, language } : { step: "idle", draft: {}, language };
}

export async function saveConversation(psid: string, conversation: Conversation) {
  await database().query(
    `INSERT INTO messenger_conversation (psid, step, draft, language, updated_at) VALUES ($1, $2, $3, $4, now())
     ON CONFLICT (psid) DO UPDATE SET step = EXCLUDED.step, draft = EXCLUDED.draft, language = EXCLUDED.language, updated_at = now()`,
    [psid, conversation.step, JSON.stringify(conversation.draft), conversation.language ?? null],
  );
}

export async function createSignalement(psid: string, draft: CompleteDraft, language: Language) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const code = newCode();
    const result = await database().query(
      `INSERT INTO signalement (code, kind, theme, content, seen_on, region, attachment_count, language, reporter_psid)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) ON CONFLICT (code) DO NOTHING`,
      [code, draft.kind, draft.theme, draft.content, draft.seenOn ?? null, draft.region ?? null, draft.attachmentCount ?? 0, language, psid],
    );
    if (result.rowCount === 1) return code;
  }
  throw new Error("Impossible d’attribuer un code de suivi.");
}

// Un signaleur ne voit que ses propres signalements.
export async function listSignalements(psid: string) {
  const result = await database().query<SummaryRow>(
    "SELECT code, theme, status, created_at FROM signalement WHERE reporter_psid = $1 ORDER BY created_at DESC LIMIT 3",
    [psid],
  );
  return result.rows.map(toSummary);
}

export async function findSignalement(psid: string, code: string) {
  const result = await database().query<SummaryRow>(
    "SELECT code, theme, status, created_at FROM signalement WHERE reporter_psid = $1 AND code = $2",
    [psid, code],
  );
  return result.rows[0] ? toSummary(result.rows[0]) : null;
}
