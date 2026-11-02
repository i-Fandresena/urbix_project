import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Données et confidentialité — Hamarino",
  description: "Comment Hamarino traite les données de compte et les images envoyées pour analyse.",
};

function Brand() {
  return (
    <Link className="brand-lockup" href="/" aria-label="Hamarino, accueil">
      <span className="brand-lockup__mark" aria-hidden="true"><svg viewBox="0 0 36 36" fill="none"><path d="M4 12V4h8M24 4h8v8M32 24v8h-8M12 32H4v-8" /><circle cx="14.5" cy="18" r="2.4" /><path d="M17 18h7.2" /><circle cx="27.2" cy="18" r="1.8" /></svg></span>
      <span className="brand-lockup__word">hamarino<span>.</span></span>
    </Link>
  );
}

export default function PrivacyPage() {
  return (
    <main className="policy-page">
      <header><Brand /><Link className="policy-back" href="/"><ArrowLeft size={14} /> Retour à l’accueil</Link></header>
      <article className="policy-content">
        <div className="eyebrow"><span className="eyebrow__rule" /> HAMARINO BY URBIX · INFORMATIONS</div>
        <h1>Données et confidentialité</h1>
        <p className="policy-lede">Hamarino aide une rédaction à examiner le contexte d’une image. Cette page résume les données utilisées dans le prototype actuel.</p>

        <section><span>01</span><div><h2>Votre compte</h2><p>La création de compte transmet votre adresse e-mail et, si vous les indiquez, votre nom et votre rédaction à Supabase Auth. Supabase gère la confirmation e-mail, le mot de passe et la session. Hamarino ne reçoit pas votre mot de passe en clair côté serveur.</p></div></section>
        <section><span>02</span><div><h2>Images et analyses</h2><p>Une image et le contexte saisi sont transmis à Gemini uniquement après votre consentement explicite. Le serveur Hamarino les traite en mémoire, retire les métadonnées EXIF et ne les enregistre pas dans une base de données. L’appel désactive l’historique des interactions avec <code>store: false</code>.</p><p>Le forfait Gemini gratuit peut utiliser les prompts et les réponses pour améliorer les produits Google. N’envoyez pas d’images confidentielles, sensibles ou dont vous n’avez pas le droit d’usage.</p></div></section>
        <section><span>03</span><div><h2>Ce que Hamarino ne conserve pas</h2><p>Ce prototype n’enregistre pas d’images, de dossiers d’enquête, de résultats, ni d’historique de recherches. Il n’intègre pas de service d’analyse d’audience.</p></div></section>
        <section><span>04</span><div><h2>Services externes</h2><p>Supabase et Google traitent les données nécessaires aux fonctions que vous utilisez, selon leurs propres conditions et politiques. La désactivation de l’historique Gemini ne remplace pas les règles du forfait gratuit Google.</p></div></section>

        <div className="policy-note"><strong>Pour la démonstration</strong><p>Utilisez une image publique ou autorisée, non sensible, et un cas d’exercice. Les résultats sont des pistes de travail : la décision éditoriale reste humaine.</p></div>
        <p className="policy-footnote">Version prototype · 2 novembre 2026. Une politique adaptée à une ouverture publique devra être validée par l’équipe avant publication.</p>
      </article>
    </main>
  );
}
