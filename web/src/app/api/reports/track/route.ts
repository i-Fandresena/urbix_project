import { erasePublicReport, findPublicReport, isTrackingCode, normalizeTrackingCode, purgeExpiredReports } from "@/lib/reports";
import { consumeTrackingRequest, hasTrustedOrigin } from "@/lib/report-request";

export async function POST(request: Request) {
  if (!hasTrustedOrigin(request)) return Response.json({ error: "Origine de la requête refusée." }, { status: 403, headers: { "Cache-Control": "no-store" } });
  if (!consumeTrackingRequest(request)) return Response.json({ error: "Trop de consultations depuis cette connexion. Réessayez dans une minute." }, { status: 429, headers: { "Cache-Control": "no-store" } });
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(declaredLength) && declaredLength > 2048) return Response.json({ error: "Requête trop volumineuse." }, { status: 413 });

  let body: unknown;
  try {
    const rawBody = await request.text();
    if (rawBody.length > 2048) return Response.json({ error: "Requête trop volumineuse." }, { status: 413 });
    body = JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "Le code de suivi est invalide." }, { status: 400 });
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) return Response.json({ error: "Le code de suivi est invalide." }, { status: 400 });
  const fields = body as Record<string, unknown>;
  if (Object.keys(fields).some((key) => !["code", "action"].includes(key)) || typeof fields.code !== "string") {
    return Response.json({ error: "Le code de suivi est invalide." }, { status: 400 });
  }
  const code = normalizeTrackingCode(fields.code);
  if (!isTrackingCode(code)) return Response.json({ error: "Vérifiez le code LV et réessayez." }, { status: 400 });

  try {
    await purgeExpiredReports();
    if (fields.action === "erase") {
      const erased = await erasePublicReport(code);
      return erased
        ? Response.json({ erased: true }, { headers: { "Cache-Control": "no-store" } })
        : Response.json({ error: "Ce signalement a déjà été supprimé ou son délai de conservation est terminé." }, { status: 404, headers: { "Cache-Control": "no-store" } });
    }
    if (fields.action !== undefined && fields.action !== "lookup") return Response.json({ error: "Action inconnue." }, { status: 400 });
    const report = await findPublicReport(code);
    if (!report) return Response.json({ error: "Aucun signalement actif ne correspond à ce code." }, { status: 404, headers: { "Cache-Control": "no-store" } });
    return Response.json({ report }, { headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
  } catch {
    return Response.json({ error: "Le suivi est momentanément indisponible. Vérifiez PostgreSQL et sa migration." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
