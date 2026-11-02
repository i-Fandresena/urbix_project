import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistSerifRegular } from "geist/font/serif/regular";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hamarino — Chaque image mérite ses sources",
  description: "Un espace de vérification visuelle et de recoupement des sources pour les journalistes à Madagascar. Par Urbix.",
  applicationName: "Hamarino",
  keywords: ["journalisme", "vérification", "Madagascar", "image", "sources"],
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${GeistSans.variable} ${GeistSerifRegular.variable}`}>
      <body>{children}</body>
    </html>
  );
}
