import type { Metadata } from "next";
import Link from "next/link";
import { Activity, ArrowDown, ArrowRight, ArrowUpRight, BadgeCheck, Check, Eye, FileCheck2, LockKeyhole, Search, Share2, ShieldCheck } from "lucide-react";
import { LandingMotion, Reveal, RevealArticle } from "../landing-motion";
import { SignalLottie } from "../signal-lottie";
import { BrandLockup } from "@/app/brand-lockup";
import { getServerLocale } from "@/lib/i18n/server";
import { translate, type Locale, type MessageKey } from "@/lib/i18n/messages";

export const metadata: Metadata = {
  title: "Laverta — La correction doit suivre la rumeur",
  description: "Laverta aide les rédactions à signaler, vérifier et faire circuler les corrections à Madagascar.",
};

function Brand({ homeLabel }: { homeLabel: string }) {
  return <BrandLockup label={homeLabel} />;
}

function EvidenceArtwork({ t }: { t: (key: MessageKey) => string }) {
  return (
    <div className="evidence-art evidence-art--intelligence" role="img" aria-label={t("landing.artAria")}>
      <div className="evidence-art__topline">
        <span><i /> {t("landing.artExample")}</span>
        <span>ANTANANARIVO · 01</span>
      </div>
      <div className="evidence-art__paper">
        <div className="evidence-art__paper-head"><span>{t("landing.artContext")}</span><span>{t("landing.artFiction")}</span></div>
        <div className="evidence-art__photo">
          <svg viewBox="0 0 620 350" aria-hidden="true">
            <defs>
              <pattern id="laverta-map-grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="#65dff5" strokeOpacity=".14" strokeWidth="1" /></pattern>
              <linearGradient id="laverta-terrain" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#4ed8f4" stopOpacity=".22" /><stop offset="1" stopColor="#1a56ff" stopOpacity=".03" /></linearGradient>
            </defs>
            <rect width="620" height="350" fill="#0b1726" />
            <rect width="620" height="350" fill="url(#laverta-map-grid)" />
            <g fill="none" stroke="#6c94b6" strokeOpacity=".33">
              <path d="M34 274c73-38 118-31 168-70s96-55 151-40 112 27 232-29" />
              <path d="M21 303c90-42 142-33 199-73s101-54 160-36 111 24 220-30" />
              <path d="M57 244c72-47 111-42 158-76s93-61 150-44 109 34 218-23" />
              <path d="M82 206c54-36 91-37 132-64s86-45 131-31 85 32 150 5" />
            </g>
            <path d="M346 49c-16 9-24 26-23 43 1 18-12 31-12 48 0 17 11 27 8 43-3 17 5 30 8 45 3 24-7 42 6 60 9 12 25 9 34-3 10-13 11-31 21-44 12-16 15-33 13-53-1-16 12-28 13-46 1-14-6-28-5-41 1-15-3-31-15-41-13-12-29-21-48-12z" fill="url(#laverta-terrain)" stroke="#62e1fb" strokeWidth="2" />
            <path d="M164 214 303 171l55-8 58-43 83-23" fill="none" stroke="#56d9f4" strokeDasharray="4 7" strokeWidth="1.5" />
            <g fill="#76eaff"><circle cx="164" cy="214" r="4" /><circle cx="358" cy="163" r="5" /><circle cx="416" cy="120" r="4" /><circle cx="499" cy="97" r="4" /></g>
            <circle cx="358" cy="163" r="19" fill="none" stroke="#76eaff" strokeOpacity=".75" />
            <path d="M358 136v11m0 32v11m-27-27h11m32 0h11" fill="none" stroke="#76eaff" strokeOpacity=".7" />
            <g fill="#a9bfd1" fontFamily="monospace" fontSize="9" letterSpacing="1.1"><text x="36" y="43">18°54′ S</text><text x="424" y="320">{t("landing.artSourceTrace")}</text><text x="556" y="58">N</text></g>
            <path d="M560 66v25m-4-4 4 4 4-4" fill="none" stroke="#a9bfd1" strokeWidth="1.2" />
          </svg>
          <span className="evidence-art__image-label"><Eye size={12} /> {t("landing.artImage")}</span>
          <span className="evidence-art__scanline" aria-hidden="true" />
        </div>
        <div className="evidence-art__case-foot">
          <span>{t("landing.artSignal")}</span>
          <span className="evidence-art__route">{t("landing.artRoute")} <i /> {t("landing.artContextShort")}</span>
          <span>{t("landing.artCrosscheck")}</span>
        </div>
      </div>
      <div className="evidence-note evidence-note--source">
        <SignalLottie className="evidence-art__signal" />
        <div className="evidence-note__index">{t("landing.artStep1")}</div>
        <strong>{t("landing.artQuestion")}</strong>
        <span>{t("landing.artSource")}</span>
      </div>
      <div className="evidence-note evidence-note--status">
        <div className="evidence-note__index">{t("landing.artStep3")}</div>
        <strong><span className="evidence-note__dot" /> {t("landing.artHuman")}</strong>
        <span>{t("landing.artEditor")}</span>
      </div>
      <div className="evidence-art__caption">{t("landing.artCaption")}</div>
    </div>
  );
}

