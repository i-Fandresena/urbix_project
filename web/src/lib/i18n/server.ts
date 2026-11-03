import { cookies } from "next/headers";
import { normalizeLocale, type Locale } from "./messages";

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return normalizeLocale(cookieStore.get("laverta-locale")?.value);
}

export async function getServerTheme(): Promise<"light" | "dark"> {
  const cookieStore = await cookies();
  return cookieStore.get("laverta-theme")?.value === "dark" ? "dark" : "light";
}
