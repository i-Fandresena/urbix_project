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

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL manque dans .env.local.");
  process.exit(1);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  await client.query(schema);
  console.log("Tables des signalements Messenger prêtes.");
} finally {
  await client.end();
}
