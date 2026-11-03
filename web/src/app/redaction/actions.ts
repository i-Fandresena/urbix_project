"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseSources } from "@/lib/sources";
import { REPORT_STATUSES, REPORT_VERDICTS, type ReportStatus, type ReportVerdict } from "@/lib/reports";
import { canSeeReport, EDITORIAL_ROLES, isManager, listJournalists, listOrganizations, requireRole } from "@/lib/staff";
import { assignCase, detachMember, getCase, referCase, saveDecision } from "@/lib/workflow";

function textField(formData: FormData, name: string, maxLength: number) {
  const value = formData.get(name);
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

// Chaque action revérifie le rôle et la visibilité du dossier : le formulaire affiché ne vaut pas autorisation.
async function editableCase(formData: FormData) {
  const id = textField(formData, "id", 36);
  if (!/^[0-9a-f-]{36}$/i.test(id)) redirect("/redaction?error=missing");
  const context = await requireRole(EDITORIAL_ROLES, `/redaction/dossiers/${id}`);
  const report = await getCase(id);
  if (!report || report.cluster_id) redirect("/redaction?error=missing");
  if (!canSeeReport(context.member, report)) redirect("/espace?refus=1");
  return { id, member: context.member, report };
}

function done(id: string, saved: string) {
  revalidatePath("/redaction");
  revalidatePath("/verifications");
  redirect(`/redaction/dossiers/${id}?saved=${saved}`);
}

export async function saveEditorialDecision(formData: FormData) {
  const { id, member } = await editableCase(formData);
  const status = textField(formData, "status", 24);
  const verdictValue = textField(formData, "verdict", 24);
  const rationale = textField(formData, "rationale", 1200);
  const correction = textField(formData, "correction", 1200);
  const publicAssertion = textField(formData, "publicAssertion", 500);
  const sources = parseSources(textField(formData, "sources", 16000));
  const errorUrl = `/redaction/dossiers/${id}?error=invalid`;

  if (!(REPORT_STATUSES as readonly string[]).includes(status) || !sources) redirect(errorUrl);
  if (verdictValue && !(REPORT_VERDICTS as readonly string[]).includes(verdictValue)) redirect(errorUrl);
  if (status === "verified" && (!verdictValue || rationale.length < 20 || correction.length < 24 || sources.length === 0 || publicAssertion.length < 12)) redirect(errorUrl);

  let ok = false;
  try {
    ok = (await saveDecision({ id, status: status as ReportStatus, verdict: (verdictValue || null) as ReportVerdict | null, rationale, correction, sources, publicAssertion }, member.email)).ok;
  } catch {
    redirect(`/redaction/dossiers/${id}?error=save`);
  }
  if (!ok) redirect("/redaction?error=missing");
  revalidatePath("/suivi");
  done(id, "decision");
}

export async function assignCaseAction(formData: FormData) {
  const { id, member } = await editableCase(formData);
  const assignee = textField(formData, "assignee", 254).toLowerCase() || null;
  if (isManager(member)) {
    const allowed = new Set([member.email, ...(await listJournalists()).map((item) => item.email)]);
    if (assignee && !allowed.has(assignee)) redirect(`/redaction/dossiers/${id}?error=invalid`);
  } else if (assignee !== member.email) {
    redirect(`/redaction/dossiers/${id}?error=invalid`);
  }
  await assignCase(id, assignee, member.email);
  done(id, "assign");
}

export async function referCaseAction(formData: FormData) {
  const { id, member } = await editableCase(formData);
  const organization = textField(formData, "organization", 120);
  const summary = textField(formData, "summary", 1200);
  if (summary.length < 30 || !(await listOrganizations()).includes(organization)) redirect(`/redaction/dossiers/${id}?error=invalid`);
  await referCase(id, organization, summary, member.email);
  done(id, "refer");
}

export async function detachMemberAction(formData: FormData) {
  const root = textField(formData, "root", 36);
  const memberId = textField(formData, "id", 36);
  const rootForm = new FormData();
  rootForm.set("id", root);
  const { member } = await editableCase(rootForm);
  if (!/^[0-9a-f-]{36}$/i.test(memberId)) redirect(`/redaction/dossiers/${root}?error=invalid`);
  if (!(await detachMember(memberId, root, member.email))) redirect(`/redaction/dossiers/${root}?error=invalid`);
  done(root, "detach");
}
