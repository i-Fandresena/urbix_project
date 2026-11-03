import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StaffShell } from "@/app/staff-shell";
import { getServerLocale } from "@/lib/i18n/server";
import { staffTranslator } from "@/lib/i18n/staff";
import { requireRole } from "@/lib/staff";
import { listOrgCases } from "@/lib/workflow";

export const metadata: Metadata = { title: "Demandes de vérification — Laverta" };

export default async function OrganizationPage() {
  const locale = await getServerLocale();
  const t = staffTranslator(locale);
  const { member } = await requireRole(["organization"], "/organisme");
  const cases = member.organization ? await listOrgCases(member.organization) : [];
  const date = new Intl.DateTimeFormat(locale === "mg" ? "fr" : locale, { dateStyle: "medium" });

  return (
    <StaffShell member={member} t={t} active="/organisme" eyebrow={member.organization ?? t("role.organization")} title={t("org.title")} intro={t("org.intro")}>
      <div className="staff-metrics">
        <div><span>{t("org.pending")}</span><strong>{cases.filter((item) => item.org_status === "pending").length}</strong></div>
        <div><span>{t("org.in_progress")}</span><strong>{cases.filter((item) => item.org_status === "in_progress").length}</strong></div>
        <div><span>{t("org.done")}</span><strong>{cases.filter((item) => item.org_status === "done").length}</strong></div>
      </div>
      {cases.length === 0 ? <div className="staff-empty">{t("org.empty")}</div> : (
        <div className="staff-list">
          {cases.map((item) => (
            <Link className="staff-item" key={item.id} href={`/organisme/dossiers/${item.id}`}>
              <div className="staff-meta"><span className="staff-tag staff-tag--strong">{t(`org.${item.org_status}` as "org.pending")}</span><span>{t(`theme.${item.theme}`)}</span>{item.region && <span>{item.region}</span>}<span>{t("org.received", { date: date.format(item.referred_at) })}</span></div>
              <h3>{item.referral_summary}</h3>
              <div className="staff-meta"><span>{t("org.open")}</span><ArrowRight size={14} aria-hidden="true" /></div>
            </Link>
          ))}
        </div>
      )}
    </StaffShell>
  );
}
