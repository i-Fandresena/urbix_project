import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";
import { isAuthConfigured } from "@/lib/auth-config";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isWorkspace = pathname === "/verification" || pathname.startsWith("/verification/");
  const isAnalyze = pathname === "/api/analyze";
  const isProtected = isWorkspace || isAnalyze;

  if (!isProtected) return NextResponse.next();

  if (!isAuthConfigured()) {
    if (process.env.NODE_ENV !== "production") return NextResponse.next();
    if (isAnalyze) {
      return NextResponse.json({ error: "La base PostgreSQL et l’authentification ne sont pas configurées." }, { status: 503 });
    }
    const loginUrl = new URL("/connexion", request.url);
    loginUrl.searchParams.set("configuration", "postgres");
    return NextResponse.redirect(loginUrl);
  }

  // Redirects are optimistic only; protected pages and API routes validate sessions in PostgreSQL.
  if (!getSessionCookie(request)) {
    if (isAnalyze) return NextResponse.json({ error: "Connectez-vous pour lancer une analyse." }, { status: 401 });
    const loginUrl = new URL("/connexion", request.url);
    loginUrl.searchParams.set("next", "/verification");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/verification/:path*", "/connexion", "/auth/:path*", "/mot-de-passe/:path*", "/api/analyze"],
};
