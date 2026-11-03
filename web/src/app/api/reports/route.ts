import sharp from "sharp";
import { createHash } from "node:crypto";
import { processNewReport } from "@/lib/workflow";
import { createReport, purgeExpiredReports, REPORT_LANGUAGES, REPORT_THEMES, type ReportLanguage, type ReportTheme } from "@/lib/reports";
import { encryptReportMedia, isMediaEncryptionConfigured } from "@/lib/report-media";
import { consumeReportSubmission, hasTrustedOrigin } from "@/lib/report-request";

export const maxDuration = 30;

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_REQUEST_BYTES = MAX_IMAGE_BYTES + 96 * 1024;
const allowedFields = new Set(["assertion", "context", "theme", "language", "sourceUrl", "media", "consent", "website", "region"]);

function formString(form: FormData, name: string) {
  const value = form.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function parseSourceUrl(value: string) {
  if (!value) return null;
  if (value.length > 2000) throw new Error("Le lien dépasse la longueur autorisée.");
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) throw new Error();
    return url.toString();
  } catch {
    throw new Error("Saisissez un lien public commençant par http:// ou https://.");
  }
}

export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) return Response.json({ error: "Origine de la requête refusée." }, { status: 403, headers: { "Cache-Control": "no-store" } });
  if (!consumeReportSubmission(request)) return Response.json({ error: "Trop de signalements depuis cette connexion. Réessayez plus tard." }, { status: 429, headers: { "Cache-Control": "no-store" } });

  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (!Number.isFinite(declaredLength) || declaredLength <= 0) return Response.json({ error: "La taille de la requête ne peut pas être vérifiée." }, { status: 411 });
  if (declaredLength > MAX_REQUEST_BYTES) return Response.json({ error: "Le fichier ou le formulaire dépasse la taille autorisée de 5 Mo." }, { status: 413 });

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Le formulaire est invalide. Rechargez la page et réessayez." }, { status: 400 });
  }
  if (Array.from(form.keys()).some((key) => !allowedFields.has(key)) || Array.from(allowedFields).some((key) => form.getAll(key).length > 1)) {
    return Response.json({ error: "Le formulaire contient des champs inattendus." }, { status: 400 });
  }
  if (formString(form, "website")) return Response.json({ trackingCode: "LV-00000000000000000000" }, { status: 201, headers: { "Cache-Control": "no-store" } });
  if (formString(form, "consent") !== "true") return Response.json({ error: "Confirmez le consentement avant l’envoi." }, { status: 400 });

  const assertion = formString(form, "assertion");
  const context = formString(form, "context");
  const theme = formString(form, "theme");
  const language = formString(form, "language");
  if (assertion.length < 12 || assertion.length > 500) return Response.json({ error: "L’affirmation doit contenir entre 12 et 500 caractères." }, { status: 400 });
  if (context.length > 1200) return Response.json({ error: "Le contexte est limité à 1 200 caractères." }, { status: 400 });
  if (!(REPORT_THEMES as readonly string[]).includes(theme)) return Response.json({ error: "Choisissez un thème proposé." }, { status: 400 });
  if (!(REPORT_LANGUAGES as readonly string[]).includes(language)) return Response.json({ error: "Choisissez une langue proposée." }, { status: 400 });

  let sourceUrl: string | null;
  try {
    sourceUrl = parseSourceUrl(formString(form, "sourceUrl"));
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Le lien fourni est invalide." }, { status: 400 });
  }

  const mediaField = form.get("media");
  if (mediaField !== null && !(mediaField instanceof File)) return Response.json({ error: "Le fichier transmis est invalide." }, { status: 400 });
  const uploadedFile = mediaField instanceof File && mediaField.size > 0 ? mediaField : null;
  if (!uploadedFile && !sourceUrl) return Response.json({ error: "Ajoutez une image ou un lien vers la publication à vérifier." }, { status: 400 });
  if (uploadedFile && uploadedFile.size > MAX_IMAGE_BYTES) return Response.json({ error: "L’image doit peser 5 Mo ou moins." }, { status: 413 });
  if (uploadedFile && !isMediaEncryptionConfigured()) return Response.json({ error: "Le stockage chiffré des images n’est pas configuré. Ajoutez LAVERTA_MEDIA_ENCRYPTION_KEY dans web/.env.local." }, { status: 503 });

  try {
    let media: Awaited<ReturnType<typeof prepareMedia>> | null = null;
    if (uploadedFile) media = await prepareMedia(uploadedFile);
    await purgeExpiredReports();
    const region = formString(form, "region").slice(0, 80);
    const { code: trackingCode, id } = await createReport({
      assertion,
      context,
      theme: theme as ReportTheme,
      language: language as ReportLanguage,
      sourceUrl,
      region,
      media,
    });
    const match = await processNewReport(id).catch(() => null);
    const instant = match ? { publicationId: match.id, verdict: match.verdict, correction: match.correction } : null;
    return Response.json({ trackingCode, instant }, { status: 201, headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("IMAGE_")) {
      const messages: Record<string, string> = {
        IMAGE_UNSUPPORTED: "Seuls les fichiers JPEG, PNG et WebP sont acceptés.",
        IMAGE_INVALID: "Le fichier ne semble pas être une image lisible.",
        IMAGE_MISMATCH: "Le type du fichier ne correspond pas à son contenu.",
      };
      const code = error.message.split(":")[0];
      return Response.json({ error: messages[code] ?? "Le fichier image ne peut pas être utilisé." }, { status: 415 });
    }
    return Response.json({ error: "Le service de signalement est momentanément indisponible. Vérifiez PostgreSQL et sa migration." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}

async function prepareMedia(file: File) {
  const bytes = Buffer.from(await file.arrayBuffer());
  try {
    const metadata = await sharp(bytes, { limitInputPixels: 20_000_000, failOn: "error" }).metadata();
    const mimeTypes: Record<string, string> = { jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };
    const mimeType = metadata.format ? mimeTypes[metadata.format] : undefined;
    if (!mimeType) throw new Error("IMAGE_UNSUPPORTED");
    if (file.type && file.type !== mimeType && !(file.type === "image/jpg" && mimeType === "image/jpeg")) throw new Error("IMAGE_MISMATCH");
    const encrypted = encryptReportMedia(bytes);
    return {
      ...encrypted,
      mimeType,
      size: bytes.byteLength,
      sha256: createHash("sha256").update(bytes).digest("hex"),
    };
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("IMAGE_")) throw error;
    throw new Error("IMAGE_INVALID");
  }
}