function featureCards(t: (key: MessageKey) => string) {
  return [
    { icon: <FileCheck2 size={19} aria-hidden="true" />, title: t("landing.feature1Title"), description: t("landing.feature1Text") },
    { icon: <Eye size={19} aria-hidden="true" />, title: t("landing.feature2Title"), description: t("landing.feature2Text") },
    { icon: <Search size={19} aria-hidden="true" />, title: t("landing.feature3Title"), description: t("landing.feature3Text") },
    { icon: <Activity size={19} aria-hidden="true" />, title: t("landing.feature4Title"), description: t("landing.feature4Text") },
    { icon: <BadgeCheck size={19} aria-hidden="true" />, title: t("landing.feature5Title"), description: t("landing.feature5Text") },
    { icon: <Share2 size={19} aria-hidden="true" />, title: t("landing.feature6Title"), description: t("landing.feature6Text") },
  ];
}

function startCards(t: (key: MessageKey) => string) {
  return [
    { number: "01", icon: <FileCheck2 size={18} aria-hidden="true" />, title: t("landing.start1Title"), description: t("landing.start1Text"), action: t("landing.start1Action"), href: "/signaler" },
    { number: "02", icon: <Search size={18} aria-hidden="true" />, title: t("landing.start2Title"), description: t("landing.start2Text"), action: t("landing.start2Action"), href: "/suivi" },
    { number: "03", icon: <LockKeyhole size={18} aria-hidden="true" />, title: t("landing.start3Title"), description: t("landing.start3Text"), action: t("landing.start3Action"), href: "/connexion?next=%2Fredaction" },
  ];
}

function channelCards(t: (key: MessageKey) => string) {
  return [
    { icon: <FileCheck2 size={18} aria-hidden="true" />, title: t("landing.channel1Title"), description: t("landing.channel1Text"), href: "/signaler" },
    { icon: <Search size={18} aria-hidden="true" />, title: t("landing.channel2Title"), description: t("landing.channel2Text"), href: "/suivi" },
    { icon: <LockKeyhole size={18} aria-hidden="true" />, title: t("landing.channel3Title"), description: t("landing.channel3Text"), href: "/connexion?next=%2Fredaction" },
    { icon: <Eye size={18} aria-hidden="true" />, title: t("landing.channel4Title"), description: t("landing.channel4Text"), href: "/verification" },
  ];
}

function proofCards(t: (key: MessageKey) => string) {
  return [
    { number: "01", icon: <LockKeyhole size={15} aria-hidden="true" />, title: t("landing.proof1Title"), description: t("landing.proof1Text") },
    { number: "02", icon: <Search size={15} aria-hidden="true" />, title: t("landing.proof2Title"), description: t("landing.proof2Text") },
    { number: "03", icon: <ShieldCheck size={15} aria-hidden="true" />, title: t("landing.proof3Title"), description: t("landing.proof3Text") },
  ];
}

