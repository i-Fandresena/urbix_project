"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { sendMail } from "@/lib/mailer";
import { REPORT_THEMES, type ReportTheme } from "@/lib/reports";
import { requireRole, STAFF_ROLES, upsertStaff, type StaffRole } from "@/lib/staff";

function text(formData: FormData, name: string, max: number) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function saveStaffAction(formData: FormData) {
  const { member } = await requireRole(["admin"], "/admin");
  const email = text(formData, "email", 254).toLowerCase();
  const role = text(formData, "role", 20);
  const organization = text(formData, "organization", 120) || null;
  const rubrics = formData.getAll("rubrics").filter((value): value is ReportTheme => typeof value === "string" && (REPORT_THEMES as readonly string[]).includes(value));
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !(STAFF_ROLES as readonly string[]).includes(role)) redirect("/admin?error=invalid");
  if (role === "organization" && !organization) redirect("/admin?error=organization");
  if (email === member.email && role !== "admin") redirect("/admin?error=self");

  const created = await upsertStaff({
    email,
    role: role as StaffRole,
    displayName: text(formData, "displayName", 80) || null,
    rubrics: role === "journalist" ? rubrics : [],
    organization: role === "organization" ? organization : null,
    active: formData.get("active") !== "off",
  }, member.email);

  let mailed = false;
  if (created) {
    const base = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
    mailed = await sendMail(email, "Invitation à rejoindre Laverta",
      `${member.email} vous invite sur Laverta.\n\nCréez votre compte avec cette adresse exacte (${email}), puis confirmez-la depuis l’e-mail reçu :\n${base}/connexion?invitation=1&next=%2Fespace\n\nSi vous ne connaissez pas Laverta, ignorez ce message.`).catch(() => false);
  }
  revalidatePath("/admin");
  redirect(`/admin?saved=${created ? (mailed ? "invited" : "created") : "updated"}`);
}
