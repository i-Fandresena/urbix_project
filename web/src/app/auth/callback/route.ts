import { NextResponse, type NextRequest } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

function safeDestination(value: string | null) {
  return value === "/mot-de-passe/nouveau" ? value : "/verification";
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const destination = safeDestination(request.nextUrl.searchParams.get("next"));
  if (!isSupabaseConfigured() || !code) {
    return NextResponse.redirect(new URL("/connexion?confirmation=erreur", request.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/connexion?confirmation=erreur", request.url));
  return NextResponse.redirect(new URL(destination, request.url));
}
