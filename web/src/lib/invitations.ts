import { pool } from "@/lib/db";

// Pas de "server-only" ici : ce module est chargé par la configuration Better Auth (lib/auth.ts).
function envList(name: string) {
  return (process.env[name] ?? "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
}

/**
 * Inscription sur invitation : l’adresse doit figurer, active, dans laverta_staff,
 * ou dans LAVERTA_ADMIN_EMAILS / LAVERTA_EDITOR_EMAILS. Une ligne désactivée refuse l’inscription.
 */
export async function isInvitedEmail(email: string | null | undefined) {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) return false;
  if (envList("LAVERTA_ADMIN_EMAILS").includes(normalized)) return true;
  if (!pool) return false;
  const result = await pool.query<{ active: boolean }>("SELECT active FROM laverta_staff WHERE email = $1", [normalized]);
  if (result.rows[0]) return result.rows[0].active;
  return envList("LAVERTA_EDITOR_EMAILS").includes(normalized);
}
