"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Languages, Moon, Sun } from "lucide-react";
import { normalizeLocale, translate, type Locale, type MessageKey } from "@/lib/i18n/messages";

type Theme = "light" | "dark";
type PreferencesValue = {
  locale: Locale;
  theme: Theme;
  setLocale: (locale: Locale) => void;
  toggleTheme: () => void;
  t: (key: MessageKey, values?: Record<string, string | number>) => string;
};

const PreferencesContext = createContext<PreferencesValue | null>(null);

function setPreferenceCookie(name: string, value: string) {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=31536000; SameSite=Lax${secure}`;
}

function readPreferenceCookie(name: string) {
  const prefix = `${name}=`;
  const stored = document.cookie.split(";").map((cookie) => cookie.trim()).find((cookie) => cookie.startsWith(prefix));
  if (!stored) return null;
  try {
    return decodeURIComponent(stored.slice(prefix.length));
  } catch {
    return null;
  }
}

export function PreferencesProvider({
  children,
  initialLocale,
  initialTheme,
}: {
  children: ReactNode;
  initialLocale: Locale;
  initialTheme: Theme;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [theme, setTheme] = useState<Theme>(initialTheme);

  useEffect(() => {
    const storedLocale = readPreferenceCookie("laverta-locale");
    const storedTheme = readPreferenceCookie("laverta-theme");
    const nextLocale = storedLocale ? normalizeLocale(storedLocale) : locale;
    const nextTheme = storedTheme === "dark" ? "dark" : storedTheme === "light" ? "light" : theme;
    // Les cookies ne sont lisibles qu’après l’hydratation : la synchronisation se fait donc ici.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (locale !== nextLocale) setLocaleState(nextLocale);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (theme !== nextTheme) setTheme(nextTheme);
    document.documentElement.lang = nextLocale;
    document.documentElement.dataset.theme = nextTheme;
  }, [locale, theme]);

  const setLocale = useCallback((nextLocale: Locale) => {
    const normalized = normalizeLocale(nextLocale);
    setLocaleState(normalized);
    setPreferenceCookie("laverta-locale", normalized);
    document.documentElement.lang = normalized;
    router.refresh();
  }, [router]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === "light" ? "dark" : "light";
      setPreferenceCookie("laverta-theme", next);
      document.documentElement.dataset.theme = next;
      return next;
    });
  }, []);

  const value = useMemo<PreferencesValue>(() => ({
    locale,
    theme,
    setLocale,
    toggleTheme,
    t: (key, values) => translate(locale, key, values),
  }), [locale, theme, setLocale, toggleTheme]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function useLavertaPreferences() {
  const value = useContext(PreferencesContext);
  if (!value) throw new Error("useLavertaPreferences must be used inside PreferencesProvider");
  return value;
}

export function PreferencesControl() {
  const { locale, setLocale, theme, toggleTheme, t } = useLavertaPreferences();
  return (
    <aside className="preferences-control" aria-label={t("prefs.language")}>
      <label className="preferences-control__language">
        <Languages size={15} aria-hidden="true" />
        <span className="visually-hidden">{t("prefs.language")}</span>
        <select value={locale} onChange={(event) => setLocale(normalizeLocale(event.target.value))} aria-label={t("prefs.language")}>
          <option value="fr">FR</option>
          <option value="mg">MG</option>
          <option value="en">EN</option>
        </select>
      </label>
      <span className="preferences-control__divider" aria-hidden="true" />
      <button type="button" className="preferences-control__theme" onClick={toggleTheme} aria-pressed={theme === "dark"} aria-label={theme === "light" ? t("prefs.switchDark") : t("prefs.switchLight")} title={theme === "light" ? t("prefs.switchDark") : t("prefs.switchLight")}>
        {theme === "light" ? <Moon size={16} aria-hidden="true" /> : <Sun size={16} aria-hidden="true" />}
        <span>{theme === "light" ? t("prefs.dark") : t("prefs.light")}</span>
      </button>
    </aside>
  );
}
