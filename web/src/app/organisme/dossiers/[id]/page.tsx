import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { respondAction } from "@/app/organisme/actions";
import { Notice, StaffShell } from "@/app/staff-shell";
import { getServerLocale } from "@/lib/i18n/server";
import { staffTranslator } from "@/lib/i18n/staff";
import { requireRole } from "@/lib/staff";
import { getOrgCase } from "@/lib/workflow";

export const metadata: Metadata = { title: "Demande de vérification — Laverta" };

// L’organisme ne voit que le résumé anonymisé rédigé par le journaliste : ni texte original, ni média, ni identité.
export default async function OrganizationCasePage(props: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  const locale = await getServerLocale();
  const t = staffTranslator(locale);
  const { id } = await props.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { member } = await requireRole(["organization"], `/organisme/dossiers/${id}`);
  const query = await props.searchParams;
  const item = member.organization ? await getOrgCase(id, member.organization) : null;
  if (!item) notFound();
  const date = new Intl.DateTimeFormat(locale === "mg" ? "fr" : locale, { dateStyle: "medium", timeStyle: "short" });

  return (
    <StaffShell member={member} t={t} active="/organisme" eyebrow={member.organization ?? ""} title={t("org.caseTitle")}>
      <nav className="staff-breadcrumb" aria-label={t("case.breadcrumb")}><Link href="/organisme">{t("nav.requests")}</Link><span aria-hidden="true">/</span><span>{t(`theme.${item.theme}`)}</span></nav>
      {query.saved && <Notice tone="success">{t("org.saved")}</Notice>}
      {query.error && <Notice tone="error">{t("org.invalid")}</Notice>}
      <div className="staff-split">
        <section className="staff-card">
          <div className="staff-meta"><span className="staff-tag staff-tag--strong">{t(`org.${item.org_status}` as "org.pending")}</span><span>{t(`theme.${item.theme}`)}</span>{item.region && <span>{item.region}</span>}<span>{date.format(item.referred_at)}</span></div>
          <h2 style={{ marginTop: 12 }}>{t("org.question")}</h2>
          <blockquote className="staff-quote">{item.referral_summary}</blockquote>
          <p className="staff-muted">{t("org.anonymized")}</p>
        </section>
        <section className="staff-card">
          <h2>{t("org.answer")}</h2>
          <form action={respondAction} className="staff-form">
            <input type="hidden" name="id" value={item.id} />
            <label>{t("field.status")}<select name="status" defaultValue={item.org_status === "done" ? "done" : "in_progress"}><option value="in_progress">{t("org.in_progress")}</option><option value="done">{t("org.done")}</option></select></label>
            <label>{t("org.response")}<textarea name="response" rows={7} minLength={10} maxLength={2000} required defaultValue={item.org_response ?? ""} /></label>
            <label>{t("org.links")} <small>{t("org.linksHint")}</small><textarea name="links" rows={3} maxLength={8000} defaultValue={item.org_links.map((link) => link.url).join("\n")} placeholder="https://" /></label>
            <button className="staff-btn" type="submit">{t("org.submit")}</button>
          </form>
          {item.org_responded_at && <p className="staff-muted">{t("org.lastAnswer", { date: date.format(item.org_responded_at) })}</p>}
        </section>
      </div>
    </StaffShell>
  );
}
