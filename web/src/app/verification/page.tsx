import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import Workspace from "./workspace";
import { getAuthSession } from "@/lib/auth";
import { isAuthConfigured } from "@/lib/auth-config";

export const metadata: Metadata = {
  title: "Vérification visuelle — Laverta",
  description: "Espace éditorial de vérification visuelle et de recoupement des sources.",
};

export default async function VerificationPage() {
  // Read the runtime environment per request: a build-time prerender without secrets would bake a redirect loop.
  await connection();
  if (!isAuthConfigured()) {
    if (process.env.NODE_ENV === "production") redirect("/connexion?configuration=postgres");
    return <Workspace />;
  }

  const session = await getAuthSession();
  if (!session) redirect("/connexion?next=%2Fverification");
  return <Workspace />;
}
