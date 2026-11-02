import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Workspace from "./workspace";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Vérification visuelle — Hamarino",
  description: "Espace éditorial de vérification visuelle et de recoupement des sources.",
};

export default async function VerificationPage() {
  if (!isSupabaseConfigured()) {
    if (process.env.NODE_ENV === "production") redirect("/connexion?configuration=supabase");
    return <Workspace />;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) redirect("/connexion?next=%2Fverification");
  return <Workspace />;
}
