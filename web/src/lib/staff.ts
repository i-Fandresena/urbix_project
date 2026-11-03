import "server-only";
import { redirect } from "next/navigation";
import { getAuthSession } from "@/lib/auth";
import { requireReportsPool, REPORT_THEMES, type ReportTheme } from "@/lib/reports";

export const STAFF_ROLES = ["admin", "chief", "journalist", "correspondent", "organization"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];
export const EDITORIAL_ROLES: readonly StaffRole[] = ["admin", "chief", "journalist"];
export const MANAGER_ROLES: readonly StaffRole[] = ["admin", "chief"];

export type StaffMember = {
  email: string;
  role: StaffRole;
  displayName: string | null;
  rubrics: ReportTheme[];
  organization: string | null;
  active: boolean;
  source: "env" | "database";
};

type StaffRow = { email: string; role: StaffRole; display_name: string | null; rubrics: string[]; organization: string | null; active: boolean };

function envList(name: string) {
  return (process.env[name] ?? "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
}

function toMember(row: StaffRow): StaffMember {
  return {
    email: row.email,
    role: row.role,
    displayName: row.display_name,
    rubrics: row.rubrics.filter((theme): theme is ReportTheme => (REPORT_THEMES as readonly string[]).includes(theme)),
    organization: row.organization,
    active: row.active,
    source: "database",
  };
}

// LAVERTA_ADMIN_EMAILS reste prioritaire : l’interface ne peut pas retirer l’accès de l’administrateur d’amorçage.
export async function getStaffMember(email: string | null | undefined): Promise<StaffMember | null> {
  const normalized = email?.trim().toLowerCase();
  if (!normalized) return null;
  if (envList("LAVERTA_ADMIN_EMAILS").includes(normalized)) {
    return { email: normalized, role: "admin", displayName: null, rubrics: [], organization: null, active: true, source: "env" };
  }
  const result = await requireReportsPool().query<StaffRow>(
    "SELECT email, role, display_name, rubrics, organization, active FROM laverta_staff WHERE email = $1",
    [normalized],
  );
  const row = result.rows[0];
  if (row) return row.active ? toMember(row) : null;
  if (envList("LAVERTA_EDITOR_EMAILS").includes(normalized)) {
    return { email: normalized, role: "chief", displayName: null, rubrics: [], organization: null, active: true, source: "env" };
  }
  return null;
}

export type StaffContext = { session: NonNullable<Awaited<ReturnType<typeof getAuthSession>>>; member: StaffMember | null };

// Session Better Auth validée côté serveur ; en production, l’adresse doit être vérifiée avant tout rôle.
export async function getStaffContext(): Promise<StaffContext | null> {
  const session = await getAuthSession();
  if (!session) return null;
  const verified = process.env.NODE_ENV !== "production" || session.user.emailVerified === true;
  return { session, member: verified ? await getStaffMember(session.user.email) : null };
}

export async function requireRole(roles: readonly StaffRole[], nextPath: string) {
  const context = await getStaffContext();
  if (!context) redirect(`/connexion?next=${encodeURIComponent(nextPath)}`);
  if (!context.member || !roles.includes(context.member.role)) redirect("/espace?refus=1");
  return context as StaffContext & { member: StaffMember };
}

export function homeForRole(role: StaffRole) {
  if (role === "organization") return "/organisme";
  if (role === "correspondent") return "/correspondant";
  return "/redaction";
}

export function isManager(member: StaffMember) {
  return MANAGER_ROLES.includes(member.role);
}

// Un journaliste voit sa rubrique et ses dossiers attribués ; sans rubrique, il voit toute la file.
export function canSeeReport(member: StaffMember, report: { theme: string; assigned_to: string | null }) {
  if (isManager(member)) return true;
  if (member.role !== "journalist") return false;
  if (report.assigned_to === member.email) return true;
  return member.rubrics.length === 0 || member.rubrics.includes(report.theme as ReportTheme);
}

export async function listStaff() {
  const result = await requireReportsPool().query<StaffRow & { created_at: Date }>(
    "SELECT email, role, display_name, rubrics, organization, active, created_at FROM laverta_staff ORDER BY role, email",
  );
  return result.rows;
}

export async function listOrganizations() {
  const result = await requireReportsPool().query<{ organization: string }>(
    "SELECT DISTINCT organization FROM laverta_staff WHERE role = 'organization' AND active AND organization IS NOT NULL ORDER BY organization",
  );
  return result.rows.map((row) => row.organization);
}

export async function listJournalists() {
  const result = await requireReportsPool().query<{ email: string; display_name: string | null }>(
    "SELECT email, display_name FROM laverta_staff WHERE role IN ('journalist', 'chief', 'admin') AND active ORDER BY email",
  );
  return result.rows;
}

export type StaffInput = { email: string; role: StaffRole; displayName: string | null; rubrics: ReportTheme[]; organization: string | null; active: boolean };

export async function upsertStaff(input: StaffInput, actorEmail: string) {
  const client = await requireReportsPool().connect();
  try {
    await client.query("BEGIN");
    const before = await client.query("SELECT role, display_name, rubrics, organization, active FROM laverta_staff WHERE email = $1 FOR UPDATE", [input.email]);
    await client.query(
      `INSERT INTO laverta_staff (email, role, display_name, rubrics, organization, active, invited_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (email) DO UPDATE SET role = EXCLUDED.role, display_name = EXCLUDED.display_name, rubrics = EXCLUDED.rubrics,
         organization = EXCLUDED.organization, active = EXCLUDED.active, updated_at = now()`,
      [input.email, input.role, input.displayName, input.rubrics, input.organization, input.active, actorEmail],
    );
    await client.query(
      "INSERT INTO laverta_staff_audit (actor_email, target_email, action, before_state, after_state) VALUES ($1, $2, $3, $4::jsonb, $5::jsonb)",
      [actorEmail, input.email, before.rows[0] ? "update" : "invite", JSON.stringify(before.rows[0] ?? null), JSON.stringify(input)],
    );
    await client.query("COMMIT");
    return !before.rows[0];
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
