import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, FileText, LogIn } from "lucide-react";
import { getAuthSession } from "@/lib/auth";
import { isAuthConfigured } from "@/lib/auth-config";
import { isEditorialSession } from "@/lib/report-access";
import { listEditorialReports, REPORT_STATUSES, REPORT_THEMES, type ReportRow, type ReportStatus, type ReportVerdict, type ReportTheme } from "@/lib/reports";
import { getServerLocale } from "@/lib/i18n/server";
import { translate, type Locale, type MessageKey } from "@/lib/i18n/messages";
import { BrandLockup } from "@/app/brand-lockup";

export const metadata: Metadata = { title: "File de rédaction — Laverta", description: "Dossiers de signalement à examiner par la rédaction Laverta." };

const statusMessageKeys: Record<ReportStatus, MessageKey> = { new: "status.new", in_review: "status.inReview", referred: "status.referred", verified: "status.verified", closed: "status.closed" };
const verdictMessageKeys: Record<NonNullable<ReportVerdict>, MessageKey> = { false: "verdict.false", true: "verdict.true", misleading: "verdict.misleading", unverifiable: "verdict.unverifiable" };
const themeMessageKeys: Record<ReportTheme, MessageKey> = { education: "theme.education", agriculture: "theme.agriculture", health: "theme.health", economy: "theme.economy", politics: "theme.politics", safety: "theme.safety", other: "theme.other" };

export default async function RedactionPage(props: { searchParams: Promise<{ error?: string; status?: string; theme?: string }> }) {
  const locale: Locale = await getServerLocale();
  const t = (key: MessageKey, values?: Record<string, string | number>) => translate(locale, key, values);
  const searchParams = await props.searchParams;
  if (!isAuthConfigured()) return <AccessMessage title={t("editorial.access")} detail={t("editorial.notConfigured")} t={t} />;

  let session: Awaited<ReturnType<typeof getAuthSession>>;
  try { session = await getAuthSession(); } catch { return <AccessMessage title={t("editorial.access")} detail={t("editorial.databaseOffline")} t={t} />; }
  if (!session) redirect("/connexion?next=%2Fredaction");
  if (!isEditorialSession(session)) return <AccessMessage title={t("editorial.reserved")} detail={t("editorial.accessDenied")} signedIn t={t} />;

  let reports: ReportRow[];
  try { reports = await listEditorialReports(); } catch { return <AccessMessage title={t("editorial.title")} detail={t("editorial.queueUnavailable")} signedIn t={t} />; }
  const activeCount = reports.filter((report) => ["new", "in_review", "referred"].includes(report.status)).length;
  const statusFilter = (REPORT_STATUSES as readonly string[]).includes(searchParams.status ?? "") ? searchParams.status as ReportStatus : "";
  const themeFilter = (REPORT_THEMES as readonly string[]).includes(searchParams.theme ?? "") ? searchParams.theme as ReportTheme : "";
  const visibleReports = reports.filter((report) => (!statusFilter || report.status === statusFilter) && (!themeFilter || report.theme === themeFilter));

  return (
    <main className="editorial-page">
      <header className="editorial-header">
        <BrandLockup label={t("nav.home")} />
        <nav><Link href="/signaler">{t("editorial.publicForm")}</Link><Link href="/verification">{t("editorial.analysis")}</Link></nav>
        <span className="editorial-header__user">{t("editorial.user", { email: session.user.email })}</span>
      </header>
      <section className="editorial-shell">
        <div className="editorial-eyebrow">URBIX · {t("editorial.access")}</div>
        <div className="editorial-title-row"><div><h1>{t("editorial.title")}</h1><p>{t("editorial.description")}</p></div><Link className="editorial-quiet-link" href="/suivi">{t("editorial.openTracking")} <ArrowRight size={14} /></Link></div>
        <div className="editorial-metrics"><div><span>{t("editorial.activeCases")}</span><strong>{activeCount.toString().padStart(2, "0")}</strong></div><div><span>{t("editorial.totalActive")}</span><strong>{reports.length.toString().padStart(2, "0")}</strong></div><div><span>{t("editorial.rule")}</span><strong>{t("editorial.humanDecision")}</strong></div></div>
        {searchParams.error === "missing" && <p className="editorial-alert">{t("editorial.caseMissing")}</p>}
        <div className="editorial-list-heading"><h2>{t("editorial.recent")}</h2><span>{t("editorial.retention")}</span></div>
        <form className="editorial-filters" method="get">
          <label>{t("editorial.status")}<select name="status" defaultValue={statusFilter}><option value="">{t("editorial.allStatuses")}</option>{REPORT_STATUSES.map((status) => <option value={status} key={status}>{t(statusMessageKeys[status])}</option>)}</select></label>
          <label>{t("editorial.theme")}<select name="theme" defaultValue={themeFilter}><option value="">{t("editorial.allThemes")}</option>{REPORT_THEMES.map((theme) => <option value={theme} key={theme}>{t(themeMessageKeys[theme])}</option>)}</select></label>
          <button type="submit">{t("editorial.filter")}</button>
          {(statusFilter || themeFilter) && <Link href="/redaction">{t("editorial.clearFilters")}</Link>}
          <span>{t("editorial.caseCount", { count: visibleReports.length })}</span>
        </form>
        {visibleReports.length === 0 ? (
          <div className="editorial-empty"><FileText size={22} /><h3>{reports.length === 0 ? t("editorial.empty") : t("editorial.noMatching")}</h3><p>{reports.length === 0 ? t("editorial.emptyText") : t("editorial.noMatchingText")}</p>{reports.length === 0 && <Link href="/signaler">{t("editorial.formLink")} <ArrowRight size={14} /></Link>}</div>
        ) : (
          <div className="editorial-report-list">
            {visibleReports.map((report) => (
              <Link className="editorial-report" href={`/redaction/dossiers/${report.id}`} key={report.id}>
                <div className="editorial-report__meta"><span className={`report-status report-status--${report.status}`}>{t(statusMessageKeys[report.status])}</span><span>LV ···· {report.tracking_hint}</span><time dateTime={report.submitted_at.toISOString()}>{report.submitted_at.toLocaleDateString(locale === "mg" ? "mg-MG" : locale)}</time></div>
                <h3>{report.assertion}</h3>
                <div className="editorial-report__foot"><span>{t(themeMessageKeys[report.theme] ?? "theme.other")}</span><span>{report.media_mime_type ? t("editorial.imageAttached") : t("editorial.linkOrText")}</span>{report.verdict && <span>{t("editorial.verdict", { verdict: t(verdictMessageKeys[report.verdict]) })}</span>}<ArrowRight size={15} /></div>
              </Link>
            ))}
          </div>
        )}
        <p className="editorial-footnote">{t("editorial.footnote")}</p>
      </section>
    </main>
  );
}

function AccessMessage({ title, detail, signedIn = false, t }: { title: string; detail: string; signedIn?: boolean; t: (key: MessageKey) => string }) {
  return (
    <main className="editorial-access"><BrandLockup label={t("nav.home")} /><div className="editorial-access__card"><span className="editorial-access__icon">{signedIn ? <FileText size={20} /> : <LogIn size={20} />}</span><div className="editorial-eyebrow">{t("editorial.access")}</div><h1>{title}</h1><p>{detail}</p>{!signedIn && <Link className="report-primary" href="/connexion?next=%2Fredaction">{t("editorial.login")} <ArrowRight size={15} /></Link>}<Link className="editorial-quiet-link" href="/">{t("editorial.backHome")} <ArrowRight size={14} /></Link></div></main>
  );
}