export default async function LandingPage() {
  const locale: Locale = await getServerLocale();
  const t = (key: MessageKey) => translate(locale, key);
  return (
    <LandingMotion>
      <main className="landing-page" id="top">
        <header className="landing-header">
          <Brand homeLabel={t("nav.home")} />
          <nav className="landing-nav" aria-label={t("landing.aria")}>
            <a href="#fonctionnalites">{t("nav.method")}</a>
            <a href="#demarrer">{t("landing.startLabel")}</a>
            <a href="#transparence">{t("nav.commitments")}</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="landing-header__actions">
            <Link className="landing-login" href="/connexion">{t("nav.login")}</Link>
            <Link className="button button--dark button--small" href="/signaler">{t("landing.reportCta")} <ArrowUpRight size={15} /></Link>
          </div>
        </header>

        <section className="landing-hero" aria-labelledby="hero-title">
          <Reveal className="landing-hero__copy">
            <div className="eyebrow"><span className="eyebrow__rule" /> {t("landing.kicker")}</div>
            <h1 id="hero-title">{t("landing.titleA")}<br /><em>{t("landing.titleB")}</em></h1>
            <p className="landing-hero__intro">{t("landing.description")}</p>
            <div className="landing-hero__actions">
              <Link className="button button--dark" href="/signaler">{t("landing.reportCta")} <ArrowRight size={16} /></Link>
              <Link className="text-link" href="/suivi">{t("landing.trackCta")} <ArrowUpRight size={14} /></Link>
              <a className="text-link" href="#fonctionnalites">{t("landing.methodCta")} <ArrowDown size={14} /></a>
            </div>
            <div className="landing-hero__footnote"><Check size={14} /> {t("landing.human")}</div>
          </Reveal>
          <Reveal className="landing-hero__visual" delay={0.12}><EvidenceArtwork t={t} /></Reveal>
          <div className="landing-hero__folio" aria-hidden="true"><span>URBIX</span><strong>01</strong><span>ANTANANARIVO</span></div>
        </section>

        <section className="landing-traction" aria-labelledby="traction-title">
          <div className="landing-traction__heading">
            <div className="eyebrow"><span className="eyebrow__rule" /> {t("landing.tractionLabel")}</div>
            <h2 id="traction-title">{t("landing.tractionTitle")}</h2>
            <p>{t("landing.tractionText")}</p>
          </div>
          <div className="landing-proof-grid">
            {proofCards(t).map((card) => (
              <RevealArticle className="landing-proof-card" key={card.number}>
                <span className="landing-proof-card__number">{card.number}<i>{card.icon}</i></span>
                <h3>{card.title}</h3><p>{card.description}</p>
              </RevealArticle>
            ))}
          </div>
        </section>

        <section className="landing-method" id="fonctionnalites" aria-labelledby="method-title">
          <div className="section-heading">
            <div><div className="eyebrow"><span className="eyebrow__rule" /> {t("landing.featureLabel")}</div><h2 id="method-title">{t("landing.featureTitleA")}<br /><em>{t("landing.featureTitleB")}</em></h2></div>
            <p>{t("landing.featureText")}</p>
          </div>
          <div className="landing-feature-grid">
            {featureCards(t).map((card, index) => (
              <RevealArticle className="landing-feature-card" delay={(index % 3) * 0.06} key={card.title}>
                <div className="landing-feature-card__icon">{card.icon}</div><h3>{card.title}</h3><p>{card.description}</p>
              </RevealArticle>
            ))}
          </div>
        </section>

        <section className="landing-start" id="demarrer" aria-labelledby="start-title">
          <div className="section-heading">
            <div><div className="eyebrow"><span className="eyebrow__rule" /> {t("landing.startLabel")}</div><h2 id="start-title">{t("landing.startTitleA")}<br /><em>{t("landing.startTitleB")}</em></h2></div>
            <p>{t("landing.startText")}</p>
          </div>
          <div className="landing-start-grid">
            {startCards(t).map((card, index) => (
              <RevealArticle className="landing-start-card" delay={index * 0.06} key={card.number}>
                <span className="landing-start-card__number">{card.number}</span><div className="landing-start-card__icon">{card.icon}</div>
                <h3>{card.title}</h3><p>{card.description}</p><Link href={card.href}>{card.action} <ArrowUpRight size={15} /></Link>
              </RevealArticle>
            ))}
          </div>
        </section>

        <section className="landing-bridge" aria-label={t("landing.bridgeTitle")}>
          <span className="landing-bridge__marker" aria-hidden="true"><Share2 size={19} /></span>
          <div><h2>{t("landing.bridgeTitle")}</h2><p>{t("landing.bridgeText")}</p></div>
          <Link className="button button--paper" href="/suivi">{t("nav.track")} <ArrowRight size={16} /></Link>
        </section>

        <section className="landing-principles" id="transparence" aria-labelledby="principles-title">
          <div className="landing-principles__title">
            <div className="eyebrow eyebrow--light"><span className="eyebrow__rule" /> {t("landing.transparencyLabel")}</div>
            <h2 id="principles-title">{t("landing.transparencyTitleA")}<br /><em>{t("landing.transparencyTitleB")}</em></h2>
            <p>{t("landing.transparencyText")}</p><Link className="button button--paper" href="/verification">{t("nav.analysis")} <ArrowRight size={16} /></Link>
          </div>
          <div className="principle-list">
            {[1, 2, 3].map((item) => (
              <article key={item}><span>{String(item).padStart(2, "0")}</span><div><h3>{t(`landing.transparency${item}Title` as MessageKey)}</h3><p>{t(`landing.transparency${item}Text` as MessageKey)}</p></div><ArrowUpRight size={17} /></article>
            ))}
          </div>
        </section>

        <section className="landing-channels" aria-labelledby="channels-title">
          <div className="section-heading">
            <div><div className="eyebrow"><span className="eyebrow__rule" /> {t("landing.channelsLabel")}</div><h2 id="channels-title">{t("landing.channelsTitle")}</h2></div><p>{t("landing.channelsText")}</p>
          </div>
          <div className="landing-channel-grid">
            {channelCards(t).map((card) => (
              <Link className="landing-channel-card" href={card.href} key={card.title}>
                <span className="landing-channel-card__icon">{card.icon}</span><span className="landing-channel-card__copy"><strong>{card.title}</strong><small>{card.description}</small></span><ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>

        <section className="landing-faq" id="faq" aria-labelledby="faq-title">
          <div className="landing-faq__heading"><div className="eyebrow"><span className="eyebrow__rule" /> {t("landing.faqLabel")}</div><h2 id="faq-title">{t("landing.faqTitle")}</h2></div>
          <div className="landing-faq__list">
            {[1, 2, 3, 4, 5].map((item) => (
              <details className="landing-faq__item" key={item}>
                <summary><span>{t(`landing.faq${item}Question` as MessageKey)}</span><span className="landing-faq__plus" aria-hidden="true" /></summary>
                <p>{t(`landing.faq${item}Answer` as MessageKey)}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="landing-cta">
          <div className="eyebrow"><span className="eyebrow__rule" /> {t("landing.closeLabel")}</div>
          <h2>{t("landing.closeTitleA")}<br /><em>{t("landing.closeTitleB")}</em></h2><p>{t("landing.closeText")}</p>
          <div className="landing-hero__actions"><Link className="button button--dark" href="/signaler">{t("landing.closePrimary")} <ArrowRight size={16} /></Link><a className="text-link" href="#fonctionnalites">{t("landing.closeSecondary")} <ArrowDown size={14} /></a></div>
        </section>

        <footer className="landing-footer"><Brand homeLabel={t("nav.home")} /><span>{t("brand.tagline")}</span><Link href="/confidentialite">{t("nav.privacy")}</Link><Link href="/verification">{t("nav.analysis")}</Link><span>{t("landing.footerCopyright")}</span><a href="#top">{t("landing.backTop")}</a></footer>
      </main>
    </LandingMotion>
  );
}
