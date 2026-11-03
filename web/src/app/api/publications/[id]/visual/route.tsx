import { ImageResponse } from "next/og";
import { VERDICT_WORDS } from "@/lib/messenger-bridge";
import { getPublication } from "@/lib/workflow";

const LABELS = {
  fr: { claim: "L’information qui circule", correction: "Ce qu’il faut savoir", footer: "Vérifié par la rédaction Laverta" },
  en: { claim: "The claim going around", correction: "What you need to know", footer: "Checked by the Laverta newsroom" },
  mg: { claim: "Ilay vaovao miely", correction: "Ny tokony ho fantatra", footer: "Nohamarinin'ny mpanao gazety Laverta" },
} as const;

// Visuel partageable : le verdict est écrit en toutes lettres, jamais porté par la seule couleur.
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return new Response("Not found", { status: 404 });
  const publication = await getPublication(id).catch(() => null);
  if (!publication) return new Response("Not found", { status: 404 });
  const url = new URL(request.url);
  const lang = (["fr", "en", "mg"] as const).find((value) => value === url.searchParams.get("lang")) ?? "fr";
  const story = url.searchParams.get("format") === "story";
  const width = 1080;
  const height = story ? 1920 : 1080;
  const labels = LABELS[lang];
  const host = new URL(process.env.BETTER_AUTH_URL ?? url.origin).host;
  const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1)}…` : text);

  return new ImageResponse(
    (
      <div style={{ width, height, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: story ? 96 : 72, background: "#F7F6F1", color: "#0E1726", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", fontSize: 30, fontWeight: 700, letterSpacing: 6 }}>LAVERTA</div>
          <div style={{ display: "flex", alignSelf: "flex-start", padding: "14px 30px", background: "#0E1726", color: "#F7F6F1", fontSize: story ? 120 : 104, fontWeight: 800, letterSpacing: 2 }}>{VERDICT_WORDS[lang][publication.verdict]}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", fontSize: 28, color: "#3E4A5C", textTransform: "uppercase", letterSpacing: 3 }}>{labels.claim}</div>
          <div style={{ display: "flex", fontSize: story ? 54 : 46, fontWeight: 700, lineHeight: 1.2, borderLeft: "10px solid #1F6FEB", paddingLeft: 26 }}>« {clip(publication.assertion, story ? 220 : 160)} »</div>
          <div style={{ display: "flex", fontSize: 28, color: "#3E4A5C", textTransform: "uppercase", letterSpacing: 3, marginTop: 24 }}>{labels.correction}</div>
          <div style={{ display: "flex", fontSize: story ? 40 : 34, lineHeight: 1.35 }}>{clip(publication.correction, story ? 420 : 240)}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#3E4A5C", borderTop: "2px solid #0E1726", paddingTop: 22 }}>
          <span>{labels.footer}</span><span>{host}/verifications</span>
        </div>
      </div>
    ),
    { width, height, headers: { "Cache-Control": "public, max-age=300" } },
  );
}
