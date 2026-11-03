import type { Metadata } from "next";
import { deleteCredentialAction, saveStaffAction } from "@/app/admin/actions";
import { Notice, StaffShell } from "@/app/staff-shell";
import { getServerLocale } from "@/lib/i18n/server";
import { staffTranslator } from "@/lib/i18n/staff";
import { REPORT_THEMES } from "@/lib/reports";
import { listStaff, requireRole, STAFF_ROLES } from "@/lib/staff";
import { listCredentialSummaries } from "@/lib/staff-credentials";

export const metadata: Metadata = { title: "Équipe — Laverta" };

export default async function AdminPage(props: { searchParams: Promise<{ saved?: string; error?: string; edit?: string }> }) {
  const locale = await getServerLocale();
  const t = staffTranslator(locale);
  const { member } = await requireRole(["admin"], "/admin");
  const query = await props.searchParams;
  const [staff, credentials] = await Promise.all([listStaff(), listCredentialSummaries()]);
  const editing = staff.find((row) => row.email === query.edit);

  return (
    <StaffShell member={member} t={t} active="/admin" eyebrow={t("admin.eyebrow")} title={t("admin.title")} intro={t("admin.intro")}>
      {query.saved && <Notice tone="success">{t(`admin.saved.${query.saved}` as "admin.saved.invited")}</Notice>}
      {query.error && <Notice tone="error">{t(`admin.error.${query.error}` as "admin.error.invalid")}</Notice>}
      <div className="staff-split">
        <section className="staff-card">
          <h2>{t("admin.members", { count: staff.length })}</h2>
          {staff.length === 0 ? <p className="staff-muted">{t("admin.none")}</p> : (
            <div className="staff-scroll"><table className="staff-table">
              <thead><tr><th>{t("admin.email")}</th><th>{t("admin.role")}</th><th>{t("admin.scope")}</th><th>{t("admin.credential")}</th><th /></tr></thead>
              <tbody>{staff.map((row) => (
                <tr key={row.email}>
                  <td>{row.email}{row.display_name && <div className="staff-muted">{row.display_name}</div>}</td>
                  <td><span className="staff-role">{t(`role.${row.role}`)}</span>{!row.active && <div className="staff-muted">{t("admin.inactive")}</div>}</td>
                  <td className="staff-muted">{row.role === "organization" ? row.organization : row.role === "journalist" ? (row.rubrics.length ? row.rubrics.map((theme) => t(`theme.${theme}` as "theme.other")).join(", ") : t("admin.allThemes")) : "—"}</td>
                  <td>{(() => {
                    const credential = credentials.get(row.email);
                    if (!credential) return <span className="staff-muted">{t("admin.credentialNone")}</span>;
                    return (
                      <div>
                        {credential.matricule && <div>{t("admin.matricule")} : <strong>{credential.matricule}</strong></div>}
                        {credential.card_mime_type && <div><a href={`/api/admin/justificatif?email=${encodeURIComponent(row.email)}`} target="_blank" rel="noopener noreferrer">{t("admin.credentialView")}</a> <span className="staff-muted">({credential.card_mime_type === "application/pdf" ? "PDF" : t("admin.credentialImage")})</span></div>}
                        <div className="staff-muted">{t("admin.credentialConsent", { date: credential.consent_at.toISOString().slice(0, 10) })}</div>
                        <div className="staff-muted">{t("admin.credentialExpires", { date: credential.expires_at.toISOString().slice(0, 10) })}</div>
                        <form action={deleteCredentialAction}>
                          <input type="hidden" name="email" value={row.email} />
                          <button className="staff-btn staff-btn--quiet" type="submit" aria-label={t("admin.credentialDeleteAria", { email: row.email })}>{t("admin.credentialDelete")}</button>
                        </form>
                      </div>
                    );
                  })()}</td>
                  <td><a href={`/admin?edit=${encodeURIComponent(row.email)}`}>{t("admin.edit")}</a></td>
                </tr>
              ))}</tbody>
            </table></div>
          )}
          <p className="staff-muted" style={{ marginTop: 12 }}>{t("admin.envNote")}</p>
          <p className="staff-muted">{t("admin.credentialNote")}</p>
        </section>

        <section className="staff-card">
          <h2>{editing ? t("admin.editTitle") : t("admin.inviteTitle")}</h2>
          <form action={saveStaffAction} className="staff-form" key={editing?.email ?? "new"}>
            <label>{t("admin.email")}<input type="email" name="email" required maxLength={254} defaultValue={editing?.email} readOnly={Boolean(editing)} /></label>
            <label>{t("admin.name")} <small>{t("admin.optional")}</small><input type="text" name="displayName" maxLength={80} defaultValue={editing?.display_name ?? ""} /></label>
            <label>{t("admin.role")}<select name="role" defaultValue={editing?.role ?? "journalist"}>{STAFF_ROLES.map((role) => <option key={role} value={role}>{t(`role.${role}`)} — {t(`roleHelp.${role}`)}</option>)}</select></label>
            <fieldset className="staff-checks" style={{ border: 0, padding: 0 }}>
              <legend className="staff-muted">{t("admin.rubrics")}</legend>
              {REPORT_THEMES.map((theme) => <label key={theme}><input type="checkbox" name="rubrics" value={theme} defaultChecked={editing?.rubrics.includes(theme)} /> {t(`theme.${theme}`)}</label>)}
            </fieldset>
            <label>{t("admin.organization")} <small>{t("admin.organizationHint")}</small><input type="text" name="organization" maxLength={120} defaultValue={editing?.organization ?? ""} placeholder="JIRAMA, Ministère de la Santé…" /></label>
            {editing && <label>{t("admin.status")}<select name="active" defaultValue={editing.active ? "on" : "off"}><option value="on">{t("admin.active")}</option><option value="off">{t("admin.inactive")}</option></select></label>}
            <button className="staff-btn" type="submit">{editing ? t("action.save") : t("admin.invite")}</button>
            {editing && <a className="staff-btn staff-btn--quiet" href="/admin">{t("admin.cancel")}</a>}
          </form>
        </section>
      </div>
    </StaffShell>
  );
}
