import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import nodemailer from "nodemailer";
import { isEmailDeliveryConfigured, trustedOrigins } from "@/lib/auth-config";
import { pool } from "@/lib/db";
import { isInvitedEmail } from "@/lib/invitations";

const smtpUrl = process.env.AUTH_SMTP_URL;
const emailFrom = process.env.AUTH_EMAIL_FROM;
const emailDeliveryConfigured = isEmailDeliveryConfigured();
const smtp = emailDeliveryConfigured && smtpUrl ? nodemailer.createTransport(smtpUrl) : null;

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
      // Conservé pour compatibilité avec les comptes existants ; le formulaire ne le demande plus.
      organization: { type: "string", required: false, input: true },
    },
  },
  databaseHooks: {
    user: {
      create: {
        // Inscription sur invitation uniquement, appliquée côté serveur pour toute création d’utilisateur.
        // Statut 400 (et non 403) : Better Auth transforme un 403 en fausse réussite lorsque la vérification e-mail est active.
        before: async (user) => {
          if (!(await isInvitedEmail(user.email))) {
            throw APIError.from("BAD_REQUEST", { code: "INVITATION_REQUIRED", message: "Sign-up is by invitation only." });
          }
        },
      },
    },
  },
  ...(emailDeliveryConfigured ? {
    emailVerification: {
      sendOnSignUp: true,
      sendOnSignIn: true,
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
