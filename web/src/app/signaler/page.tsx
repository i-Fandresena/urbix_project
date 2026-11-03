import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ReportForm from "./report-form";
import { BrandLockup } from "@/app/brand-lockup";
import { getServerLocale } from "@/lib/i18n/server";
import { translate, type MessageKey } from "@/lib/i18n/messages";

export const metadata: Metadata = {
  title: "Signaler une rumeur — Laverta",
  description: "Transmettez une affirmation et son image ou sa publication à la rédaction Laverta.",
};

export default async function SignalerPage() {
  const locale = await getServerLocale();
  const t = (key: MessageKey) => translate(locale, key);
  return (
    <main className="public-flow">
      <header className="public-flow__header">
        <BrandLockup label={t("nav.home")} />
        <Link className="public-flow__back" href="/"><ArrowLeft size={14} /> {t("nav.home")}</Link>
      </header>
      <section className="public-flow__shell" aria-labelledby="report-title">
        <div className="public-flow__eyebrow">{t("report.kicker")}</div>
        <h1 id="report-title">{t("report.titleA")}<br /><em>{t("report.titleB")}</em></h1>
        <p className="public-flow__intro">{t("report.intro")}</p>
        <ReportForm />
        <p className="public-flow__footnote">{t("report.footnote")}</p>
      </section>
      <footer className="public-flow__footer"><span>LAVERTA · PAR URBIX</span><Link href="/confidentialite">{t("nav.privacy")}</Link><Link href="/suivi">{t("nav.track")}</Link></footer>
    </main>
  );
}
