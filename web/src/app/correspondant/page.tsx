import type { Metadata } from "next";
import Link from "next/link";
import { submitCorrespondentReport } from "@/app/correspondant/actions";
import { Notice, StaffShell } from "@/app/staff-shell";
import { getServerLocale } from "@/lib/i18n/server";
import { staffTranslator } from "@/lib/i18n/staff";
import { REPORT_LANGUAGES, REPORT_THEMES } from "@/lib/reports";
import { requireRole } from "@/lib/staff";
import { listOwnReports } from "@/lib/workflow";

export const metadata: Metadata = { title: "Espace correspondant — Laverta" };

export default async function CorrespondentPage(props: { searchParams: Promise<{ saved?: string; error?: string }> }) {
  const locale = await getServerLocale();
  const t = staffTranslator(locale);
  const { member } = await requireRole(["correspondent"], "/correspondant");
  const query = await props.searchParams;
  const reports = await listOwnReports(member.email);
  const date = new Intl.DateTimeFormat(locale === "mg" ? "fr" : locale, { dateStyle: "medium" });

  return (
    <StaffShell member={member} t={t} active="/correspondant" eyebrow={t("role.correspondent")} title={t("corr.title")} intro={t("corr.intro")}>
      {query.saved && <Notice tone="success">{t(query.saved === "instant" ? "corr.savedInstant" : "corr.saved")}</Notice>}
      {query.error && <Notice tone="error">{t("corr.invalid")}</Notice>}
      <div className="staff-split">
        <section className="staff-card">
          <h2>{t("corr.formTitle")}</h2>
          <form action={submitCorrespondentReport} className="staff-form">
            <label>{t("corr.claim")}<textarea name="assertion" rows={4} minLength={12} maxLength={500} required /></label>
            <label>{t("field.region")}<input type="text" name="region" minLength={2} maxLength={80} required placeholder="Atsinanana, Toamasina" /></label>
            <label>{t("field.theme")}<select name="theme" defaultValue="other">{REPORT_THEMES.map((theme) => <option key={theme} value={theme}>{t(`theme.${theme}`)}</option>)}</select></label>
            <label>{t("field.language")}<select name="language" defaultValue="mg">{REPORT_LANGUAGES.map((language) => <option key={language} value={language}>{language.toUpperCase()}</option>)}</select></label>
            <label>{t("corr.link")} <small>{t("admin.optional")}</small><input type="text" name="sourceUrl" inputMode="url" maxLength={2000} placeholder="https://" /></label>
            <label>{t("corr.context")} <small>{t("corr.contextHint")}</small><textarea name="context" rows={3} maxLength={1200} /></label>
            <button className="staff-btn" type="submit">{t("corr.submit")}</button>
          </form>
        </section>
        <section className="staff-card">
          <h2>{t("corr.mine", { count: reports.length })}</h2>
          {reports.length === 0 ? <p className="staff-muted">{t("corr.none")}</p> : (
            <div className="staff-list">
              {reports.map((item) => (
                <div className="staff-item" key={item.id}>
                  <div className="staff-meta"><span className="staff-tag staff-tag--strong">{t(`status.${item.status}`)}</span><span>{t(`theme.${item.theme}`)}</span>{item.region && <span>{item.region}</span>}<span>{date.format(item.submitted_at)}</span></div>
                  <span>{item.assertion}</span>
                  {item.publication_id && <Link href={`/verifications/${item.publication_id}`}>{t("case.openPublication")}</Link>}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </StaffShell>
  );
}
