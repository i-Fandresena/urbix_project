"use client";

import { useSearchParams } from "next/navigation";
import { CircleAlert } from "lucide-react";

export default function QueryNotice() {
  const searchParams = useSearchParams();
  if (searchParams.has("configuration")) {
    return <p className="auth-message auth-message--error" role="alert"><CircleAlert size={15} />L’authentification du site n’est pas configurée. Vérifiez les variables Supabase du serveur.</p>;
  }
  if (searchParams.has("confirmation")) {
    return <p className="auth-message auth-message--error" role="alert"><CircleAlert size={15} />Le lien n’a pas pu être validé. Demandez un nouvel e-mail de confirmation ou de réinitialisation.</p>;
  }
  return null;
}
