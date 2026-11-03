import { betterAuth } from "better-auth";
import { Pool } from "pg";
import nodemailer from "nodemailer";
import { isEmailDeliveryConfigured, trustedOrigins } from "@/lib/auth-config";

const databaseUrl = process.env.DATABASE_URL;
const smtpUrl = process.env.AUTH_SMTP_URL;
const emailFrom = process.env.AUTH_EMAIL_FROM;
const emailDeliveryConfigured = isEmailDeliveryConfigured();
const smtp = emailDeliveryConfigured && smtpUrl ? nodemailer.createTransport(smtpUrl) : null;

const pool = databaseUrl ? new Pool({
  connectionString: databaseUrl,
  max: 5,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
}) : null;

async function sendAuthEmail(to: string, subject: string, text: string) {
  if (!smtp || !emailFrom) throw new Error("La livraison SMTP n’est pas configurée.");
  await smtp.sendMail({ from: emailFrom, to, subject, text });
}

export const auth = betterAuth({
  appName: "Laverta",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET ?? "local-build-only-secret-change-before-use-000000000000",
  trustedOrigins: trustedOrigins(),
  ...(pool ? { database: pool } : {}),
  rateLimit: {
    enabled: true,
    storage: "database",
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 12,
    maxPasswordLength: 128,
    requireEmailVerification: emailDeliveryConfigured,
    ...(emailDeliveryConfigured ? {
      sendResetPassword: async ({ user, url }: { user: { email: string }; url: string }) => {
        await sendAuthEmail(
          user.email,
          "Réinitialiser votre mot de passe Laverta",
          `Pour choisir un nouveau mot de passe, ouvrez ce lien : ${url}\n\nSi vous n’avez pas demandé cette réinitialisation, ignorez ce message.`,
        );
      },
    } : {}),
  },
  user: {
    additionalFields: {
      organization: { type: "string", required: false, input: true },
    },
  },
  ...(emailDeliveryConfigured ? {
    emailVerification: {
      sendOnSignUp: true,
      autoSignInAfterVerification: true,
      sendVerificationEmail: async ({ user, url }: { user: { email: string }; url: string }) => {
        await sendAuthEmail(
          user.email,
          "Confirmez votre adresse pour Laverta",
          `Pour confirmer votre adresse e-mail, ouvrez ce lien : ${url}\n\nSi vous n’avez pas créé de compte Laverta, ignorez ce message.`,
        );
      },
    },
  } : {}),
});

export async function getAuthSession() {
  const { headers } = await import("next/headers");
  return auth.api.getSession({ headers: await headers() });
}
