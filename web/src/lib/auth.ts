import { betterAuth } from "better-auth";
import nodemailer from "nodemailer";
import { isEmailDeliveryConfigured, trustedOrigins } from "@/lib/auth-config";
import { pool } from "@/lib/db";

const smtpUrl = process.env.AUTH_SMTP_URL;
const emailFrom = process.env.AUTH_EMAIL_FROM;
const emailDeliveryConfigured = isEmailDeliveryConfigured();
const smtp = emailDeliveryConfigured && smtpUrl ? nodemailer.createTransport(smtpUrl) : null;

async function sendAuthEmail(to: string, subject: string, text: string) {
  if (!smtp || !emailFrom) throw new Error("La livraison SMTP n’est pas configurée.");
  await smtp.sendMail({ from: emailFrom, to, subject, text });
}

export const auth = betterAuth({
  appName: "Hamarino",
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
          "Réinitialiser votre mot de passe Hamarino",
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
          "Confirmez votre adresse pour Hamarino",
          `Pour confirmer votre adresse e-mail, ouvrez ce lien : ${url}\n\nSi vous n’avez pas créé de compte Hamarino, ignorez ce message.`,
        );
      },
    },
  } : {}),
});

export async function getAuthSession() {
  const { headers } = await import("next/headers");
  return auth.api.getSession({ headers: await headers() });
}
