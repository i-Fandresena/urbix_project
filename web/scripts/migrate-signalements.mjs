import pg from "pg";

// Signalements Messenger : texte seulement, aucune image ni pièce jointe n’est stockée.
const schema = `
CREATE TABLE IF NOT EXISTS messenger_event (
  mid TEXT PRIMARY KEY,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS messenger_event_received_idx ON messenger_event (received_at);

CREATE TABLE IF NOT EXISTS messenger_conversation (
  psid TEXT PRIMARY KEY,
  step TEXT NOT NULL,
  draft JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS messenger_conversation_updated_idx ON messenger_conversation (updated_at);

CREATE TABLE IF NOT EXISTS signalement (
  id BIGSERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  channel TEXT NOT NULL DEFAULT 'messenger',
  kind TEXT NOT NULL CHECK (kind IN ('report', 'check')),
  theme TEXT NOT NULL,
  content TEXT NOT NULL,
  seen_on TEXT,
  region TEXT,
  attachment_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_review', 'forwarded', 'verified', 'closed')),
  reporter_psid TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS signalement_reporter_idx ON signalement (reporter_psid, created_at DESC);

-- Langue choisie dans le bot (fr, mg ou en), gardée d’une conversation à l’autre.
ALTER TABLE messenger_conversation ADD COLUMN IF NOT EXISTS language TEXT;
ALTER TABLE signalement ADD COLUMN IF NOT EXISTS language TEXT;
`;

// Les signalements du bot encore actifs rejoignent la file de rédaction (même requête que src/lib/messenger-bridge.ts).
const backfill = `
INSERT INTO laverta_reports (id, tracking_hash, tracking_hint, assertion, context, theme, language, channel, region, signalement_id, submitted_at, expires_at)
SELECT gen_random_uuid(), encode(sha256(convert_to('messenger:' || s.code, 'UTF8')), 'hex'), right(s.code, 4),
  CASE WHEN char_length(s.content) < 12 THEN s.content || ' · Messenger' ELSE left(s.content, 500) END,
  left(concat_ws(' · ', CASE WHEN s.kind = 'check' THEN 'Demande de vérification (Messenger)' ELSE 'Signalement (Messenger)' END, 'Vu sur : ' || s.seen_on, CASE WHEN s.attachment_count > 0 THEN s.attachment_count || ' fichier(s) non conservé(s)' END), 1200),
  CASE s.theme WHEN 'sante' THEN 'health' WHEN 'economie' THEN 'economy' WHEN 'politique' THEN 'politics' WHEN 'securite' THEN 'safety' WHEN 'education' THEN 'education' WHEN 'agriculture' THEN 'agriculture' ELSE 'other' END,
  CASE WHEN s.language IN ('fr', 'mg', 'en') THEN s.language ELSE 'mg' END,
  'messenger', left(s.region, 80), s.id, s.created_at, s.created_at + interval '30 days'
FROM signalement s
WHERE s.created_at > now() - interval '30 days'
  AND NOT EXISTS (SELECT 1 FROM laverta_reports r WHERE r.signalement_id = s.id)
ON CONFLICT DO NOTHING;
`;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL manque dans .env.local.");
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  await client.query(schema);
  const { rows } = await client.query("SELECT to_regclass('laverta_reports') IS NOT NULL AS ready, EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'laverta_reports' AND column_name = 'signalement_id') AS bridged");
  if (rows[0].ready && rows[0].bridged) {
    const result = await client.query(backfill);
    console.log(`Signalements Messenger ajoutés à la file de rédaction : ${result.rowCount}.`);
  }
  console.log("Tables des signalements Messenger prêtes.");
} finally {
  await client.end();
}
