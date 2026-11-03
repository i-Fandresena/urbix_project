import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { isEmailDeliveryConfigured } from "@/lib/auth-config";
import { requireReportsPool } from "@/lib/reports";

declare global {
  // eslint-disable-next-line no-var
  var lavertaMailer: Transporter | undefined;
}

// Notifications de service (invitation, attribution, pic, réponse d’organisme). Sans SMTP, elles sont ignorées.
export async function sendMail(to: string, subject: string, text: string) {
  if (!isEmailDeliveryConfigured() || !process.env.AUTH_SMTP_URL || !process.env.AUTH_EMAIL_FROM) return false;
  globalThis.lavertaMailer ??= nodemailer.createTransport(process.env.AUTH_SMTP_URL);
  await globalThis.lavertaMailer.sendMail({ from: process.env.AUTH_EMAIL_FROM, to, subject, text: `${text}\n\n— Laverta · La correction doit suivre la rumeur.` });
  return true;
}

export async function managerEmails() {
  const env = (process.env.LAVERTA_ADMIN_EMAILS ?? "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
  const result = await requireReportsPool().query<{ email: string }>("SELECT email FROM laverta_staff WHERE role IN ('admin', 'chief') AND active");
  return [...new Set([...env, ...result.rows.map((row) => row.email)])];
}
