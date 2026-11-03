import type { Metadata } from "next";
import { StaffShell } from "@/app/staff-shell";
import { getServerLocale } from "@/lib/i18n/server";
import { staffTranslator } from "@/lib/i18n/staff";
import { EDITORIAL_ROLES, requireRole } from "@/lib/staff";
import { getStatistics } from "@/lib/workflow";

export const metadata: Metadata = { title: "Statistiques — Laverta" };

function hours(value: number | null) {
  if (value === null) return "—";
  return value < 48 ? `${value.toFixed(1)} h` : `${(value / 24).toFixed(1)} j`;
}

export default async function StatisticsPage() {
  const t = staffTranslator(await getServerLocale());
  const { member } = await requireRole(EDITORIAL_ROLES, "/redaction/statistiques");
  const stats = await getStatistics();
  const maxTheme = Math.max(1, ...stats.byTheme.map((row) => row.total));
  const maxRegion = Math.max(1, ...stats.byRegion.map((row) => row.total));
  const instantRate = stats.totals.reports ? Math.round((stats.totals.instant / stats.totals.reports) * 100) : 0;

  return (
    <StaffShell member={member} t={t} active="/redaction/statistiques" eyebrow={t("stats.eyebrow")} title={t("stats.title")} intro={t("stats.intro")}>
      <div className="staff-metrics">
        <div><span>{t("stats.median")}</span><strong>{hours(stats.delay.median_hours)}</strong></div>
        <div><span>{t("stats.average")}</span><strong>{hours(stats.delay.avg_hours)}</strong></div>
        <div><span>{t("stats.published")}</span><strong>{stats.delay.published}</strong></div>
        <div><span>{t("stats.reach")}</span><strong>{stats.totals.reach}</strong></div>
        <div><span>{t("stats.instantRate")}</span><strong>{instantRate} %</strong></div>
        <div><span>{t("stats.activeReports")}</span><strong>{stats.totals.reports}</strong></div>
      </div>
      <div className="staff-grid">
        <section className="staff-card">
          <h2>{t("stats.byTheme")}</h2>
          <table className="staff-table"><thead><tr><th>{t("field.theme")}</th><th>{t("stats.total")}</th><th>{t("stats.week")}</th></tr></thead>
            <tbody>{stats.byTheme.map((row) => <tr key={row.theme}><td>{t(`theme.${row.theme}`)}<div className="staff-bar" style={{ width: `${(row.total / maxTheme) * 100}%` }} aria-hidden="true" /></td><td>{row.total}</td><td>{row.recent}</td></tr>)}</tbody>
          </table>
        </section>
        <section className="staff-card">
          <h2>{t("stats.byRegion")}</h2>
          <table className="staff-table"><thead><tr><th>{t("field.region")}</th><th>{t("stats.total")}</th></tr></thead>
            <tbody>{stats.byRegion.map((row) => <tr key={row.region}><td>{row.region}<div className="staff-bar" style={{ width: `${(row.total / maxRegion) * 100}%` }} aria-hidden="true" /></td><td>{row.total}</td></tr>)}</tbody>
          </table>
        </section>
        <section className="staff-card">
          <h2>{t("stats.channels")}</h2>
          <table className="staff-table"><tbody>{stats.channels.map((row) => <tr key={row.channel}><td>{t(`channel.${row.channel}` as "channel.web")}</td><td>{row.total}</td></tr>)}</tbody></table>
        </section>
        <section className="staff-card">
          <h2>{t("stats.orgs")}</h2>
          {stats.orgs.length === 0 ? <p className="staff-muted">{t("stats.noOrgs")}</p> : (
            <div className="staff-scroll"><table className="staff-table"><thead><tr><th>{t("case.organization")}</th><th>{t("stats.referred")}</th><th>{t("stats.answered")}</th><th>{t("stats.delay")}</th></tr></thead>
              <tbody>{stats.orgs.map((row) => <tr key={row.organization}><td>{row.organization}</td><td>{row.referred}</td><td>{row.answered}</td><td>{hours(row.avg_hours)}</td></tr>)}</tbody>
            </table></div>
          )}
        </section>
      </div>
      <p className="staff-muted" style={{ marginTop: 16 }}>{t("stats.footnote")}</p>
    </StaffShell>
  );
}
