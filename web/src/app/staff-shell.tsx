import Link from "next/link";
import { BarChart3, BookOpenCheck, Building2, FilePlus2, Inbox, LogOut, MapPin, Users } from "lucide-react";
import { signOut } from "@/app/actions";
import { BrandLockup } from "@/app/brand-lockup";
import type { StaffMember, StaffRole } from "@/lib/staff";
import type { StaffKey, StaffT } from "@/lib/i18n/staff";
import "./staff.css";

type NavItem = { href: string; key: StaffKey; icon: typeof Inbox; roles: readonly StaffRole[] };

const NAV: NavItem[] = [
  { href: "/redaction", key: "nav.queue", icon: Inbox, roles: ["admin", "chief", "journalist"] },
  { href: "/redaction/statistiques", key: "nav.stats", icon: BarChart3, roles: ["admin", "chief", "journalist"] },
  { href: "/organisme", key: "nav.requests", icon: Building2, roles: ["organization"] },
  { href: "/correspondant", key: "nav.correspondent", icon: MapPin, roles: ["correspondent"] },
  { href: "/admin", key: "nav.team", icon: Users, roles: ["admin"] },
  { href: "/verifications", key: "nav.public", icon: BookOpenCheck, roles: ["admin", "chief", "journalist", "correspondent", "organization"] },
  { href: "/signaler", key: "nav.report", icon: FilePlus2, roles: ["admin", "chief", "journalist"] },
];

export function StaffShell({ member, t, active, eyebrow, title, intro, children }: {
  member: StaffMember; t: StaffT; active: string; eyebrow?: string; title: string; intro?: string; children: React.ReactNode;
}) {
  const items = NAV.filter((item) => item.roles.includes(member.role));
  return (
    <div className="staff">
      <aside className="staff-nav" aria-label={t("nav.label")}>
        <BrandLockup label={t("nav.home")} />
        <nav>
          {items.map(({ href, key, icon: Icon }) => (
            <Link key={href} href={href} aria-current={active === href ? "page" : undefined}><Icon size={16} aria-hidden="true" /><span>{t(key)}</span></Link>
          ))}
        </nav>
        <div className="staff-nav__user">
          <span className="staff-role">{t(`role.${member.role}`)}{member.organization ? ` · ${member.organization}` : ""}</span>
          <span className="staff-nav__email">{member.email}</span>
          <form action={signOut}><button type="submit"><LogOut size={14} aria-hidden="true" /> {t("nav.signOut")}</button></form>
        </div>
      </aside>
      <main className="staff-main" id="contenu">
        <header className="staff-head">
          {eyebrow && <div className="staff-eyebrow">{eyebrow}</div>}
          <h1>{title}</h1>
          {intro && <p>{intro}</p>}
        </header>
        {children}
      </main>
    </div>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "error" | "success"; children: React.ReactNode }) {
  return <p className={`staff-notice staff-notice--${tone}`} role={tone === "error" ? "alert" : "status"}>{children}</p>;
}
