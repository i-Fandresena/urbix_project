import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/actions";
import { BrandLockup } from "@/app/brand-lockup";
import { getServerLocale } from "@/lib/i18n/server";
import { staffTranslator } from "@/lib/i18n/staff";
import { getStaffContext, homeForRole } from "@/lib/staff";
import "../staff.css";

export const metadata: Metadata = { title: "Mon espace — Laverta" };

// Point d’arrivée après connexion : chaque rôle est envoyé vers son espace.
export default async function EspacePage(props: { searchParams: Promise<{ refus?: string }> }) {
  const t = staffTranslator(await getServerLocale());
  const context = await getStaffContext();
  if (!context) redirect("/connexion?next=%2Fespace");
  const { refus } = await props.searchParams;
  if (context.member && !refus) redirect(homeForRole(context.member.role));
  const unverified = process.env.NODE_ENV === "production" && !context.session.user.emailVerified;

  return (
    <main className="staff-solo">
      <BrandLockup label={t("nav.home")} />
      <section className="staff-card staff-solo__card">
        <div className="staff-eyebrow">{t("space.eyebrow")}</div>
        <h1>{context.member ? t("space.deniedTitle") : t("space.noRoleTitle")}</h1>
        <p>{context.member ? t("space.deniedText") : unverified ? t("space.unverified") : t("space.noRoleText", { email: context.session.user.email })}</p>
        <div className="staff-actions">
          {context.member && <Link className="staff-btn" href={homeForRole(context.member.role)}>{t("space.backHome")}</Link>}
          <Link className="staff-btn staff-btn--quiet" href="/signaler">{t("nav.report")}</Link>
          <Link className="staff-btn staff-btn--quiet" href="/verifications">{t("nav.public")}</Link>
          <form action={signOut}><button className="staff-btn staff-btn--quiet" type="submit">{t("nav.signOut")}</button></form>
        </div>
      </section>
    </main>
  );
}
