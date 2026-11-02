import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function copySessionState(target: NextResponse, source: NextResponse) {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
  for (const header of ["cache-control", "expires", "pragma"]) {
    const value = source.headers.get(header);
    if (value) target.headers.set(header, value);
  }
  return target;
}

export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const pathname = request.nextUrl.pathname;
  const isWorkspace = pathname === "/verification" || pathname.startsWith("/verification/");
  const isAnalyze = pathname === "/api/analyze";
  const isPasswordUpdate = pathname.startsWith("/mot-de-passe/");
  const isProtected = isWorkspace || isAnalyze || isPasswordUpdate;

  if (!url || !key) {
    if (!isProtected || process.env.NODE_ENV !== "production") return NextResponse.next({ request });
    if (isAnalyze) return NextResponse.json({ error: "L’authentification n’est pas configurée sur ce serveur." }, { status: 503 });
    const loginUrl = new URL("/connexion", request.url);
    loginUrl.searchParams.set("configuration", "supabase");
    return NextResponse.redirect(loginUrl);
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([name, value]) => response.headers.set(name, value));
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();
  const authenticated = !error && Boolean(data?.claims?.sub);

  if (isProtected && !authenticated) {
    if (isAnalyze) {
      return copySessionState(NextResponse.json({ error: "Connectez-vous pour lancer une analyse." }, { status: 401 }), response);
    }
    const loginUrl = new URL("/connexion", request.url);
    loginUrl.searchParams.set("next", isPasswordUpdate ? "/verification" : `${pathname}${request.nextUrl.search}`);
    return copySessionState(NextResponse.redirect(loginUrl), response);
  }

  if (pathname === "/connexion" && authenticated) {
    const requested = request.nextUrl.searchParams.get("next");
    const destination = requested === "/verification" ? requested : "/verification";
    return copySessionState(NextResponse.redirect(new URL(destination, request.url)), response);
  }

  return response;
}
