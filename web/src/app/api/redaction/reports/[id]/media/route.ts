import { getEditorialMediaBytes, getEncryptedReportMedia } from "@/lib/reports";
import { getEditorialSession } from "@/lib/report-access";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  let session;
  try {
    session = await getEditorialSession();
  } catch {
    return new Response("Service de session indisponible.", { status: 503 });
  }
  if (!session) return new Response("Connexion rédaction requise.", { status: 401, headers: { "Cache-Control": "no-store" } });

  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response("Dossier introuvable.", { status: 404 });
  try {
    const media = await getEncryptedReportMedia(id);
    if (!media) return new Response("Aucune image jointe.", { status: 404 });
    const bytes = await getEditorialMediaBytes(media);
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": media.media_mime_type,
        "Content-Length": String(bytes.byteLength),
        "Content-Disposition": "inline; filename=laverta-signalement",
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch {
    return new Response("L’image ne peut pas être déchiffrée. Vérifiez la clé locale de chiffrement.", { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
