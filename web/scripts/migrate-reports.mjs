import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import pg from "pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  process.stderr.write("DATABASE_URL manque. Copiez .env.example vers .env.local et configurez PostgreSQL.\n");
  process.exit(1);
}

const migrationPath = resolve(process.cwd(), "db/migrations/001_laverta_reports.sql");
const migration = await readFile(migrationPath, "utf8");
const pool = new pg.Pool({ connectionString, max: 1, connectionTimeoutMillis: 5_000 });

try {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query(migration);
    await client.query("COMMIT");
    process.stdout.write("Schéma de signalements Laverta appliqué.\n");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
} finally {
  await pool.end();
}
