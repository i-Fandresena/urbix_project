import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Download, ExternalLink } from "lucide-react";
import { BrandLockup } from "@/app/brand-lockup";
import { getServerLocale } from "@/lib/i18n/server";
import { staffTranslator } from "@/lib/i18n/staff";
import { VERDICT_WORDS } from "@/lib/messenger-bridge";
import { getPublication } from "@/lib/workflow";
import "../../staff.css";

export const metadata: Metadata = { title: "Vérification — Laverta" };

export default async function PublicationPage(props: { params: Promise<{ id: string }> }) {
  const locale = await getServerLocale();
  const t = staffTranslator(locale);
  const { id } = await props.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const item = await getPublication(id);
  if (!item) notFound();
  const date = new Intl.DateTimeFormat(locale === "mg" ? "fr" : locale, { dateStyle: "long" });
  const base = process.env.BETTER_AUTH_URL ?? "";
  const shareUrl = `${base}/verifications/${item.id}`;

  return (
    <div className="public-verif">
      <header className="public-verif__top"><BrandLockup label={t("nav.home")} /><nav><Link href="/verifications">{t("pub.back")}</Link><Link href="/signaler">{t("nav.report")}</Link></nav></header>
      <main className="staff-main" style={{ margin: "0 auto", maxWidth: 860 }}>
        <nav className="staff-breadcrumb" aria-label={t("case.breadcrumb")}><Link href="/verifications">{t("pub.title")}</Link><span aria-hidden="true">/</span><span>{t(`theme.${item.theme}`)}</span></nav>
        <header className="staff-head">
          <div className="staff-eyebrow">{t("pub.verdictLabel")} : {VERDICT_WORDS[locale][item.verdict]}</div>
          <h1>{item.assertion}</h1>
          <p className="staff-muted">{t("pub.published", { date: date.format(item.published_at) })}{item.updated_at > item.published_at ? ` · ${t("pub.updated", { date: date.format(item.updated_at) })}` : ""} · {t("pub.reports", { count: item.report_count })}</p>
        </header>
        <div className="staff-stack">
          <section className="staff-card"><h2>{t("pub.correction")}</h2><p style={{ fontSize: 17, lineHeight: 1.6 }}>{item.correction}</p></section>
          <section className="staff-card"><h2>{t("pub.why")}</h2><p>{item.rationale}</p>
            <h3>{t("pub.sources")}</h3>
            <ul>{item.sources.map((source) => <li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer nofollow"><ExternalLink size={13} aria-hidden="true" /> {source.title}</a></li>)}</ul>
          </section>
          <section className="staff-card">
            <h2>{t("pub.share")}</h2>
            <p className="staff-muted">{t("pub.shareHint")}</p>
            <div className="staff-actions">
              {(["fr", "mg", "en"] as const).map((lang) => (["square", "story"] as const).map((format) => (
                <a key={`${lang}-${format}`} className="staff-btn staff-btn--quiet" href={`/api/publications/${item.id}/visual?lang=${lang}&format=${format}`} download={`laverta-${item.id.slice(0, 8)}-${lang}-${format}.png`}><Download size={14} aria-hidden="true" /> {lang.toUpperCase()} · {t(`pub.format.${format}`)}</a>
              )))}
            </div>
            <p className="staff-muted" style={{ marginTop: 10 }}>{t("pub.link")} : <code>{shareUrl}</code></p>
            <div className="staff-actions">
              <a className="staff-btn staff-btn--quiet" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer">Facebook</a>
              <a className="staff-btn staff-btn--quiet" href={`https://wa.me/?text=${encodeURIComponent(`${VERDICT_WORDS[locale][item.verdict]} — ${item.assertion}\n${shareUrl}`)}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            </div>
          </section>
        </div>
        <p className="staff-muted" style={{ marginTop: 18 }}>{t("pub.rule")}</p>
      </main>
    </div>
  );
}
