import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getServerLocale } from "@/lib/i18n/server";
import { translate, type MessageKey } from "@/lib/i18n/messages";
import { BrandLockup } from "@/app/brand-lockup";

export const metadata: Metadata = {
  title: "Données et confidentialité — Laverta",
  description: "Comment Laverta traite les données de signalement, de compte et les images.",
};

function Brand({ label }: { label: string }) {
  return <BrandLockup label={label} />;
}

export default async function PrivacyPage() {
  const locale = await getServerLocale();
  const t = (key: MessageKey) => translate(locale, key);
  return (
    <main className="policy-page">
      <header><Brand label={t("nav.home")} /><Link className="policy-back" href="/"><ArrowLeft size={14} /> {t("auth.backHome")}</Link></header>
      <article className="policy-content">
        <div className="eyebrow"><span className="eyebrow__rule" /> LAVERTA · URBIX</div>
        <h1>{t("privacy.title")}</h1>
        <p className="policy-lede">{t("privacy.lede")}</p>

        <section><span>01</span><div><h2>{t("privacy.section1")}</h2><p>{t("privacy.section1Text")}</p></div></section>
        <section><span>02</span><div><h2>{t("privacy.section2")}</h2><p>{t("privacy.section2Text")}</p></div></section>
        <section><span>03</span><div><h2>{t("privacy.section3")}</h2><p>{t("privacy.section3Text")}</p></div></section>
        <section><span>04</span><div><h2>{t("privacy.section4")}</h2><p>{t("privacy.section4Text")}</p></div></section>
        <section><span>05</span><div><h2>{t("privacy.section5")}</h2><p>{t("privacy.section5Text")}</p></div></section>

        <div className="policy-note"><strong>{t("privacy.demoTitle")}</strong><p>{t("privacy.demoText")}</p></div>
        <p className="policy-footnote">{t("privacy.versionNote")}</p>
      </article>
    </main>
  );
}
