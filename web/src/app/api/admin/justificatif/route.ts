import { getStaffContext } from "@/lib/staff";
import { readCredentialCard } from "@/lib/staff-credentials";

const extensions: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "application/pdf": "pdf" };

// Carte de presse déchiffrée : administrateurs uniquement, réponse non mise en cache et isolée (CSP sandbox).
export async function GET(request: Request) {
  let context;
  try {
    context = await getStaffContext();
  } catch {
    return new Response("Service de session indisponible.", { status: 503, headers: { "Cache-Control": "no-store" } });
  }
  if (!context) return new Response("Connexion requise.", { status: 401, headers: { "Cache-Control": "no-store" } });
  if (context.member?.role !== "admin") return new Response("Accès réservé aux administrateurs.", { status: 403, headers: { "Cache-Control": "no-store" } });

  const email = new URL(request.url).searchParams.get("email")?.trim().toLowerCase() ?? "";
  if (!email || email.length > 254) return new Response("Justificatif introuvable.", { status: 404, headers: { "Cache-Control": "no-store" } });
  try {
    const card = await readCredentialCard(email, context.member.email);
    if (!card) return new Response("Justificatif introuvable.", { status: 404, headers: { "Cache-Control": "no-store" } });
    return new Response(new Uint8Array(card.bytes), {
      headers: {
        "Content-Type": card.mimeType,
        "Content-Length": String(card.bytes.byteLength),
        "Content-Disposition": `inline; filename=laverta-justificatif.${extensions[card.mimeType] ?? "bin"}`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "Referrer-Policy": "no-referrer",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch {
    return new Response("Le justificatif ne peut pas être déchiffré ou son intégrité n’est pas vérifiée.", { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
