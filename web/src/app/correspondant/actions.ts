"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createReport, REPORT_LANGUAGES, REPORT_THEMES, type ReportLanguage, type ReportTheme } from "@/lib/reports";
import { requireRole } from "@/lib/staff";
import { processNewReport } from "@/lib/workflow";

function text(formData: FormData, name: string, max: number) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function submitCorrespondentReport(formData: FormData) {
  const { member } = await requireRole(["correspondent"], "/correspondant");
  const assertion = text(formData, "assertion", 500);
  const theme = text(formData, "theme", 20);
  const language = text(formData, "language", 2);
  const region = text(formData, "region", 80);
  const link = text(formData, "sourceUrl", 2000);
  let sourceUrl: string | null = null;
  if (link) {
    try {
      const url = new URL(link);
      if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) redirect("/correspondant?error=invalid");
      sourceUrl = url.toString();
    } catch {
      redirect("/correspondant?error=invalid");
    }
  }
  if (assertion.length < 12 || region.length < 2 || !(REPORT_THEMES as readonly string[]).includes(theme) || !(REPORT_LANGUAGES as readonly string[]).includes(language)) redirect("/correspondant?error=invalid");
  const { id } = await createReport({
    assertion,
    context: text(formData, "context", 1200),
    theme: theme as ReportTheme,
    language: language as ReportLanguage,
    sourceUrl,
    region,
    channel: "correspondent",
    submittedBy: member.email,
    media: null,
  });
  const match = await processNewReport(id).catch(() => null);
  revalidatePath("/correspondant");
  redirect(`/correspondant?saved=${match ? "instant" : "1"}`);
}
