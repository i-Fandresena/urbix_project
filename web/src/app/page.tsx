import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Activity, ArrowDown, ArrowRight, ArrowUpRight, BadgeCheck, Check, Eye, FileCheck2, LockKeyhole, Search, Share2, ShieldCheck } from "lucide-react";
import { BrandLockup } from "./brand-lockup";
import { LandingMotion, Reveal, RevealArticle } from "./landing-motion";
import { MethodIntro } from "./method-intro";
import { PointGlobeCanvas } from "./point-globe-canvas";
import { getServerLocale } from "@/lib/i18n/server";
import { translate, type Locale, type MessageKey } from "@/lib/i18n/messages";

export const metadata: Metadata = {
  title: "Laverta ? La correction doit suivre la rumeur",
  description: "Laverta relie les signalements, le travail de v?rification journalistique et la circulation des corrections ? Madagascar.",
};

function Brand({ homeLabel }: { homeLabel: string }) {
  return <BrandLockup className="orbit-brand" label={homeLabel} />;
}

function OrbitArtwork({ t }: { t: (key: MessageKey) => string }) {
  return (
    <div className="orbit-art" role="img" aria-label={t("landing.globeAria")}>
      <PointGlobeCanvas />
      <Image className="orbit-art__mascot" src="/brand/laverta-mascot.webp" alt="" width={640} height={606} />
      <span className="orbit-art__fiction">{t("landing.globeCaption")}</span>
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

function proofCards(t: (key: MessageKey) => string) {
  return [
    { number: "01", icon: <LockKeyhole size={15} aria-hidden="true" />, title: t("landing.proof1Title"), description: t("landing.proof1Text") },
    { number: "02", icon: <Search size={15} aria-hidden="true" />, title: t("landing.proof2Title"), description: t("landing.proof2Text") },
    { number: "03", icon: <ShieldCheck size={15} aria-hidden="true" />, title: t("landing.proof3Title"), description: t("landing.proof3Text") },
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

export default async function LandingPage() {
  const locale: Locale = await getServerLocale();
  const t = (key: MessageKey) => translate(locale, key);
  return (
    <LandingMotion>
      <main className="landing-page orbit-landing" id="top">
        <MethodIntro />
        <header className="orbit-header">
          <div className="orbit-header__inner">
            <Brand homeLabel={t("nav.home")} />
            <nav aria-label={t("landing.aria")}>
              <a href="#fonctionnalites">{t("nav.method")}</a>
              <a href="#demarrer">{t("landing.startLabel")}</a>
              <a href="#faq">FAQ</a>
              <Link href="/verifications">{t("nav.publicChecks")}</Link>
            </nav>
            <div className="orbit-header__actions">
              <Link className="orbit-header__login" href="/connexion">{t("nav.login")}</Link>
              <Link className="orbit-header__button" href="/signaler">{t("nav.report")} <ArrowUpRight size={14} /></Link>
            </div>
          </div>
        </header>

        <section className="orbit-hero" aria-labelledby="orbit-title">
          <OrbitArtwork t={t} />
          <Reveal className="orbit-hero__content">
            <div className="orbit-hero__emblem" aria-hidden="true">
              <Image className="orbit-hero__emblem-light" src="/brand/laverta-symbol.png" alt="" width={334} height={264} />
              <Image className="orbit-hero__emblem-dark" src="/brand/laverta-symbol-on-dark.png" alt="" width={334} height={264} />
            </div>
            <h1 id="orbit-title">{t("brand.name")}<span>.</span></h1>
            <p className="orbit-hero__tagline">{t("landing.titleA")} <em>{t("landing.titleB")}</em></p>
            <p className="orbit-hero__description">{t("landing.description")}</p>
            <div className="orbit-hero__actions">
              <Link className="orbit-button orbit-button--primary" href="/signaler"><FileCheck2 size={15} /> {t("landing.reportCta")} <ArrowRight size={15} /></Link>
              <Link className="orbit-button orbit-button--quiet" href="/suivi"><Search size={15} /> {t("landing.trackCta")}</Link>
              <Link className="orbit-button orbit-button--quiet" href="/connexion?next=%2Fredaction"><LockKeyhole size={15} /> {t("nav.editorial")}</Link>
            </div>
            <div className="orbit-hero__assurance"><Check size={14} /> {t("landing.human")}</div>
            <div className="orbit-hero__proof" aria-label={t("landing.ribbonAria")}>
              {["landing.proof1Title", "landing.proof2Title", "landing.proof3Title"].map((key, index) => <span key={key}>{index > 0 && <i aria-hidden="true" />}{t(key as MessageKey)}</span>)}
            </div>
          </Reveal>
          <div className="orbit-hero__layers" aria-label={t("landing.ribbonAria")}>
            {["landing.stepSpot", "landing.stepCrosscheck", "landing.stepQualify", "landing.stepCirculate"].map((key, index) => (
              <span key={key}><i>{String(index + 1).padStart(2, "0")}</i>{t(key as MessageKey)}</span>
            ))}
          </div>
          <div className="orbit-hero__status"><span><i /> {t("landing.prototypeLabel")}</span><small>{t("landing.globeIllustrative")}</small></div>
        </section>

        <section className="landing-traction orbit-section" aria-labelledby="traction-title">
          <div className="landing-traction__heading"><div className="eyebrow"><span className="eyebrow__rule" /> {t("landing.tractionLabel")}</div><h2 id="traction-title">{t("landing.tractionTitle")}</h2><p>{t("landing.tractionText")}</p></div>
          <div className="landing-proof-grid">{proofCards(t).map((card) => <RevealArticle className="landing-proof-card" key={card.number}><span className="landing-proof-card__number">{card.number}<i>{card.icon}</i></span><h3>{card.title}</h3><p>{card.description}</p></RevealArticle>)}</div>
        </section>

        <section className="landing-method orbit-section" id="fonctionnalites" aria-labelledby="method-title">
          <div className="section-heading"><div><div className="eyebrow"><span className="eyebrow__rule" /> {t("landing.featureLabel")}</div><h2 id="method-title">{t("landing.featureTitleA")}<br /><em>{t("landing.featureTitleB")}</em></h2></div><p>{t("landing.featureText")}</p></div>
          <div className="landing-feature-grid">{featureCards(t).map((card, index) => <RevealArticle className="landing-feature-card" delay={(index % 3) * 0.05} key={card.title}><div className="landing-feature-card__icon">{card.icon}</div><h3>{card.title}</h3><p>{card.description}</p></RevealArticle>)}</div>
        </section>

        <section className="landing-start orbit-start" id="demarrer" aria-labelledby="start-title">
          <div className="section-heading"><div><div className="eyebrow"><span className="eyebrow__rule" /> {t("landing.startLabel")}</div><h2 id="start-title">{t("landing.startTitleA")}<br /><em>{t("landing.startTitleB")}</em></h2></div><p>{t("landing.startText")}</p></div>
          <div className="landing-start-grid">{startCards(t).map((card, index) => <RevealArticle className="landing-start-card" delay={index * 0.05} key={card.number}><span className="landing-start-card__number">{card.number}</span><div className="landing-start-card__icon">{card.icon}</div><h3>{card.title}</h3><p>{card.description}</p><Link href={card.href}>{card.action} <ArrowUpRight size={15} /></Link></RevealArticle>)}</div>
        </section>

        <section className="landing-bridge orbit-bridge" aria-label={t("landing.bridgeTitle")}><span className="landing-bridge__marker" aria-hidden="true"><Share2 size={19} /></span><div><h2>{t("landing.bridgeTitle")}</h2><p>{t("landing.bridgeText")}</p></div><Link className="button button--paper" href="/suivi">{t("nav.track")} <ArrowRight size={16} /></Link></section>

        <section className="landing-principles orbit-section" id="transparence" aria-labelledby="principles-title">
          <div className="landing-principles__title"><div className="eyebrow eyebrow--light"><span className="eyebrow__rule" /> {t("landing.transparencyLabel")}</div><h2 id="principles-title">{t("landing.transparencyTitleA")}<br /><em>{t("landing.transparencyTitleB")}</em></h2><p>{t("landing.transparencyText")}</p><Link className="button button--paper" href="/verification">{t("nav.analysis")} <ArrowRight size={16} /></Link></div>
          <div className="principle-list">{[1, 2, 3].map((item) => <article key={item}><span>{String(item).padStart(2, "0")}</span><div><h3>{t(`landing.transparency${item}Title` as MessageKey)}</h3><p>{t(`landing.transparency${item}Text` as MessageKey)}</p></div><ArrowUpRight size={17} /></article>)}</div>
        </section>

        <section className="landing-channels orbit-section" aria-labelledby="channels-title"><div className="section-heading"><div><div className="eyebrow"><span className="eyebrow__rule" /> {t("landing.channelsLabel")}</div><h2 id="channels-title">{t("landing.channelsTitle")}</h2></div><p>{t("landing.channelsText")}</p></div><div className="landing-channel-grid">{channelCards(t).map((card) => <Link className="landing-channel-card" href={card.href} key={card.title}><span className="landing-channel-card__icon">{card.icon}</span><span className="landing-channel-card__copy"><strong>{card.title}</strong><small>{card.description}</small></span><ArrowUpRight size={16} aria-hidden="true" /></Link>)}</div></section>

        <section className="landing-faq orbit-section" id="faq" aria-labelledby="faq-title"><div className="landing-faq__heading"><div className="eyebrow"><span className="eyebrow__rule" /> {t("landing.faqLabel")}</div><h2 id="faq-title">{t("landing.faqTitle")}</h2></div><div className="landing-faq__list">{[1, 2, 3, 4, 5].map((item) => <details className="landing-faq__item" key={item}><summary><span>{t(`landing.faq${item}Question` as MessageKey)}</span><span className="landing-faq__plus" aria-hidden="true" /></summary><p>{t(`landing.faq${item}Answer` as MessageKey)}</p></details>)}</div></section>

        <section className="landing-cta orbit-final"><div className="eyebrow"><span className="eyebrow__rule" /> {t("landing.closeLabel")}</div><h2>{t("landing.closeTitleA")}<br /><em>{t("landing.closeTitleB")}</em></h2><p>{t("landing.closeText")}</p><div className="landing-hero__actions"><Link className="button button--dark" href="/signaler">{t("landing.closePrimary")} <ArrowRight size={16} /></Link><a className="text-link" href="#fonctionnalites">{t("landing.closeSecondary")} <ArrowDown size={14} /></a></div></section>

        <footer className="landing-footer orbit-footer"><Brand homeLabel={t("nav.home")} /><span>{t("brand.tagline")}</span><Link href="/confidentialite">{t("nav.privacy")}</Link><Link href="/landing-editoriale">{t("landing.previousVersion")}</Link><span>{t("landing.footerCopyright")}</span><a href="#top">{t("landing.backTop")}</a></footer>
      </main>
    </LandingMotion>
  );
}
