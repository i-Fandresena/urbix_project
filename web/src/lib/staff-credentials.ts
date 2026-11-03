import "server-only";
import sharp from "sharp";
import { createHash, timingSafeEqual } from "node:crypto";
import { isInvitedEmail } from "@/lib/invitations";
import { decryptReportMedia, encryptReportMedia } from "@/lib/report-media";
import { requireReportsPool } from "@/lib/reports";

// Justificatifs d’inscription (carte de presse, matricule) : documents personnels sensibles.
// Lecture et suppression réservées aux administrateurs ; aucun contenu n’est journalisé.
export const MAX_CARD_BYTES = 5 * 1024 * 1024;
export const MAX_MATRICULE_LENGTH = 60;
export const CREDENTIAL_WINDOW_MINUTES = 15;
const IMAGE_MIME_TYPES: Record<string, string> = { jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };
const ACCEPTED_DECLARED_TYPES = new Set(["", "image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"]);

export type PreparedCard = { ciphertext: Buffer; nonce: Buffer; tag: Buffer; mimeType: string; size: number; sha256: string };

export function normalizeMatricule(value: string) {
  const trimmed = value.trim().replace(/\s+/g, " ");
  if (!trimmed) return null;
  if (trimmed.length > MAX_MATRICULE_LENGTH || !/^[\p{L}\p{N} ./_#-]+$/u.test(trimmed)) throw new Error("MATRICULE_INVALID");
  return trimmed;
}

// Le type est déterminé par le contenu : sharp pour les images, signature %PDF- pour les PDF.
export async function prepareCard(file: File): Promise<PreparedCard> {
  if (file.size <= 0 || file.size > MAX_CARD_BYTES) throw new Error("CARD_TOO_LARGE");
  if (!ACCEPTED_DECLARED_TYPES.has(file.type)) throw new Error("CARD_UNSUPPORTED");
  const bytes = Buffer.from(await file.arrayBuffer());
  if (bytes.byteLength > MAX_CARD_BYTES) throw new Error("CARD_TOO_LARGE");
  let mimeType: string | undefined;
  if (bytes.subarray(0, 5).toString("latin1") === "%PDF-") {
    mimeType = "application/pdf";
  } else {
    try {
      const metadata = await sharp(bytes, { limitInputPixels: 40_000_000, failOn: "error" }).metadata();
      mimeType = metadata.format ? IMAGE_MIME_TYPES[metadata.format] : undefined;
    } catch {
      throw new Error("CARD_INVALID");
    }
  }
  if (!mimeType) throw new Error("CARD_UNSUPPORTED");
  const declared = file.type === "image/jpg" ? "image/jpeg" : file.type;
  if (declared && declared !== mimeType) throw new Error("CARD_MISMATCH");
  return { ...encryptReportMedia(bytes), mimeType, size: bytes.byteLength, sha256: createHash("sha256").update(bytes).digest("hex") };
}

type StoreInput = { email: string; userId: string; matricule: string | null; card: PreparedCard | null };

/**
 * Enregistre le justificatif uniquement si : un compte Better Auth correspond à l’adresse et à l’identifiant
 * renvoyé par l’inscription, il a été créé il y a moins de 15 minutes, l’adresse est invitée et aucun justificatif
 * n’existe encore. Renvoie false sans détail dans tous les autres cas.
 */
export async function storeCredential(input: StoreInput) {
  const db = requireReportsPool();
  const user = await db.query<{ id: string }>(
    `SELECT id FROM "user" WHERE email = $1 AND id = $2 AND "createdAt" > now() - make_interval(mins => $3)`,
    [input.email, input.userId, CREDENTIAL_WINDOW_MINUTES],
  );
  if (!user.rows[0] || !(await isInvitedEmail(input.email))) return false;
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    const inserted = await client.query(
      `INSERT INTO laverta_staff_credentials (email, user_id, matricule, card_ciphertext, card_nonce, card_tag, card_mime_type, card_size, card_sha256, consent_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, now())
       ON CONFLICT (email) DO NOTHING RETURNING email`,
      [input.email, input.userId, input.matricule, input.card?.ciphertext ?? null, input.card?.nonce ?? null, input.card?.tag ?? null,
        input.card?.mimeType ?? null, input.card?.size ?? null, input.card?.sha256 ?? null],
    );
    if (!inserted.rows[0]) {
      await client.query("ROLLBACK");
      return false;
    }
    await client.query(
      "INSERT INTO laverta_staff_audit (actor_email, target_email, action, before_state, after_state) VALUES ($1, $1, 'credential_submit', NULL, $2::jsonb)",
      [input.email, JSON.stringify({ matricule: Boolean(input.matricule), card: input.card ? { mime: input.card.mimeType, size: input.card.size } : null, consent: true })],
    );
    await client.query("COMMIT");
    return true;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export type CredentialSummary = { email: string; matricule: string | null; card_mime_type: string | null; card_size: number | null; consent_at: Date; created_at: Date };

export async function listCredentialSummaries() {
  const result = await requireReportsPool().query<CredentialSummary>(
    "SELECT email, matricule, card_mime_type, card_size, consent_at, created_at FROM laverta_staff_credentials",
  );
  return new Map(result.rows.map((row) => [row.email, row]));
}

export async function readCredentialCard(email: string, actorEmail: string) {
  const db = requireReportsPool();
  const result = await db.query<{ card_ciphertext: Buffer; card_nonce: Buffer; card_tag: Buffer; card_mime_type: string; card_sha256: string }>(
    "SELECT card_ciphertext, card_nonce, card_tag, card_mime_type, card_sha256 FROM laverta_staff_credentials WHERE email = $1 AND card_ciphertext IS NOT NULL",
    [email],
  );
  const row = result.rows[0];
  if (!row) return null;
  const bytes = decryptReportMedia(row.card_ciphertext, row.card_nonce, row.card_tag);
  const digest = createHash("sha256").update(bytes).digest();
  if (!timingSafeEqual(digest, Buffer.from(row.card_sha256, "hex"))) throw new Error("CARD_INTEGRITY");
  await db.query(
    "INSERT INTO laverta_staff_audit (actor_email, target_email, action, before_state, after_state) VALUES ($1, $2, 'credential_view', NULL, NULL)",
    [actorEmail, email],
  );
  return { bytes, mimeType: row.card_mime_type };
}

export async function deleteCredential(email: string, actorEmail: string) {
  const client = await requireReportsPool().connect();
  try {
    await client.query("BEGIN");
    const deleted = await client.query<{ matricule: string | null; card_mime_type: string | null; card_size: number | null }>(
      "DELETE FROM laverta_staff_credentials WHERE email = $1 RETURNING matricule, card_mime_type, card_size",
      [email],
    );
    const row = deleted.rows[0];
    if (row) {
      // L’audit garde seulement la trace de l’existence, jamais le matricule ni le fichier.
      await client.query(
        "INSERT INTO laverta_staff_audit (actor_email, target_email, action, before_state, after_state) VALUES ($1, $2, 'credential_delete', $3::jsonb, NULL)",
        [actorEmail, email, JSON.stringify({ matricule: Boolean(row.matricule), card: row.card_mime_type ? { mime: row.card_mime_type, size: row.card_size } : null })],
      );
    }
    await client.query("COMMIT");
    return Boolean(row);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
