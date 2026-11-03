import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

// Pool partagé par Better Auth et les signalements Messenger.
export const pool = databaseUrl ? new Pool({
  connectionString: databaseUrl,
  max: 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
}) : null;
