"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CircleAlert, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { BrandLockup } from "@/app/brand-lockup";
import { useLavertaPreferences } from "../../preferences";

export default function NewPasswordPage() {
  const { t } = useLavertaPreferences();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const router = useRouter();

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError(false);
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");
    if (password !== confirm) {
      setMessage(t("password.mismatch"));
      setError(true);
      return;
    }
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) {
      setMessage(t("password.missingToken"));
      setError(true);
      return;
    }
    setBusy(true);
    try {
      const { error: updateError } = await authClient.resetPassword({ newPassword: password, token });
      if (updateError) throw updateError;
      router.replace("/connexion?password-reset=1");
    } catch {
      setMessage(t("password.invalidToken"));
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="password-page">
      <div className="password-card">
        <BrandLockup label={t("nav.home")} />
        <span className="auth-heading__eyebrow">{t("password.kicker")}</span>
        <h1>{t("password.title")}</h1>
        <p>{t("password.description")}</p>
        <form className="auth-fields" onSubmit={updatePassword}>
          <div className="auth-field"><label htmlFor="password">{t("password.new")}</label><div className="auth-password"><input id="password" name="password" type={passwordVisible ? "text" : "password"} autoComplete="new-password" minLength={12} maxLength={128} required /><button type="button" aria-label={passwordVisible ? t("auth.hidePassword") : t("auth.showPassword")} onClick={() => setPasswordVisible((visible) => !visible)}>{passwordVisible ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
          <div className="auth-field"><label htmlFor="confirm">{t("password.confirm")}</label><input id="confirm" name="confirm" type={passwordVisible ? "text" : "password"} autoComplete="new-password" minLength={12} maxLength={128} required /></div>
          <button className="button button--dark auth-submit" disabled={busy} type="submit">{busy ? <><LoaderCircle className="spin" size={15} /> {t("password.saving")}</> : <>{t("password.save")} <ArrowRight size={15} /></>}</button>
        </form>
        {message && <p className={`auth-message${error ? " auth-message--error" : ""}`} role={error ? "alert" : "status"}><CircleAlert size={15} />{message}</p>}
      </div>
    </main>
  );
}
