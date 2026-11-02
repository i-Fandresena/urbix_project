import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";
import { isAuthConfigured } from "@/lib/auth-config";

const handlers = toNextJsHandler(auth);

function unavailable() {
  return Response.json({ error: "La base PostgreSQL et l’authentification ne sont pas configurées." }, { status: 503 });
}

export const GET = (request: Request) => isAuthConfigured() ? handlers.GET(request) : unavailable();
export const POST = (request: Request) => isAuthConfigured() ? handlers.POST(request) : unavailable();
