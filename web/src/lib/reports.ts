import "server-only";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { Pool, type PoolClient } from "pg";

export const REPORT_STATUSES = ["new", "in_review", "referred", "verified", "closed"] as const;
export type ReportStatus = (typeof REPORT_STATUSES)[number];
export const REPORT_VERDICTS = ["false", "true", "misleading", "unverifiable"] as const;
export type ReportVerdict = (typeof REPORT_VERDICTS)[number];
export const REPORT_THEMES = ["education", "agriculture", "health", "economy", "politics", "safety", "other"] as const;
export type ReportTheme = (typeof REPORT_THEMES)[number];
export const REPORT_LANGUAGES = ["fr", "mg", "en"] as const;
export type ReportLanguage = (typeof REPORT_LANGUAGES)[number];

export type ReportSource = { title: string; url: string };
export type NewReport = {
  assertion: string;
  context: string;
  theme: ReportTheme;
  language: ReportLanguage;
  sourceUrl: string | null;
  media: {
    ciphertext: Buffer;
    nonce: Buffer;
    tag: Buffer;
    mimeType: string;
    size: number;
    sha256: string;
  } | null;
};

export type ReportRow = {
  id: string;
  tracking_hint: string;
  assertion: string;
  context: string;
  theme: ReportTheme;
  language: ReportLanguage;
  source_url: string | null;
  status: ReportStatus;
  verdict: ReportVerdict | null;
  rationale: string | null;
  correction: string | null;
  sources: ReportSource[];
  media_mime_type: string | null;
  media_size: number | null;
  media_sha256: string | null;
  submitted_at: Date;
  updated_at: Date;
  published_at: Date | null;
  expires_at: Date;
};

declare global {
  // eslint-disable-next-line no-var
  var lavertaReportsPool: Pool | undefined;
  // eslint-disable-next-line no-var
  var lavertaReportExpiryTimer: ReturnType<typeof setInterval> | undefined;
}

const connectionString = process.env.DATABASE_URL;
const pool = connectionString
  ? (globalThis.lavertaReportsPool ??= new Pool({ connectionString, max: 5, idleTimeoutMillis: 30_000, connectionTimeoutMillis: 5_000 }))
  : null;

if (pool && !globalThis.lavertaReportExpiryTimer) {
  globalThis.lavertaReportExpiryTimer = setInterval(() => {
    void pool.query("DELETE FROM laverta_reports WHERE expires_at <= now()").catch(() => undefined);
  }, 6 * 60 * 60 * 1000);
  globalThis.lavertaReportExpiryTimer.unref();
}

export function requireReportsPool() {
  if (!pool) throw new Error("La base PostgreSQL n’est pas configurée.");
  return pool;
}

