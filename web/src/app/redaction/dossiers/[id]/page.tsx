import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ExternalLink, FileImage, ShieldCheck } from "lucide-react";
import { getAuthSession } from "@/lib/auth";
import { isAuthConfigured } from "@/lib/auth-config";
import { getEditorialReport, REPORT_STATUSES, REPORT_VERDICTS, type ReportRow, type ReportStatus, type ReportVerdict, type ReportTheme } from "@/lib/reports";
import { isEditorialSession } from "@/lib/report-access";
import { saveEditorialDecision } from "@/app/redaction/actions";
import { getServerLocale } from "@/lib/i18n/server";
import { translate, type Locale, type MessageKey } from "@/lib/i18n/messages";
import { BrandLockup } from "@/app/brand-lockup";

export const metadata: Metadata = { title: "Dossier éditorial — Laverta", description: "Examen d’un signalement par la rédaction Laverta." };

const statusMessageKeys: Record<ReportStatus, MessageKey> = { new: "status.new", in_review: "status.inReview", referred: "status.referred", verified: "status.verified", closed: "status.closed" };
const verdictMessageKeys: Record<ReportVerdict, MessageKey> = { false: "verdict.false", true: "verdict.true", misleading: "verdict.misleading", unverifiable: "verdict.unverifiable" };
const themeMessageKeys: Record<ReportTheme, MessageKey> = { education: "theme.education", agriculture: "theme.agriculture", health: "theme.health", economy: "theme.economy", politics: "theme.politics", safety: "theme.safety", other: "theme.other" };

export default async function EditorialCasePage(props: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  const locale: Locale = await getServerLocale();
  const t = (key: MessageKey, values?: Record<string, string | number>) => translate(locale, key, values);
  const { id } = await props.params;
  const query = await props.searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  if (!isAuthConfigured()) redirect("/redaction");
  let session: Awaited<ReturnType<typeof getAuthSession>>;
  try { session = await getAuthSession(); } catch { redirect("/connexion?next=%2Fredaction"); }
  if (!session) redirect("/connexion?next=%2Fredaction");
  if (!isEditorialSession(session)) redirect("/redaction");

  let report: ReportRow | null;
  try { report = await getEditorialReport(id); } catch { redirect("/redaction?error=missing"); }
  if (!report) notFound();

  return (
    <main className="editorial-page">
      <header className="editorial-header">
        <BrandLockup href="/redaction" label={t("editorial.backQueue")} />
        <nav><Link href="/redaction">{t("editorial.backQueue")}</Link><Link href="/suivi">{t("editorial.openTracking")}</Link></nav>
        <span className="editorial-header__user">{t("editorial.user", { email: session.user.email })}</span>
      </header>
      <section className="editorial-shell editorial-shell--case">
        <Link className="editorial-back" href="/redaction"><ArrowLeft size={14} /> {t("editorial.backQueue")}</Link>
        <div className="editorial-case-top"><div><div className="editorial-eyebrow">LV ···· {report.tracking_hint}</div><h1>{t("case.title")}</h1></div><span className={`report-status report-status--${report.status}`}>{t(statusMessageKeys[report.status])}</span></div>

        {query.saved === "1" && <p className="editorial-success"><ShieldCheck size={15} /> {t("case.saved")}</p>}
        {query.error === "invalid" && <p className="editorial-alert">{t("case.invalid")}</p>}
        {query.error === "save" && <p className="editorial-alert">{t("case.saveError")}</p>}

        <div className="case-grid">
          <article className="case-evidence">
            <div className="case-section-head"><div><span>{t("case.signal")}</span><h2>{t("case.circulates")}</h2></div><time dateTime={report.submitted_at.toISOString()}>{report.submitted_at.toLocaleString(locale === "mg" ? "mg-MG" : locale, { dateStyle: "medium", timeStyle: "short" })}</time></div>
            <blockquote>{report.assertion}</blockquote>
            <div className="case-facts"><div><span>{t("case.theme")}</span><strong>{t(themeMessageKeys[report.theme] ?? "theme.other")}</strong></div><div><span>{t("case.language")}</span><strong>{report.language.toUpperCase()}</strong></div></div>
            {report.context && <div className="case-context"><span>{t("case.context")}</span><p>{report.context}</p></div>}
            {report.source_url && <a className="case-source-link" href={report.source_url} target="_blank" rel="noopener noreferrer nofollow" referrerPolicy="no-referrer"><ExternalLink size={15} /><span><small>{t("case.linkByReporter")}</small>{new URL(report.source_url).hostname}</span></a>}
            {report.media_mime_type ? (
              <div className="case-media"><div className="case-media__head"><FileImage size={15} /><span>{t("case.originalImage", { size: Math.ceil((report.media_size ?? 0) / 1024) })}</span><code>SHA-256 · {report.media_sha256?.slice(0, 12)}…</code></div><img src={`/api/redaction/reports/${report.id}/media`} alt={t("case.imageAlt")} referrerPolicy="no-referrer" /><p>{t("case.imageIntegrity")}</p></div>
            ) : (
              <div className="case-no-media"><FileImage size={16} /> {t("case.noImage")}</div>
            )}
          </article>

          <section className="case-decision">
            <div className="case-section-head"><div><span>{t("case.humanDecision")}</span><h2>{t("case.sourcesCorrection")}</h2></div></div>
            <p className="case-editor-note">{t("case.aiNotUsed")}</p>
            <form action={saveEditorialDecision} className="editorial-form">
              <input type="hidden" name="id" value={report.id} />
              <label>{t("case.status")}<select name="status" defaultValue={report.status}>{REPORT_STATUSES.map((status) => <option key={status} value={status}>{t(statusMessageKeys[status])}</option>)}</select></label>
              <label>{t("case.verdict")}<select name="verdict" defaultValue={report.verdict ?? ""}><option value="">{t("case.noVerdict")}</option>{REPORT_VERDICTS.map((verdict) => <option key={verdict} value={verdict}>{t(verdictMessageKeys[verdict])}</option>)}</select></label>
              <label>{t("case.rationale")}<textarea name="rationale" defaultValue={report.rationale ?? ""} maxLength={1200} rows={4} placeholder={t("case.rationalePlaceholder")} /></label>
              <label>{t("case.sources")} <small>{t("case.sourcesHint")}</small><textarea name="sources" defaultValue={report.sources.map((source) => source.url).join("\n")} maxLength={16000} rows={4} placeholder="https://source-officielle.mg/communique" /></label>
              <label>{t("case.correction")} <small>{t("case.correctionHint")}</small><textarea name="correction" defaultValue={report.correction ?? ""} maxLength={1200} rows={5} placeholder={t("case.correction")} /></label>
              <div className="editorial-form__rule"><ShieldCheck size={15} /><span>{t("case.publishRule")}</span></div>
              <button className="report-primary" type="submit">{t("case.save")}</button>
            </form>
          </section>
        </div>
        <p className="editorial-footnote">{t("case.expiry", { date: report.expires_at.toLocaleDateString(locale === "mg" ? "mg-MG" : locale) })}</p>
      </section>
    </main>
  );
}
