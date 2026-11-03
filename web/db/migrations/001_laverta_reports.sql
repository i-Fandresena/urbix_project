CREATE TABLE IF NOT EXISTS laverta_reports (
  id UUID PRIMARY KEY,
  tracking_hash CHAR(64) NOT NULL UNIQUE,
  tracking_hint CHAR(4) NOT NULL,
  assertion TEXT NOT NULL CHECK (char_length(assertion) BETWEEN 12 AND 500),
  context TEXT NOT NULL DEFAULT '' CHECK (char_length(context) <= 1200),
  theme TEXT NOT NULL CHECK (theme IN ('education', 'agriculture', 'health', 'economy', 'politics', 'safety', 'other')),
  language TEXT NOT NULL CHECK (language IN ('fr', 'mg', 'en')),
  source_url TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_review', 'referred', 'verified', 'closed')),
  verdict TEXT CHECK (verdict IN ('false', 'true', 'misleading', 'unverifiable')),
  rationale TEXT,
  correction TEXT,
  sources JSONB NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(sources) = 'array'),
  media_ciphertext BYTEA,
  media_nonce BYTEA,
  media_tag BYTEA,
  media_mime_type TEXT CHECK (media_mime_type IN ('image/jpeg', 'image/png', 'image/webp')),
  media_size INTEGER CHECK (media_size IS NULL OR media_size BETWEEN 1 AND 5242880),
  media_sha256 CHAR(64),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '30 days'),
  CONSTRAINT laverta_report_media_fields_together CHECK (
    (media_ciphertext IS NULL AND media_nonce IS NULL AND media_tag IS NULL AND media_mime_type IS NULL AND media_size IS NULL AND media_sha256 IS NULL)
    OR
    (media_ciphertext IS NOT NULL AND media_nonce IS NOT NULL AND media_tag IS NOT NULL AND media_mime_type IS NOT NULL AND media_size IS NOT NULL AND media_sha256 IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS laverta_reports_queue_idx ON laverta_reports (status, submitted_at DESC);
CREATE INDEX IF NOT EXISTS laverta_reports_expiry_idx ON laverta_reports (expires_at);

CREATE TABLE IF NOT EXISTS laverta_report_audit (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES laverta_reports(id) ON DELETE CASCADE,
  actor_email TEXT NOT NULL,
  action TEXT NOT NULL,
  before_state JSONB NOT NULL,
  after_state JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS laverta_report_audit_report_idx ON laverta_report_audit (report_id, created_at DESC);
