"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseSources } from "@/lib/sources";
import { requireRole } from "@/lib/staff";
import { respondAsOrg } from "@/lib/workflow";

export async function respondAction(formData: FormData) {
  const id = String(formData.get("id") ?? "").slice(0, 36);
  if (!/^[0-9a-f-]{36}$/i.test(id)) redirect("/organisme");
  const { member } = await requireRole(["organization"], `/organisme/dossiers/${id}`);
  const status = formData.get("status") === "done" ? "done" : "in_progress";
  const response = String(formData.get("response") ?? "").trim().slice(0, 2000);
  const links = parseSources(String(formData.get("links") ?? "").slice(0, 8000));
  if (!member.organization || response.length < 10 || !links) redirect(`/organisme/dossiers/${id}?error=invalid`);
  if (!(await respondAsOrg(id, member.organization, status, response, links, member.email))) redirect("/organisme");
  revalidatePath("/organisme");
  redirect(`/organisme/dossiers/${id}?saved=1`);
}
