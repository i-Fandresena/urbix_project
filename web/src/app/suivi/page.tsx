import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import TrackingForm from "./tracking-form";
import { BrandLockup } from "@/app/brand-lockup";
import { getServerLocale } from "@/lib/i18n/server";
import { translate, type MessageKey } from "@/lib/i18n/messages";

export const metadata: Metadata = {
  title: "Suivre un signalement — Laverta",
  description: "Consultez l’avancement d’un signalement Laverta avec son code LV.",
};

export default async function SuiviPage() {
  const locale = await getServerLocale();
  const t = (key: MessageKey) => translate(locale, key);
  return (
    <main className="public-flow">
      <header className="public-flow__header">
        <BrandLockup label={t("nav.home")} />
        <Link className="public-flow__back" href="/"><ArrowLeft size={14} /> {t("nav.home")}</Link>
      </header>
      <section className="public-flow__shell public-flow__shell--tracking" aria-labelledby="tracking-title">
        <div className="public-flow__eyebrow">{t("tracking.kicker")}</div>
        <h1 id="tracking-title">{t("tracking.titleA")}<br /><em>{t("tracking.titleB")}</em></h1>
        <p className="public-flow__intro">{t("tracking.intro")}</p>
        <TrackingForm />
      </section>
      <footer className="public-flow__footer"><span>LAVERTA · PAR URBIX</span><Link href="/signaler">{t("nav.report")}</Link><Link href="/confidentialite">{t("nav.privacy")}</Link></footer>
    </main>
  );
}
