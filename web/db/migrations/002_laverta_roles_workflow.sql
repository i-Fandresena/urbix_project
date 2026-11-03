-- Rôles, circuit éditorial complet, base publique et doublons. Migration additive uniquement.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Un rôle est attaché à une adresse : l’invitation précède la création du compte Better Auth.
CREATE TABLE IF NOT EXISTS laverta_staff (
  email TEXT PRIMARY KEY CHECK (email = lower(email) AND char_length(email) <= 254),
  role TEXT NOT NULL CHECK (role IN ('admin', 'chief', 'journalist', 'correspondent', 'organization')),
  display_name TEXT CHECK (display_name IS NULL OR char_length(display_name) <= 80),
  rubrics TEXT[] NOT NULL DEFAULT '{}',
  organization TEXT CHECK (organization IS NULL OR char_length(organization) <= 120),
  active BOOLEAN NOT NULL DEFAULT true,
  invited_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS laverta_staff_audit (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  actor_email TEXT NOT NULL,
  target_email TEXT NOT NULL,
  action TEXT NOT NULL,
  before_state JSONB,
  after_state JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE laverta_reports
  ADD COLUMN IF NOT EXISTS channel TEXT NOT NULL DEFAULT 'web' CHECK (channel IN ('web', 'messenger', 'correspondent')),
  ADD COLUMN IF NOT EXISTS region TEXT CHECK (region IS NULL OR char_length(region) <= 80),
  ADD COLUMN IF NOT EXISTS signalement_id BIGINT UNIQUE,
  ADD COLUMN IF NOT EXISTS submitted_by TEXT,
  ADD COLUMN IF NOT EXISTS assigned_to TEXT,
  ADD COLUMN IF NOT EXISTS cluster_id UUID REFERENCES laverta_reports(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS instant_publication_id UUID,
  ADD COLUMN IF NOT EXISTS referred_to TEXT,
  ADD COLUMN IF NOT EXISTS referral_summary TEXT CHECK (referral_summary IS NULL OR char_length(referral_summary) <= 1200),
  ADD COLUMN IF NOT EXISTS referred_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS org_status TEXT CHECK (org_status IS NULL OR org_status IN ('pending', 'in_progress', 'done')),
  ADD COLUMN IF NOT EXISTS org_response TEXT CHECK (org_response IS NULL OR char_length(org_response) <= 2000),
  ADD COLUMN IF NOT EXISTS org_links JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS org_responder TEXT,
  ADD COLUMN IF NOT EXISTS org_responded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS notified_count INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS peak_alerted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS laverta_reports_cluster_idx ON laverta_reports (cluster_id);
CREATE INDEX IF NOT EXISTS laverta_reports_referred_idx ON laverta_reports (referred_to) WHERE referred_to IS NOT NULL;
CREATE INDEX IF NOT EXISTS laverta_reports_assertion_trgm_idx ON laverta_reports USING gin (assertion gin_trgm_ops);

-- Vérifications publiées : sans donnée de signaleur, conservées après l’expiration des dossiers.
CREATE TABLE IF NOT EXISTS laverta_publications (
  id UUID PRIMARY KEY,
  report_id UUID UNIQUE REFERENCES laverta_reports(id) ON DELETE SET NULL,
  assertion TEXT NOT NULL,
  theme TEXT NOT NULL,
  region TEXT,
  verdict TEXT NOT NULL CHECK (verdict IN ('false', 'true', 'misleading', 'unverifiable')),
  rationale TEXT NOT NULL,
  correction TEXT NOT NULL,
  sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  first_reported_at TIMESTAMPTZ NOT NULL,
  report_count INTEGER NOT NULL DEFAULT 1,
  reach_count INTEGER NOT NULL DEFAULT 0,
  instant_answer_count INTEGER NOT NULL DEFAULT 0,
  published_by TEXT,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  withdrawn_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS laverta_publications_listing_idx ON laverta_publications (published_at DESC) WHERE withdrawn_at IS NULL;
CREATE INDEX IF NOT EXISTS laverta_publications_assertion_trgm_idx ON laverta_publications USING gin (assertion gin_trgm_ops);

INSERT INTO laverta_publications (id, report_id, assertion, theme, verdict, rationale, correction, sources, first_reported_at, published_at)
SELECT gen_random_uuid(), r.id, r.assertion, r.theme, r.verdict, COALESCE(r.rationale, ''), r.correction, r.sources, r.submitted_at, r.published_at
FROM laverta_reports r
WHERE r.status = 'verified' AND r.published_at IS NOT NULL AND r.verdict IS NOT NULL AND r.correction IS NOT NULL
ON CONFLICT (report_id) DO NOTHING;
