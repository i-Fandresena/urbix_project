import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import LoginForm from "./login-form";
import QueryNotice from "./query-notice";

export const metadata: Metadata = {
  title: "Connexion — Hamarino",
  description: "Connectez-vous à votre espace éditorial Hamarino.",
};

function Brand() {
  return (
    <Link className="brand-lockup" href="/" aria-label="Hamarino, accueil">
      <span className="brand-lockup__mark" aria-hidden="true"><svg viewBox="0 0 36 36" fill="none"><path d="M4 12V4h8M24 4h8v8M32 24v8h-8M12 32H4v-8" /><circle cx="14.5" cy="18" r="2.4" /><path d="M17 18h7.2" /><circle cx="27.2" cy="18" r="1.8" /></svg></span>
      <span className="brand-lockup__word">hamarino<span>.</span></span>
    </Link>
  );
}

function AuthArtwork() {
  return (
    <div className="evidence-art evidence-art--compact" role="img" aria-label="Illustration d’un paysage cadré et de notes de vérification">
      <div className="evidence-art__meta"><span>UN REGARD, PLUSIEURS PISTES</span><span>01</span></div>
      <div className="evidence-art__photo"><svg viewBox="0 0 620 410" aria-hidden="true"><rect width="620" height="410" fill="#E7E5D9" /><circle cx="458" cy="102" r="44" fill="#D6EE75" /><path d="M0 279 153 155l104 99 112-131 251 205v82H0z" fill="#80927A" /><path d="m0 324 181-108 115 91 136-117 188 137v83H0z" fill="#385D4B" /><path d="m0 310 88-63 74 28 84-48 94 54 99-73 99 56 82-38v184H0z" fill="#254438" /><path d="M70 319h91v91H70zM184 287h78v123h-78zM285 328h108v82H285zM415 293h78v117h-78zM510 328h64v82h-64z" fill="#F6F5EF" /><path d="M87 342h17v25H87zm35 0h17v25h-17zm77-29h16v24h-16zm34 0h16v24h-16zm84 39h19v28h-19zm41 0h19v28h-19zm75-39h16v24h-16zm33 0h16v24h-16zm55 34h13v20h-13zm27 0h13v20h-13z" fill="#C76A4C" /></svg><span className="evidence-art__image-label">IMAGE · EXEMPLE VISUEL</span></div>
      <div className="evidence-art__frame evidence-art__frame--one" aria-hidden="true"><span /><span /><span /><span /></div>
      <div className="evidence-note evidence-note--source"><div className="evidence-note__index">SOURCE</div><strong>À consulter</strong><span><i /> Une piste parmi d’autres</span></div>
      <div className="evidence-note evidence-note--status"><div className="evidence-note__index">CONCLUSION</div><strong><span className="evidence-note__dot" /> À vérifier</strong><span>Le jugement reste humain.</span></div>
      <div className="evidence-art__caption">DONNÉES FICTIVES · VISUEL D’ILLUSTRATION</div>
    </div>
  );
}

export default function ConnexionPage() {
  return (
    <main className="auth-page">
      <div className="auth-split">
        <section className="auth-story" aria-label="À propos de Hamarino">
          <Brand />
          <div className="auth-story__content">
            <span className="auth-story__kicker">L’IMAGE N’EST QUE LE DÉBUT</span>
            <h1>Bonjour,<br /><em>reprenons le fil.</em></h1>
            <p>Retrouvez votre espace de recoupement et les sources utiles à votre enquête.</p>
            <AuthArtwork />
          </div>
          <div className="auth-story__footer"><span>PAR URBIX · ANTANANARIVO</span><span>CHAQUE IMAGE MÉRITE SES SOURCES</span></div>
        </section>
        <section className="auth-panel" aria-labelledby="auth-title">
          <div className="auth-panel__inner">
            <div className="auth-panel__top"><Link href="/"><ArrowLeft size={13} /> Retour à l’accueil</Link></div>
            <div className="auth-mobile-brand"><Brand /></div>
            <div className="auth-heading"><span className="auth-heading__eyebrow">ESPACE ÉDITORIAL · ACCÈS SÉCURISÉ</span><h2 id="auth-title">Votre espace Hamarino</h2><p>Connectez-vous ou créez un accès pour votre rédaction.</p></div>
            <Suspense fallback={null}><QueryNotice /></Suspense>
            <LoginForm />
            <div className="auth-panel__back"><Link href="/"><ArrowUpRight size={13} /> Découvrir Hamarino</Link></div>
          </div>
        </section>
      </div>
    </main>
  );
}
