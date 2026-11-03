"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getEditorialSession } from "@/lib/report-access";
import { REPORT_STATUSES, REPORT_VERDICTS, updateEditorialReport, type ReportSource, type ReportStatus, type ReportVerdict } from "@/lib/reports";

function textField(formData: FormData, name: string, maxLength: number) {
  const value = formData.get(name);
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function parseSources(value: string): ReportSource[] | null {
  const lines = value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length > 8) return null;
  const sources: ReportSource[] = [];
  for (const line of lines) {
    try {
      const url = new URL(line);
      if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) return null;
      if (sources.some((source) => source.url === url.toString())) continue;
      sources.push({ title: url.hostname, url: url.toString() });
    } catch {
      return null;
    }
  }
  return sources;
}

export async function saveEditorialDecision(formData: FormData) {
  const session = await getEditorialSession();
  if (!session) redirect("/connexion?next=%2Fredaction");

  const id = textField(formData, "id", 36);
  const status = textField(formData, "status", 24);
  const verdictValue = textField(formData, "verdict", 24);
  const rationale = textField(formData, "rationale", 1200);
  const correction = textField(formData, "correction", 1200);
  const sources = parseSources(textField(formData, "sources", 16000));
  const errorUrl = `/redaction/dossiers/${encodeURIComponent(id)}?error=invalid`;

  if (!/^[0-9a-f-]{36}$/i.test(id) || !(REPORT_STATUSES as readonly string[]).includes(status) || !sources) redirect(errorUrl);
  if (verdictValue && !(REPORT_VERDICTS as readonly string[]).includes(verdictValue)) redirect(errorUrl);
  if (status === "verified" && (!verdictValue || rationale.length < 20 || correction.length < 24 || sources.length === 0)) redirect(errorUrl);

  let updated = false;
  try {
    updated = await updateEditorialReport({
      id,
      status: status as ReportStatus,
      verdict: (verdictValue || null) as ReportVerdict | null,
      rationale,
      correction,
      sources,
    }, session.user.email ?? "rédaction");
  } catch {
    redirect(`/redaction/dossiers/${encodeURIComponent(id)}?error=save`);
  }
  if (!updated) redirect(`/redaction?error=missing`);

  revalidatePath("/redaction");
  revalidatePath(`/redaction/dossiers/${id}`);
  revalidatePath("/suivi");
  redirect(`/redaction/dossiers/${id}?saved=1`);
}
