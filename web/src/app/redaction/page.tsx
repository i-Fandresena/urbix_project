import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Image as ImageIcon, Users } from "lucide-react";
import { Notice, StaffShell } from "@/app/staff-shell";
import { getServerLocale } from "@/lib/i18n/server";
import { staffTranslator } from "@/lib/i18n/staff";
import { REPORT_LANGUAGES, REPORT_STATUSES, REPORT_THEMES } from "@/lib/reports";
import { canSeeReport, EDITORIAL_ROLES, requireRole } from "@/lib/staff";
import { listPeaks, listQueue, type QueueItem } from "@/lib/workflow";

export const metadata: Metadata = { title: "File de rédaction — Laverta", description: "Dossiers de signalement à examiner par la rédaction Laverta." };

type Filters = { status?: string; theme?: string; region?: string; language?: string; channel?: string; mine?: string; error?: string };

function matches(item: QueueItem, filters: Filters, email: string) {
  // Sans statut choisi, la file ne montre que les dossiers ouverts.
  if (filters.status ? item.status !== filters.status : ["verified", "closed"].includes(item.status)) return false;
  if (filters.theme && item.theme !== filters.theme) return false;
  if (filters.language && item.language !== filters.language) return false;
  if (filters.channel && item.channel !== filters.channel) return false;
  if (filters.region && !(item.region ?? "").toLowerCase().includes(filters.region.toLowerCase())) return false;
  if (filters.mine === "1" && item.assigned_to !== email) return false;
  return true;
}

export default async function RedactionPage(props: { searchParams: Promise<Filters> }) {
  const locale = await getServerLocale();
  const t = staffTranslator(locale);
  const { member } = await requireRole(EDITORIAL_ROLES, "/redaction");
  const filters = await props.searchParams;
  const [queue, peaks] = await Promise.all([listQueue(), listPeaks()]);
  const visible = queue.filter((item) => canSeeReport(member, item));
  const shown = visible.filter((item) => matches(item, filters, member.email));
  const active = visible.filter((item) => !["verified", "closed"].includes(item.status));
  const dateFormat = new Intl.DateTimeFormat(locale === "mg" ? "fr" : locale, { dateStyle: "medium", timeStyle: "short" });

  return (
    <StaffShell member={member} t={t} active="/redaction" eyebrow={t(`role.${member.role}`)} title={t("queue.title")} intro={member.role === "journalist" && member.rubrics.length ? t("queue.introRubrics", { rubrics: member.rubrics.map((theme) => t(`theme.${theme}`)).join(", ") }) : t("queue.intro")}>
      {filters.error === "missing" && <Notice tone="error">{t("queue.missing")}</Notice>}
      {peaks.length > 0 && (
        <section className="staff-alert" aria-label={t("queue.peaks")}>
          <strong><AlertTriangle size={16} aria-hidden="true" /> {t("queue.peaks")}</strong>
          {peaks.map((peak) => <Link key={peak.id} href={`/redaction/dossiers/${peak.id}`}>{t("queue.peakItem", { count: peak.recent, theme: t(`theme.${peak.theme}`) })} — « {peak.assertion.slice(0, 90)} »</Link>)}
        </section>
      )}
      <div className="staff-metrics">
        <div><span>{t("queue.active")}</span><strong>{active.length}</strong></div>
        <div><span>{t("queue.new")}</span><strong>{active.filter((item) => item.status === "new").length}</strong></div>
        <div><span>{t("queue.referred")}</span><strong>{active.filter((item) => item.status === "referred").length}</strong></div>
        <div><span>{t("queue.mine")}</span><strong>{active.filter((item) => item.assigned_to === member.email).length}</strong></div>
      </div>
      <form className="staff-filters" method="get">
        <label>{t("field.status")}<select name="status" defaultValue={filters.status ?? ""}><option value="">{t("queue.openOnly")}</option>{REPORT_STATUSES.map((status) => <option key={status} value={status}>{t(`status.${status}`)}</option>)}</select></label>
        <label>{t("field.theme")}<select name="theme" defaultValue={filters.theme ?? ""}><option value="">{t("queue.all")}</option>{REPORT_THEMES.map((theme) => <option key={theme} value={theme}>{t(`theme.${theme}`)}</option>)}</select></label>
        <label>{t("field.language")}<select name="language" defaultValue={filters.language ?? ""}><option value="">{t("queue.all")}</option>{REPORT_LANGUAGES.map((language) => <option key={language} value={language}>{language.toUpperCase()}</option>)}</select></label>
        <label>{t("field.channel")}<select name="channel" defaultValue={filters.channel ?? ""}><option value="">{t("queue.all")}</option>{(["web", "messenger", "correspondent"] as const).map((channel) => <option key={channel} value={channel}>{t(`channel.${channel}`)}</option>)}</select></label>
        <label>{t("field.region")}<input type="search" name="region" defaultValue={filters.region ?? ""} placeholder="Analamanga" /></label>
        <label className="staff-checks"><span><input type="checkbox" name="mine" value="1" defaultChecked={filters.mine === "1"} /> {t("queue.onlyMine")}</span></label>
        <button className="staff-btn" type="submit">{t("action.filter")}</button>
        <Link className="staff-btn staff-btn--quiet" href="/redaction">{t("action.reset")}</Link>
      </form>
      <p className="staff-muted">{t("queue.count", { count: shown.length })} · {t("queue.sortRule")}</p>
      {shown.length === 0 ? <div className="staff-empty">{t("queue.empty")}</div> : (
        <div className="staff-list">
          {shown.map((item) => (
            <Link className="staff-item" key={item.id} href={`/redaction/dossiers/${item.id}`}>
              <div className="staff-meta">
                <span className="staff-tag staff-tag--strong">{t(`status.${item.status}`)}</span>
                <span className="staff-tag">{t("queue.priority", { score: item.priority })}</span>
                {item.size > 1 && <span className={`staff-tag${item.recent >= 5 ? " staff-tag--peak" : ""}`}><Users size={12} aria-hidden="true" /> {t("queue.similar", { count: item.size })}</span>}
                <span>{t(`theme.${item.theme}`)}</span>
                <span>{t(`channel.${item.channel}`)}</span>
                {item.region && <span>{item.region}</span>}
                <span>{item.language.toUpperCase()}</span>
                {item.has_media && <ImageIcon size={13} aria-label={t("queue.image")} />}
                <time dateTime={item.submitted_at.toISOString()}>{dateFormat.format(item.submitted_at)}</time>
              </div>
              <h3>{item.assertion}</h3>
              <div className="staff-meta">
                <span>{item.assigned_to ? t("queue.assigned", { email: item.assigned_to }) : t("queue.unassigned")}</span>
                {item.referred_to && <span>{t("queue.referredTo", { org: item.referred_to, status: t(`org.${item.org_status ?? "pending"}`) })}</span>}
                {item.verdict && <span>{t(`verdict.${item.verdict}`)}</span>}
                <ArrowRight size={14} aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </StaffShell>
  );
}