export function normalizeTrackingCode(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

export function isTrackingCode(value: string) {
  return /^LV-[A-F0-9]{20}$/.test(normalizeTrackingCode(value));
}

function trackingHash(code: string) {
  return createHash("sha256").update(normalizeTrackingCode(code)).digest("hex");
}

export async function purgeExpiredReports() {
  await requireReportsPool().query("DELETE FROM laverta_reports WHERE expires_at <= now()");
}

export async function createReport(input: NewReport) {
  const db = requireReportsPool();
  const code = `LV-${randomBytes(10).toString("hex").toUpperCase()}`;
  const id = randomUUID();
  await db.query(
    `INSERT INTO laverta_reports (
      id, tracking_hash, tracking_hint, assertion, context, theme, language, source_url,
      media_ciphertext, media_nonce, media_tag, media_mime_type, media_size, media_sha256
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
    [
      id,
      trackingHash(code),
      code.slice(-4),
      input.assertion,
      input.context,
      input.theme,
      input.language,
      input.sourceUrl,
      input.media?.ciphertext ?? null,
      input.media?.nonce ?? null,
      input.media?.tag ?? null,
      input.media?.mimeType ?? null,
      input.media?.size ?? null,
      input.media?.sha256 ?? null,
    ],
  );
  return code;
}

export async function findPublicReport(code: string) {
  if (!isTrackingCode(code)) return null;
  const db = requireReportsPool();
  const hash = trackingHash(code);
  const result = await db.query<{
    assertion: string;
    theme: ReportTheme;
    status: ReportStatus;
    verdict: ReportVerdict | null;
    correction: string | null;
    sources: ReportSource[];
    has_media: boolean;
    submitted_at: Date;
    updated_at: Date;
    published_at: Date | null;
  }>(
    `SELECT assertion, theme, status,
      CASE WHEN published_at IS NOT NULL THEN verdict ELSE NULL END AS verdict,
      CASE WHEN published_at IS NOT NULL THEN correction ELSE NULL END AS correction,
      CASE WHEN published_at IS NOT NULL THEN sources ELSE '[]'::jsonb END AS sources,
      media_ciphertext IS NOT NULL AS has_media, submitted_at, updated_at, published_at
     FROM laverta_reports WHERE tracking_hash = $1 AND expires_at > now()`,
    [hash],
  );
  return result.rows[0] ?? null;
}

export async function erasePublicReport(code: string) {
  if (!isTrackingCode(code)) return false;
  const result = await requireReportsPool().query(
    "DELETE FROM laverta_reports WHERE tracking_hash = $1 AND expires_at > now() RETURNING id",
    [trackingHash(code)],
  );
  return result.rowCount === 1;
}

export async function listEditorialReports() {
  const db = requireReportsPool();
  await purgeExpiredReports();
  const result = await db.query<ReportRow>(
    `SELECT id, tracking_hint, assertion, context, theme, language, source_url, status, verdict,
      rationale, correction, sources, media_mime_type, media_size, media_sha256,
      submitted_at, updated_at, published_at, expires_at
     FROM laverta_reports ORDER BY
       CASE status WHEN 'new' THEN 0 WHEN 'in_review' THEN 1 WHEN 'referred' THEN 2 WHEN 'verified' THEN 3 ELSE 4 END,
       submitted_at DESC LIMIT 100`,
  );
  return result.rows;
}

export async function getEditorialReport(id: string) {
  const db = requireReportsPool();
  await purgeExpiredReports();
  const result = await db.query<ReportRow>(
    `SELECT id, tracking_hint, assertion, context, theme, language, source_url, status, verdict,
      rationale, correction, sources, media_mime_type, media_size, media_sha256,
      submitted_at, updated_at, published_at, expires_at
     FROM laverta_reports WHERE id = $1`,
    [id],
  );
  return result.rows[0] ?? null;
}

export async function getEncryptedReportMedia(id: string) {
  const result = await requireReportsPool().query<{
    media_ciphertext: Buffer;
    media_nonce: Buffer;
    media_tag: Buffer;
    media_mime_type: string;
    media_sha256: string;
  }>(
    `SELECT media_ciphertext, media_nonce, media_tag, media_mime_type, media_sha256
     FROM laverta_reports WHERE id = $1 AND expires_at > now() AND media_ciphertext IS NOT NULL`,
    [id],
  );
  return result.rows[0] ?? null;
}

export type EditorialUpdate = {
  id: string;
  status: ReportStatus;
  verdict: ReportVerdict | null;
  rationale: string;
  correction: string;
  sources: ReportSource[];
};

export async function updateEditorialReport(input: EditorialUpdate, actorEmail: string) {
  const db = requireReportsPool();
  const client: PoolClient = await db.connect();
  try {
    await client.query("BEGIN");
    const beforeResult = await client.query<{ status: ReportStatus; verdict: ReportVerdict | null; rationale: string | null; correction: string | null; sources: ReportSource[] }>(
      "SELECT status, verdict, rationale, correction, sources FROM laverta_reports WHERE id = $1 AND expires_at > now() FOR UPDATE",
      [input.id],
    );
    const before = beforeResult.rows[0];
    if (!before) {
      await client.query("ROLLBACK");
      return false;
    }
    await client.query(
      `UPDATE laverta_reports SET status = $2, verdict = $3, rationale = $4, correction = $5,
        sources = $6::jsonb, updated_at = now(),
        published_at = CASE
          WHEN $2 = 'verified' THEN COALESCE(published_at, now())
          WHEN $2 IN ('new', 'in_review', 'referred') THEN NULL
          ELSE published_at
        END
       WHERE id = $1`,
      [input.id, input.status, input.verdict, input.rationale || null, input.correction || null, JSON.stringify(input.sources)],
    );
    await client.query(
      `INSERT INTO laverta_report_audit (report_id, actor_email, action, before_state, after_state)
       VALUES ($1, $2, 'editorial_update', $3::jsonb, $4::jsonb)`,
      [
        input.id,
        actorEmail,
        JSON.stringify({ status: before.status, verdict: before.verdict, rationale: before.rationale, correction: before.correction, sources: before.sources }),
        JSON.stringify({ status: input.status, verdict: input.verdict, rationale: input.rationale || null, correction: input.correction || null, sources: input.sources }),
      ],
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

export async function getEditorialMediaBytes(row: NonNullable<Awaited<ReturnType<typeof getEncryptedReportMedia>>>) {
  const { decryptReportMedia } = await import("@/lib/report-media");
  const bytes = decryptReportMedia(row.media_ciphertext, row.media_nonce, row.media_tag);
  const digest = createHash("sha256").update(bytes).digest("hex");
  if (digest !== row.media_sha256) throw new Error("L’empreinte du média ne correspond pas au fichier enregistré.");
  return bytes;
}
