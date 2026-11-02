"use client";

import { useSearchParams } from "next/navigation";
import { CircleAlert } from "lucide-react";

export default function QueryNotice() {
  const searchParams = useSearchParams();
  if (searchParams.has("configuration")) {
    return <p className="auth-message auth-message--error" role="alert"><CircleAlert size={15} />La base PostgreSQL ou la clé secrète d’authentification n’est pas configurée sur ce serveur.</p>;
  }
  if (searchParams.get("error") === "INVALID_TOKEN") {
    return <p className="auth-message auth-message--error" role="alert"><CircleAlert size={15} />Ce lien a expiré ou a déjà été utilisé. Demandez-en un nouveau.</p>;
  }
  if (searchParams.has("password-reset")) {
    return <p className="auth-message" role="status">Votre mot de passe a été modifié. Vous pouvez maintenant vous connecter.</p>;
  }
  return null;
}
