import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ExternalLink, FileImage, ShieldCheck } from "lucide-react";
import { assignCaseAction, detachMemberAction, referCaseAction, saveEditorialDecision } from "@/app/redaction/actions";
import { Notice, StaffShell } from "@/app/staff-shell";
import { getServerLocale } from "@/lib/i18n/server";
import { staffTranslator } from "@/lib/i18n/staff";
import { REPORT_STATUSES, REPORT_VERDICTS } from "@/lib/reports";
import { canSeeReport, EDITORIAL_ROLES, isManager, listJournalists, listOrganizations, requireRole } from "@/lib/staff";
import { getCase, getCaseDetails } from "@/lib/workflow";

export const metadata: Metadata = { title: "Dossier éditorial — Laverta", description: "Examen d’un signalement par la rédaction Laverta." };

export default async function EditorialCasePage(props: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  const locale = await getServerLocale();
  const t = staffTranslator(locale);
  const { id } = await props.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { member } = await requireRole(EDITORIAL_ROLES, `/redaction/dossiers/${id}`);
  const query = await props.searchParams;
  const report = await getCase(id);
  if (!report) redirect("/redaction?error=missing");
  if (report.cluster_id) redirect(`/redaction/dossiers/${report.cluster_id}`);
  if (!canSeeReport(member, report)) redirect("/espace?refus=1");
  const manager = isManager(member);
  const [details, journalists, organizations] = await Promise.all([getCaseDetails(id), manager ? listJournalists() : Promise.resolve([]), listOrganizations()]);
  const dateTime = new Intl.DateTimeFormat(locale === "mg" ? "fr" : locale, { dateStyle: "medium", timeStyle: "short" });
  const canSeeIdentity = manager || report.assigned_to === member.email;
  const reporter = report.channel === "correspondent"
    ? (canSeeIdentity ? report.submitted_by ?? "—" : t("case.identityMasked"))
    : report.channel === "messenger" ? t("case.messengerMasked") : t("case.anonymous");

  return (
    <StaffShell member={member} t={t} active="/redaction" eyebrow={`LV ···· ${report.tracking_hint}`} title={t("case.title")}>
      <nav className="staff-breadcrumb" aria-label={t("case.breadcrumb")}><Link href="/redaction">{t("nav.queue")}</Link><span aria-hidden="true">/</span><span>LV ···· {report.tracking_hint}</span></nav>
      {query.saved && <Notice tone="success">{t(`case.saved.${query.saved}` as "case.saved.decision")}</Notice>}
      {query.error && <Notice tone="error">{t(query.error === "save" ? "case.errorSave" : "case.errorInvalid")}</Notice>}
      {report.instant_publication_id && <Notice>{t("case.instant")} <Link href={`/verifications/${report.instant_publication_id}`}>{t("case.openPublication")}</Link></Notice>}

      <div className="staff-split">
        <div className="staff-stack">
          <section className="staff-card">
            <div className="staff-meta"><span className="staff-tag staff-tag--strong">{t(`status.${report.status}`)}</span><span>{t(`theme.${report.theme}`)}</span><span>{t(`channel.${report.channel}`)}</span><span>{report.language.toUpperCase()}</span>{report.region && <span>{report.region}</span>}<time dateTime={report.submitted_at.toISOString()}>{dateTime.format(report.submitted_at)}</time></div>
            <h2 style={{ marginTop: 12 }}>{t("case.claim")}</h2>
            <blockquote className="staff-quote">{report.assertion}</blockquote>
            {report.context && <p className="staff-muted">{report.context}</p>}
            <p className="staff-muted">{t("case.reporter")} : {reporter}</p>
            {report.source_url && <p><a href={report.source_url} target="_blank" rel="noopener noreferrer nofollow" referrerPolicy="no-referrer"><ExternalLink size={14} aria-hidden="true" /> {new URL(report.source_url).hostname}</a></p>}
            {report.media_mime_type && (
              <figure style={{ margin: 0 }}>
                <img src={`/api/redaction/reports/${report.id}/media`} alt={t("case.imageAlt")} referrerPolicy="no-referrer" style={{ maxWidth: "100%", borderRadius: 8 }} />
                <figcaption className="staff-muted"><FileImage size={13} aria-hidden="true" /> SHA-256 · {report.media_sha256?.slice(0, 12)}… · {t("case.imageNote")}</figcaption>
              </figure>
            )}
          </section>

          <section className="staff-card">
            <h2>{t("case.duplicates", { count: details.members.length + 1 })}</h2>
            {details.members.length === 0 ? <p className="staff-muted">{t("case.noDuplicates")}</p> : (
              <ul className="staff-list" style={{ padding: 0, listStyle: "none" }}>
                {details.members.map((item) => (
                  <li className="staff-item" key={item.id}>
                    <div className="staff-meta"><span>{t(`channel.${item.channel}`)}</span>{item.region && <span>{item.region}</span>}<span>{dateTime.format(item.submitted_at)}</span></div>
                    <span>{item.assertion}</span>
                    <form action={detachMemberAction}><input type="hidden" name="id" value={item.id} /><input type="hidden" name="root" value={report.id} /><button className="staff-btn staff-btn--quiet" type="submit">{t("case.detach")}</button></form>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="staff-card">
            <h2>{t("case.related")}</h2>
            <p className="staff-muted">{t("case.relatedHint")}</p>
            {details.related.length === 0 ? <p className="staff-muted">{t("case.noRelated")}</p> : details.related.map((item) => (
              <p key={item.id}><Link href={`/verifications/${item.id}`}>{t(`verdict.${item.verdict}`)} — {item.assertion.slice(0, 120)}</Link> <span className="staff-muted">({Math.round(item.score * 100)} %)</span></p>
            ))}
          </section>

          {report.referred_to && (
            <section className="staff-card">
              <h2>{t("case.orgTitle", { org: report.referred_to })}</h2>
              <p className="staff-muted">{t(`org.${report.org_status ?? "pending"}`)}{report.referred_at ? ` · ${dateTime.format(report.referred_at)}` : ""}</p>
              <p><strong>{t("case.sentSummary")}</strong><br />{report.referral_summary}</p>
              {report.org_response ? <><p><strong>{t("case.orgResponse")}</strong><br />{report.org_response}</p>{report.org_links.map((link) => <p key={link.url}><a href={link.url} target="_blank" rel="noopener noreferrer nofollow">{link.title}</a></p>)}</> : <p className="staff-muted">{t("case.orgWaiting")}</p>}
            </section>
          )}

          {manager && (
            <details className="staff-card">
              <summary>{t("case.audit")}</summary>
              <table className="staff-table"><tbody>{details.audit.map((entry, index) => <tr key={index}><td>{dateTime.format(entry.created_at)}</td><td>{entry.actor_email}</td><td>{entry.action}</td><td><code>{JSON.stringify(entry.after_state).slice(0, 80)}</code></td></tr>)}</tbody></table>
            </details>
          )}
        </div>

        <div className="staff-stack">
          <section className="staff-card">
            <h2>{t("case.assignment")}</h2>
            <p className="staff-muted">{report.assigned_to ? t("queue.assigned", { email: report.assigned_to }) : t("queue.unassigned")}</p>
            <form action={assignCaseAction} className="staff-form">
              <input type="hidden" name="id" value={report.id} />
              {manager ? (
                <label>{t("case.assignTo")}<select name="assignee" defaultValue={report.assigned_to ?? ""}><option value="">{t("queue.unassigned")}</option>{[...new Set([member.email, ...journalists.map((item) => item.email)])].map((email) => <option key={email} value={email}>{email}</option>)}</select></label>
              ) : <input type="hidden" name="assignee" value={member.email} />}
              <button className="staff-btn staff-btn--quiet" type="submit">{manager ? t("case.assign") : t("case.takeCase")}</button>
            </form>
          </section>

          <section className="staff-card">
            <h2>{t("case.decision")}</h2>
            <p className="staff-muted">{t("case.humanRule")}</p>
            <form action={saveEditorialDecision} className="staff-form">
              <input type="hidden" name="id" value={report.id} />
              <label>{t("field.status")}<select name="status" defaultValue={report.status}>{REPORT_STATUSES.map((status) => <option key={status} value={status}>{t(`status.${status}`)}</option>)}</select></label>
              <label>{t("case.verdict")}<select name="verdict" defaultValue={report.verdict ?? ""}><option value="">{t("case.noVerdict")}</option>{REPORT_VERDICTS.map((verdict) => <option key={verdict} value={verdict}>{t(`verdict.${verdict}`)}</option>)}</select></label>
              <label>{t("case.publicClaim")} <small>{t("case.publicClaimHint")}</small><textarea name="publicAssertion" rows={3} minLength={12} maxLength={500} defaultValue={report.assertion} /></label>
              <label>{t("case.rationale")}<textarea name="rationale" rows={4} maxLength={1200} defaultValue={report.rationale ?? ""} /></label>
              <label>{t("case.sources")} <small>{t("case.sourcesHint")}</small><textarea name="sources" rows={3} maxLength={16000} defaultValue={report.sources.map((source) => source.url).join("\n")} placeholder="https://" /></label>
              <label>{t("case.correction")} <small>{t("case.correctionHint")}</small><textarea name="correction" rows={5} maxLength={1200} defaultValue={report.correction ?? ""} /></label>
              <p className="staff-muted"><ShieldCheck size={13} aria-hidden="true" /> {t("case.publishRule")}</p>
              <button className="staff-btn" type="submit">{t("action.save")}</button>
            </form>
            {details.publication && !details.publication.withdrawn_at && (
              <div style={{ marginTop: 14 }}>
                <p><Link href={`/verifications/${details.publication.id}`}>{t("case.openPublication")}</Link></p>
                <p className="staff-muted">{t("case.reach", { reach: details.publication.reach_count, instant: details.publication.instant_answer_count })}</p>
              </div>
            )}
          </section>

          <section className="staff-card">
            <h2>{t("case.refer")}</h2>
            {organizations.length === 0 ? <p className="staff-muted">{t("case.noOrganizations")}</p> : (
              <form action={referCaseAction} className="staff-form">
                <input type="hidden" name="id" value={report.id} />
                <label>{t("case.organization")}<select name="organization" defaultValue={report.referred_to ?? organizations[0]} required>{organizations.map((org) => <option key={org} value={org}>{org}</option>)}</select></label>
                <label>{t("case.referSummary")} <small>{t("case.referSummaryHint")}</small><textarea name="summary" rows={4} minLength={30} maxLength={1200} required defaultValue={report.referral_summary ?? ""} /></label>
                <button className="staff-btn staff-btn--quiet" type="submit">{t("case.send")}</button>
              </form>
            )}
          </section>
          <p className="staff-muted">{t("case.expiry", { date: report.expires_at.toLocaleDateString(locale === "mg" ? "fr" : locale) })}</p>
        </div>
      </div>
    </StaffShell>
  );
}
