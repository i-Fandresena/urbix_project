import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistSerifRegular } from "geist/font/serif/regular";
import "./globals.css";
import "./marketing.css";

export const metadata: Metadata = {
  title: "Hamarino — Chaque image mérite ses sources",
  description: "Hamarino aide les rédactions à examiner les images, retrouver des sources consultables et vérifier leur contexte.",
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
