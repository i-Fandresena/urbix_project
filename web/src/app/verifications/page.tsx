import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { BrandLockup } from "@/app/brand-lockup";
import { getServerLocale } from "@/lib/i18n/server";
import { staffTranslator } from "@/lib/i18n/staff";
import { VERDICT_WORDS } from "@/lib/messenger-bridge";
import { REPORT_THEMES } from "@/lib/reports";
import { listPublications } from "@/lib/workflow";
import "../staff.css";

export const metadata: Metadata = { title: "Vérifications publiées — Laverta", description: "Base publique des vérifications validées par la rédaction Laverta." };

export default async function PublicVerificationsPage(props: { searchParams: Promise<{ q?: string; theme?: string }> }) {
  const locale = await getServerLocale();
  const t = staffTranslator(locale);
  const { q = "", theme = "" } = await props.searchParams;
  const query = q.trim().slice(0, 120);
  const themeFilter = (REPORT_THEMES as readonly string[]).includes(theme) ? theme : "";
  let publications: Awaited<ReturnType<typeof listPublications>> = [];
  let unavailable = false;
  try { publications = await listPublications(query, themeFilter); } catch { unavailable = true; }
  const date = new Intl.DateTimeFormat(locale === "mg" ? "fr" : locale, { dateStyle: "long" });

  return (
    <div className="public-verif">
      <header className="public-verif__top"><BrandLockup label={t("nav.home")} /><nav><Link href="/signaler">{t("nav.report")}</Link><Link href="/suivi">{t("pub.track")}</Link></nav></header>
      <main className="staff-main" style={{ margin: "0 auto" }}>
        <header className="staff-head"><div className="staff-eyebrow">{t("pub.eyebrow")}</div><h1>{t("pub.title")}</h1><p>{t("pub.intro")}</p></header>
        <form className="staff-filters" method="get" role="search">
          <label style={{ flex: "1 1 260px" }}>{t("pub.search")}<input type="search" name="q" defaultValue={query} maxLength={120} placeholder={t("pub.searchPlaceholder")} /></label>
          <label>{t("field.theme")}<select name="theme" defaultValue={themeFilter}><option value="">{t("queue.all")}</option>{REPORT_THEMES.map((item) => <option key={item} value={item}>{t(`theme.${item}`)}</option>)}</select></label>
          <button className="staff-btn" type="submit"><Search size={15} aria-hidden="true" /> {t("pub.searchButton")}</button>
        </form>
        {unavailable ? <div className="staff-empty">{t("pub.unavailable")}</div> : publications.length === 0 ? <div className="staff-empty">{t("pub.empty")}</div> : (
          <div className="staff-list">
            {publications.map((item) => (
              <Link className="staff-item" key={item.id} href={`/verifications/${item.id}`}>
                <div className="staff-meta"><span className="staff-tag staff-tag--strong">{VERDICT_WORDS[locale][item.verdict]}</span><span>{t(`theme.${item.theme}`)}</span>{item.region && <span>{item.region}</span>}<time dateTime={item.published_at.toISOString()}>{date.format(item.published_at)}</time></div>
                <h3>{item.assertion}</h3>
                <span className="staff-muted">{item.correction.slice(0, 220)}{item.correction.length > 220 ? "…" : ""}</span>
                <div className="staff-meta"><span>{t("pub.read")}</span><ArrowRight size={14} aria-hidden="true" /></div>
              </Link>
            ))}
          </div>
        )}
        <p className="staff-muted" style={{ marginTop: 18 }}>{t("pub.rule")}</p>
      </main>
    </div>
  );
}
