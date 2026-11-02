"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { isAuthConfigured } from "@/lib/auth-config";

export async function signOut() {
  if (isAuthConfigured()) {
    await auth.api.signOut({ headers: await headers() });
  }
  redirect("/");
}
