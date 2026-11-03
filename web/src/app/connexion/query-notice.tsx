"use client";

import { useSearchParams } from "next/navigation";
import { CircleAlert } from "lucide-react";
import { useLavertaPreferences } from "../preferences";

export default function QueryNotice() {
  const { t } = useLavertaPreferences();
  const searchParams = useSearchParams();
  if (searchParams.has("configuration")) {
    return <p className="auth-message auth-message--error" role="alert"><CircleAlert size={15} />{t("auth.notConfigured")}</p>;
  }
  if (searchParams.get("error") === "INVALID_TOKEN") {
    return <p className="auth-message auth-message--error" role="alert"><CircleAlert size={15} />{t("auth.invalidReset")}</p>;
  }
  if (searchParams.has("password-reset")) {
    return <p className="auth-message" role="status">{t("auth.passwordResetComplete")}</p>;
  }
  return null;
}
