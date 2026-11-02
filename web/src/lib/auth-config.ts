export function isAuthConfigured() {
  const hasRuntimeSecrets = Boolean(process.env.DATABASE_URL && process.env.BETTER_AUTH_SECRET);
  const hasPublicBaseUrl = process.env.NODE_ENV !== "production" || Boolean(process.env.BETTER_AUTH_URL);
  return hasRuntimeSecrets && hasPublicBaseUrl;
}

export function isEmailDeliveryConfigured() {
  return Boolean(process.env.AUTH_SMTP_URL && process.env.AUTH_EMAIL_FROM);
}

export function trustedOrigins() {
  const configured = process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  return configured.split(",").map((origin) => origin.trim()).filter(Boolean);
}
