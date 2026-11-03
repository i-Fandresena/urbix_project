import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import "./marketing.css";
import "./laverta-refresh.css";
import { PreferencesControl, PreferencesProvider } from "./preferences";

export const metadata: Metadata = {
  title: "Laverta — La correction doit suivre la rumeur",
  description: "Laverta veut aider les rédactions à signaler, vérifier et faire circuler les corrections à Madagascar.",
  applicationName: "Laverta",
  keywords: ["journalisme", "rumeur", "vérification", "correction", "Madagascar"],
  icons: { icon: [{ url: "/brand/laverta-symbol.png", type: "image/png" }] },
};

function RouteLoadingShell() {
  return (
    <div className="route-loading-shell" role="status" aria-busy="true">
      <span className="route-loading-shell__brand">laverta<span>.</span></span>
      <span className="route-loading-shell__label">Chargement de Laverta…</span>
    </div>
  );
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" data-theme="light">
      <body>
        <PreferencesProvider initialLocale="fr" initialTheme="light">
          <Suspense fallback={<RouteLoadingShell />}>
            {children}
          </Suspense>
          <PreferencesControl />
        </PreferencesProvider>
      </body>
    </html>
  );
}
