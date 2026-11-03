import { createHmac, timingSafeEqual } from "node:crypto";
import { after } from "next/server";
import { advance, createdReplies, followReplies, foundReplies, type FlowInput, type Reply } from "@/lib/messenger-flow";
import { claimEvent, createSignalement, findSignalement, listSignalements, loadConversation, saveConversation } from "@/lib/signalements";

const GRAPH_MESSAGES_URL = "https://graph.facebook.com/v26.0/me/messages";
const MAX_WEBHOOK_BYTES = 1024 * 1024;
const COUNTED_ATTACHMENTS = new Set(["image", "video", "audio", "file"]);
// La langue de la personne n’est pas connue quand la base ne répond pas.
const UNAVAILABLE: Reply = { text: "Le service est momentanément indisponible. Réessayez un peu plus tard.\nThe service is temporarily unavailable. Please try again later." };

type MessagingEvent = {
  sender?: { id?: string };
  message?: { mid?: string; text?: string; is_echo?: boolean; attachments?: { type?: string }[]; quick_reply?: { payload?: string } };
  postback?: { mid?: string; payload?: string };
};
type WebhookPayload = { object?: string; entry?: { messaging?: MessagingEvent[] }[] };

function hasValidSignature(rawBody: Buffer, header: string | null) {
  const secret = process.env.MESSENGER_APP_SECRET;
  if (!secret || !header?.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest();
  const received = Buffer.from(header.slice("sha256=".length), "hex");
  return received.length === expected.length && timingSafeEqual(received, expected);
}

async function sendMessage(psid: string, { text, quickReplies }: Reply) {
  const token = process.env.MESSENGER_PAGE_ACCESS_TOKEN;
  if (!token) return;
  const response = await fetch(GRAPH_MESSAGES_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      recipient: { id: psid },
      messaging_type: "RESPONSE",
      message: { text, ...(quickReplies ? { quick_replies: quickReplies } : {}) },
    }),
  });
  // Le statut suffit au diagnostic : ne jamais journaliser le contenu des messages.
  if (!response.ok) console.error(`Envoi Messenger refusé : ${response.status}`);
}

async function repliesFor(psid: string, input: FlowInput) {
  const { conversation, replies: flowReplies, effect } = advance(await loadConversation(psid), input);
  let replies = flowReplies;
  if (effect?.type === "create") replies = createdReplies(effect.language, await createSignalement(psid, effect.draft, effect.language));
  if (effect?.type === "list") replies = followReplies(effect.language, await listSignalements(psid));
  if (effect?.type === "find") replies = foundReplies(effect.language, effect.code, await findSignalement(psid, effect.code));
  await saveConversation(psid, conversation);
  return replies;
}

async function handleEvent(event: MessagingEvent) {
  const psid = event.sender?.id;
  if (!psid || event.message?.is_echo) return;

  let replies: Reply[];
  try {
    const mid = event.message?.mid ?? event.postback?.mid;
    if (mid && !(await claimEvent(mid))) return;
    replies = await repliesFor(psid, {
      payload: event.postback?.payload ?? event.message?.quick_reply?.payload,
      text: event.message?.text,
      attachmentCount: event.message?.attachments?.filter((attachment) => COUNTED_ATTACHMENTS.has(attachment.type ?? "")).length ?? 0,
    });
  } catch {
    // Meta exige une réponse à chaque message, même quand la base est indisponible.
    console.error("Traitement Messenger impossible.");
    replies = [UNAVAILABLE];
  }
  for (const reply of replies) await sendMessage(psid, reply);
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const verifyToken = process.env.MESSENGER_VERIFY_TOKEN;
  if (verifyToken && params.get("hub.mode") === "subscribe" && params.get("hub.verify_token") === verifyToken) {
    return new Response(params.get("hub.challenge") ?? "", { headers: { "Content-Type": "text/plain" } });
  }
  return new Response("Accès refusé", { status: 403 });
}

export async function POST(request: Request) {
  if (Number(request.headers.get("content-length") ?? 0) > MAX_WEBHOOK_BYTES) {
    return new Response("Requête trop volumineuse", { status: 413 });
  }

  // La signature porte sur les octets reçus : la vérifier avant tout JSON.parse.
  const rawBody = Buffer.from(await request.arrayBuffer());
  if (rawBody.length > MAX_WEBHOOK_BYTES) return new Response("Requête trop volumineuse", { status: 413 });
  if (!hasValidSignature(rawBody, request.headers.get("x-hub-signature-256"))) {
    return new Response("Signature invalide", { status: 403 });
  }

  let body: WebhookPayload;
  try {
    body = JSON.parse(rawBody.toString("utf8")) as WebhookPayload;
  } catch {
    return new Response("JSON invalide", { status: 400 });
  }
  if (body.object !== "page") return new Response("Objet inattendu", { status: 404 });

  const events = (body.entry ?? []).flatMap((entry) => entry.messaging ?? []);
  // Meta attend un 200 en moins de 5 secondes : les réponses partent après l’accusé.
  after(async () => {
    for (const event of events) {
      await handleEvent(event).catch(() => console.error("Envoi Messenger impossible."));
    }
  });
  return new Response("EVENT_RECEIVED");
}
