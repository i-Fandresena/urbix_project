import { consumeCredentialUpload, hasTrustedOrigin } from "@/lib/report-request";
import { isMediaEncryptionConfigured } from "@/lib/report-media";
import { MAX_CARD_BYTES, normalizeMatricule, prepareCard, storeCredential, type PreparedCard } from "@/lib/staff-credentials";

export const maxDuration = 30;

const MAX_REQUEST_BYTES = MAX_CARD_BYTES + 32 * 1024;
const allowedFields = new Set(["email", "userId", "matricule", "card", "consent"]);
const noStore = { "Cache-Control": "no-store" };

function formString(form: FormData, name: string) {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function fail(code: string, status: number) {
  return Response.json({ error: code }, { status, headers: noStore });
}

// Dépôt facultatif d’une carte de presse et/ou d’un matricule juste après la création du compte.
// Les réponses ne portent que des codes génériques : elles ne révèlent pas si une adresse est invitée.
export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) return fail("ORIGIN", 403);
  if (!consumeCredentialUpload(request)) return fail("RATE_LIMITED", 429);
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (!Number.isFinite(declaredLength) || declaredLength <= 0) return fail("LENGTH_REQUIRED", 411);
  if (declaredLength > MAX_REQUEST_BYTES) return fail("CARD_TOO_LARGE", 413);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail("INVALID_FORM", 400);
  }
  if (Array.from(form.keys()).some((key) => !allowedFields.has(key)) || Array.from(allowedFields).some((key) => form.getAll(key).length > 1)) return fail("INVALID_FORM", 400);
  if (formString(form, "consent") !== "true") return fail("CONSENT_REQUIRED", 400);

  const email = formString(form, "email").toLowerCase();
  const userId = formString(form, "userId");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !/^[A-Za-z0-9_-]{8,64}$/.test(userId)) return fail("REJECTED", 400);

  let matricule: string | null;
  try {
    matricule = normalizeMatricule(formString(form, "matricule"));
  } catch {
    return fail("MATRICULE_INVALID", 400);
  }
  const cardField = form.get("card");
  if (cardField !== null && !(cardField instanceof File)) return fail("INVALID_FORM", 400);
  const cardFile = cardField instanceof File && cardField.size > 0 ? cardField : null;
  if (!cardFile && !matricule) return fail("EMPTY", 400);
  if (cardFile && !isMediaEncryptionConfigured()) return fail("STORAGE_UNAVAILABLE", 503);

  let card: PreparedCard | null = null;
  if (cardFile) {
    try {
      card = await prepareCard(cardFile);
    } catch (error) {
      const code = error instanceof Error && error.message.startsWith("CARD_") ? error.message : "CARD_INVALID";
      return fail(code, code === "CARD_TOO_LARGE" ? 413 : 415);
    }
  }

  try {
    const stored = await storeCredential({ email, userId, matricule, card });
    return stored ? Response.json({ ok: true }, { status: 201, headers: noStore }) : fail("REJECTED", 400);
  } catch {
    return fail("STORAGE_UNAVAILABLE", 503);
  }
}
