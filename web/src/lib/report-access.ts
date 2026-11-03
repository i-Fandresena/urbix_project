import "server-only";
import { EDITORIAL_ROLES, getStaffContext } from "@/lib/staff";

// Accès rédaction : administrateur, rédacteur en chef ou journaliste, adresse vérifiée en production.
export async function getEditorialContext() {
  const context = await getStaffContext();
  return context?.member && EDITORIAL_ROLES.includes(context.member.role) ? { session: context.session, member: context.member } : null;
}

export async function getEditorialSession() {
  return (await getEditorialContext())?.session ?? null;
}
