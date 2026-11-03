import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import LoginForm from "./login-form";
import QueryNotice from "./query-notice";
import { getAuthSession } from "@/lib/auth";
import { isAuthConfigured, isEmailDeliveryConfigured } from "@/lib/auth-config";
import { getServerLocale } from "@/lib/i18n/server";
import { translate, type MessageKey } from "@/lib/i18n/messages";
import { BrandLockup } from "@/app/brand-lockup";

export const metadata: Metadata = {
  title: "Connexion — Laverta",
  description: "Connectez-vous à votre espace éditorial Laverta.",
};

function Brand({ label }: { label: string }) {
  return <BrandLockup label={label} inverse />;
}

function AuthArtwork({ t }: { t: (key: MessageKey) => string }) {
  return (
      <div className="evidence-art evidence-art--compact" role="img" aria-label={t("landing.artAria")}>
      <div className="evidence-art__meta"><span>{t("auth.storyKicker")}</span><span>01</span></div>
      <div className="evidence-art__photo"><svg viewBox="0 0 620 410" aria-hidden="true"><rect width="620" height="410" fill="#DCE6F6" /><circle cx="458" cy="102" r="44" fill="#FFCA72" /><path d="M0 279 153 155l104 99 112-131 251 205v82H0z" fill="#86A7E9" /><path d="m0 324 181-108 115 91 136-117 188 137v83H0z" fill="#4875D7" /><path d="m0 310 88-63 74 28 84-48 94 54 99-73 99 56 82-38v184H0z" fill="#1D438E" /><path d="M70 319h91v91H70zM184 287h78v123h-78zM285 328h108v82H285zM415 293h78v117h-78zM510 328h64v82h-64z" fill="#F5F7FB" /><path d="M87 342h17v25H87zm35 0h17v25h-17zm77-29h16v24h-16zm34 0h16v24h-16zm84 39h19v28h-19zm41 0h19v28h-19zm75-39h16v24h-16zm33 0h16v24h-16zm55 34h13v20h-13zm27 0h13v20h-13z" fill="#F39B75" /></svg><span className="evidence-art__image-label">{t("landing.artImage")}</span></div>
      <div className="evidence-art__frame evidence-art__frame--one" aria-hidden="true"><span /><span /><span /><span /></div>
      <div className="evidence-note evidence-note--source"><div className="evidence-note__index">{t("landing.artRoute")}</div><strong>{t("landing.artQuestion")}</strong><span><i /> {t("landing.artSource")}</span></div>
      <div className="evidence-note evidence-note--status"><div className="evidence-note__index">{t("landing.artStep3")}</div><strong><span className="evidence-note__dot" /> {t("landing.artHuman")}</strong><span>{t("landing.artEditor")}</span></div>
      <div className="evidence-art__caption">{t("landing.artCaption")}</div>
    </div>
  );
}

export default async function ConnexionPage(props: { searchParams: Promise<{ configuration?: string }> }) {
  const locale = await getServerLocale();
  const { configuration } = await props.searchParams;
  const t = (key: MessageKey) => translate(locale, key);
  const configured = isAuthConfigured();
  let authenticated = false;
  let authUnavailable = false;
  if (configured) {
    try {
      authenticated = Boolean(await getAuthSession());
    } catch (error) {
      authUnavailable = true;
      const code = typeof error === "object" && error !== null && "code" in error
        ? String(error.code)
        : error instanceof Error ? error.name : "unknown";
      console.error("Better Auth could not validate the session against PostgreSQL.", code);
    }
  }
  // A configuration error came from a protected page; bouncing back there would loop forever.
  if (authenticated && configuration === undefined) redirect("/espace");

  return (
    <main className="auth-page">
      <div className="auth-split">
        <section className="auth-story" aria-label={t("brand.name")}>
          <Brand label={t("nav.home")} />
          <div className="auth-story__content">
            <span className="auth-story__kicker">{t("auth.storyKicker")}</span>
            <h1>{t("auth.storyTitleA")}<br /><em>{t("auth.storyTitleB")}</em></h1>
            <p>{t("auth.storyText")}</p>
            <AuthArtwork t={t} />
          </div>
          <div className="auth-story__footer"><span>URBIX · ANTANANARIVO</span><span>{t("auth.storyFooter")}</span></div>
        </section>
        <section className="auth-panel" aria-labelledby="auth-title">
          <div className="auth-panel__inner">
            <div className="auth-panel__top"><Link href="/"><ArrowLeft size={13} /> {t("auth.backHome")}</Link></div>
            <div className="auth-mobile-brand"><Brand label={t("nav.home")} /></div>
            <div className="auth-heading"><span className="auth-heading__eyebrow">{t("auth.panelKicker")}</span><h2 id="auth-title">{t("auth.panelTitle")}</h2><p>{t("auth.panelText")}</p></div>
            <Suspense fallback={null}><QueryNotice /></Suspense>
            {authUnavailable && <p className="auth-message auth-message--error" role="alert">{t("auth.databaseUnavailable")}</p>}
            <LoginForm configured={configured} emailConfigured={configured && isEmailDeliveryConfigured()} serviceUnavailable={authUnavailable} />
            <div className="auth-panel__back"><Link href="/"><ArrowUpRight size={13} /> {t("auth.discover")}</Link></div>
          </div>
        </section>
      </div>
    </main>
  );
}
