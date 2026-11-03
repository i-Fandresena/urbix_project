import "server-only";
import { getAuthSession } from "@/lib/auth";

type SessionLike = {
  user: { email?: string | null; emailVerified?: boolean };
} | null;

export function isEditorialSession(session: SessionLike) {
  const email = session?.user.email?.trim().toLowerCase();
  const allowedEmails = (process.env.LAVERTA_EDITOR_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  if (!email || !allowedEmails.includes(email)) return false;
  return process.env.NODE_ENV !== "production" || session?.user.emailVerified === true;
}

export async function getEditorialSession() {
  const session = await getAuthSession();
  return isEditorialSession(session) ? session : null;
}
