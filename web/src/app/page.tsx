import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, Check, Download, Eye, Smartphone } from "lucide-react";

export const metadata: Metadata = {
  title: "Hamarino — Chaque image mérite ses sources",
  description: "L’espace de recoupement visuel pensé pour les rédactions à Madagascar.",
};

function Brand() {
  return (
    <Link className="brand-lockup" href="/" aria-label="Hamarino, accueil">
      <span className="brand-lockup__mark" aria-hidden="true">
        <svg viewBox="0 0 36 36" fill="none">
          <path d="M4 12V4h8M24 4h8v8M32 24v8h-8M12 32H4v-8" />
          <circle cx="14.5" cy="18" r="2.4" />
          <path d="M17 18h7.2" />
          <circle cx="27.2" cy="18" r="1.8" />
        </svg>
      </span>
      <span className="brand-lockup__word">hamarino<span>.</span></span>
    </Link>
  );
}

function EvidenceArtwork({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`evidence-art${compact ? " evidence-art--compact" : ""}`} role="img" aria-label="Illustration abstraite d’une image et de ses sources">
      <div className="evidence-art__meta"><span>ATELIER DE VÉRIFICATION</span><span>H·01</span></div>
      <div className="evidence-art__photo">
        <svg viewBox="0 0 620 410" aria-hidden="true">
          <rect width="620" height="410" fill="#E7E5D9" />
          <circle cx="468" cy="102" r="47" fill="#D6EE75" />
          <path d="M0 280 150 155l103 97 113-130 254 207v81H0z" fill="#81937C" />
          <path d="m0 325 180-108 116 91 135-117 189 137v82H0z" fill="#385D4B" />
          <path d="m0 310 88-63 74 28 84-48 94 54 99-73 99 56 82-38v184H0z" fill="#254438" />
          <path d="M70 319h91v91H70zM184 287h78v123h-78zM285 328h108v82H285zM415 293h78v117h-78zM510 328h64v82h-64z" fill="#F6F5EF" />
          <path d="M87 342h17v25H87zm35 0h17v25h-17zm77-29h16v24h-16zm34 0h16v24h-16zm84 39h19v28h-19zm41 0h19v28h-19zm75-39h16v24h-16zm33 0h16v24h-16zm55 34h13v20h-13zm27 0h13v20h-13z" fill="#C76A4C" />
          <path d="M0 376c81-19 115 2 180-8s111-25 183-8 151 11 257-8v58H0z" fill="#172421" opacity=".16" />
        </svg>
        <span className="evidence-art__image-label"><Eye size={13} /> IMAGE · EXEMPLE VISUEL</span>
      </div>
      <div className="evidence-art__frame evidence-art__frame--one" aria-hidden="true"><span /> <span /> <span /> <span /></div>
      <div className="evidence-note evidence-note--source">
        <div className="evidence-note__index">01 / SOURCE</div>
        <strong>Une piste à consulter</strong>
        <span><i /> Publication locale · 2024</span>
      </div>
      <div className="evidence-note evidence-note--status">
        <div className="evidence-note__index">CONCLUSION ÉDITORIALE</div>
        <strong><span className="evidence-note__dot" /> À vérifier</strong>
        <span>La décision reste humaine.</span>
      </div>
      <div className="evidence-art__caption">VISUEL D’ILLUSTRATION · DONNÉES FICTIVES</div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className="landing-page" id="top">
      <header className="landing-header">
        <Brand />
        <nav className="landing-nav" aria-label="Navigation principale">
          <a href="#methode">La méthode</a>
          <a href="#engagements">Nos engagements</a>
          <a href="#android">Android</a>
        </nav>
        <div className="landing-header__actions">
          <Link className="landing-login" href="/connexion">Se connecter</Link>
          <Link className="button button--dark button--small" href="/connexion?next=%2Fverification">Ouvrir Hamarino <ArrowUpRight size={15} /></Link>
        </div>
      </header>

      <section className="landing-hero" aria-labelledby="hero-title">
        <div className="landing-hero__copy">
          <div className="eyebrow"><span className="eyebrow__rule" /> LE BUREAU DE RECOUPEMENT VISUEL · MADAGASCAR</div>
          <h1 id="hero-title">Chaque image a une histoire.<br /><em>Vérifions son contexte.</em></h1>
          <p className="landing-hero__intro">Hamarino aide les journalistes à examiner une image, à retrouver des sources consultables et à savoir ce qu’il reste à confirmer.</p>
          <div className="landing-hero__actions">
            <Link className="button button--dark" href="/connexion?next=%2Fverification">Commencer un recoupement <ArrowRight size={16} /></Link>
            <a className="text-link" href="#methode">Découvrir la méthode <ArrowDown size={14} /></a>
          </div>
          <div className="landing-hero__footnote"><Check size={14} /> Un outil d’appui éditorial. Pas un verdict automatique.</div>
        </div>
        <div className="landing-hero__visual"><EvidenceArtwork /></div>
        <div className="landing-hero__folio" aria-hidden="true"><span>DOSSIER</span><strong>01</strong><span>URBIX · 2026</span></div>
      </section>

      <section className="landing-ribbon" aria-label="Principes du service">
        <span>OBSERVER</span><i /> <span>RECOUPER</span><i /> <span>CONTEXTUALISER</span><i /> <span>DÉCIDER EN RÉDACTION</span>
      </section>

      <section className="landing-method" id="methode" aria-labelledby="method-title">
        <div className="section-heading">
          <div><div className="eyebrow"><span className="eyebrow__rule" /> UNE MÉTHODE LISIBLE</div><h2 id="method-title">Du premier regard<br />à la source consultée.</h2></div>
          <p>Une image seule ne suffit pas à établir où ni quand une scène a été photographiée. Hamarino rend les pistes et leurs limites visibles, étape par étape.</p>
        </div>
        <div className="method-steps">
          <article className="method-step-card"><span className="method-step-card__number">01</span><div className="method-step-card__mark"><Eye size={19} /></div><h3>Décrire ce qui se voit</h3><p>Déposez une image et formulez le contexte qui circule. Les observations visuelles sont présentées séparément des faits.</p><span className="method-step-card__line" /></article>
          <article className="method-step-card"><span className="method-step-card__number">02</span><div className="method-step-card__mark"><ArrowUpRight size={19} /></div><h3>Ouvrir les pistes</h3><p>La recherche aide à repérer des publications et sources accessibles pour examiner l’affirmation.</p><span className="method-step-card__line" /></article>
          <article className="method-step-card"><span className="method-step-card__number">03</span><div className="method-step-card__mark"><Check size={19} /></div><h3>Garder la main</h3><p>Consultez les liens, voyez les incertitudes et choisissez les vérifications à mener avant publication.</p><span className="method-step-card__line" /></article>
        </div>
      </section>

      <section className="landing-principles" id="engagements" aria-labelledby="principles-title">
        <div className="landing-principles__title"><div className="eyebrow eyebrow--light"><span className="eyebrow__rule" /> LA RÉDACTION GARDE LE DERNIER MOT</div><h2 id="principles-title">La preuve d’abord.<br /><em>L’outil à sa juste place.</em></h2><p>Hamarino ne certifie pas l’authenticité d’un fichier. Il aide à organiser un premier recoupement à partir d’indices visuels et de sources consultables.</p><Link className="button button--paper" href="/connexion?next=%2Fverification">Voir l’espace de travail <ArrowRight size={16} /></Link></div>
        <div className="principle-list">
          <article><span>01</span><div><h3>Les sources restent visibles</h3><p>Les liens proviennent des citations retournées par la recherche, pas de liens inventés dans un texte de modèle.</p></div><ArrowUpRight size={17} /></article>
          <article><span>02</span><div><h3>L’incertitude est nommée</h3><p>Sans citation utile, le contexte reste « à vérifier ». Aucun score ne transforme une estimation en certitude.</p></div><ArrowUpRight size={17} /></article>
          <article><span>03</span><div><h3>Le travail journalistique continue</h3><p>Les pistes proposées sont à consulter et à recouper avec le terrain et les sources locales.</p></div><ArrowUpRight size={17} /></article>
        </div>
      </section>

      <section className="landing-android" id="android" aria-labelledby="android-title">
        <div className="landing-android__device" aria-hidden="true"><div className="device-shell"><div className="device-camera" /><div className="device-brand">hamarino<span>.</span></div><div className="device-picture"><div /><i /><b /><span /></div><div className="device-lines"><i /><i /><i /></div><div className="device-source"><span>À VÉRIFIER</span><i /></div><div className="device-tabbar"><i /><i /><i /></div></div><div className="device-shadow" /></div>
        <div className="landing-android__copy"><div className="eyebrow"><span className="eyebrow__rule" /> L’ENQUÊTE DANS VOTRE POCHE</div><h2 id="android-title">Hamarino, aussi<br /><em>sur Android.</em></h2><p>Une interface pensée pour les écrans mobiles, les images reçues sur le terrain et les vérifications à poursuivre en rédaction.</p><div className="android-release"><button className="button button--dark" type="button" disabled><Download size={16} /> APK en préparation</button><span><Smartphone size={14} /> Téléchargement disponible après publication</span></div></div>
        <div className="landing-android__stamp">ANDROID<br /><strong>APP</strong><span>URBIX / HMR</span></div>
      </section>

      <section className="landing-cta">
        <div className="eyebrow"><span className="eyebrow__rule" /> HAMARINO BY URBIX</div>
        <h2>Une image mérite<br /><em>plus qu’un partage.</em></h2>
        <p>Donnez à votre équipe un point de départ clair pour vérifier ce qui circule.</p>
        <Link className="button button--dark" href="/connexion?next=%2Fverification">Entrer dans Hamarino <ArrowRight size={16} /></Link>
      </section>

      <footer className="landing-footer"><Brand /><span>Chaque image mérite ses sources.</span><Link href="/confidentialite">Données et confidentialité</Link><span>© 2026 URBIX · ANTANANARIVO</span><a href="#top">Retour en haut ↑</a></footer>
    </main>
  );
}
