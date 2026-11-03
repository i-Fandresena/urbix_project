"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CircleAlert, Eye, EyeOff, LoaderCircle, MailCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useLavertaPreferences } from "../preferences";

type FormMode = "login" | "signup";
type Feedback = { tone: "info" | "error"; text: string } | null;
type LoginFormProps = { configured: boolean; emailConfigured: boolean; serviceUnavailable?: boolean };

function getSafeDestination() {
  const next = new URLSearchParams(window.location.search).get("next");
  // Chemin interne uniquement : pas de redirection ouverte vers un autre site.
  return next && /^\/[a-z0-9/-]*$/i.test(next) && !next.startsWith("//") ? next : "/espace";
}

export default function LoginForm({ configured, emailConfigured, serviceUnavailable = false }: LoginFormProps) {
  const { t } = useLavertaPreferences();
  const [mode, setMode] = useState<FormMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const router = useRouter();
  const available = configured && !serviceUnavailable;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    if (!configured) {
      setFeedback({ tone: "error", text: t("auth.notConfigured") });
      return;
    }
    if (serviceUnavailable) {
      setFeedback({ tone: "error", text: t("auth.databaseUnavailable") });
      return;
    }

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");
    const passwordConfirm = String(form.get("passwordConfirm") ?? "");
    const fullName = String(form.get("fullName") ?? "").trim();
    const organization = String(form.get("organization") ?? "").trim();

    if (mode === "signup" && password !== passwordConfirm) {
      setFeedback({ tone: "error", text: t("auth.passwordMismatch") });
      return;
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await authClient.signUp.email({
          name: fullName,
          email,
          password,
          organization,
          callbackURL: "/espace",
        });
        if (error) throw error;
        if (emailConfigured) {
          setFeedback({ tone: "info", text: t("auth.confirmSent") });
          return;
        }
        router.replace(getSafeDestination());
        router.refresh();
      } else {
        const { error } = await authClient.signIn.email({ email, password, callbackURL: "/espace" });
        if (error) throw error;
        router.replace(getSafeDestination());
        router.refresh();
      }
    } catch (cause) {
      const code = typeof cause === "object" && cause !== null && "code" in cause ? String(cause.code) : "";
      if (code === "EMAIL_NOT_VERIFIED") setFeedback({ tone: "info", text: t("auth.confirmSent") });
      else setFeedback({ tone: "error", text: mode === "signup" ? t("auth.signupFailed") : t("auth.loginFailed") });
    } finally {
      setBusy(false);
    }
  }

  async function requestPasswordReset() {
    const form = document.querySelector<HTMLFormElement>("#laverta-auth-form");
    const email = String(new FormData(form ?? undefined).get("email") ?? "").trim().toLowerCase();
    if (!email) {
      setFeedback({ tone: "error", text: t("auth.emailRequired") });
      return;
    }
    if (!configured || !emailConfigured) {
      setFeedback({ tone: "info", text: t("auth.smtpNeeded") });
      return;
    }
    setBusy(true);
    setFeedback(null);
    try {
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/mot-de-passe/nouveau`,
      });
      if (error) throw error;
      setFeedback({ tone: "info", text: t("auth.resetSent") });
    } catch {
      setFeedback({ tone: "error", text: t("auth.resetFailed") });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="auth-mode" role="tablist" aria-label={t("auth.panelTitle")}>
        <button type="button" role="tab" aria-selected={mode === "login"} disabled={!available || busy} onClick={() => { setMode("login"); setFeedback(null); }}>{t("auth.loginTab")}</button>
        <button type="button" role="tab" aria-selected={mode === "signup"} disabled={!available || busy} onClick={() => { setMode("signup"); setFeedback(null); }}>{t("auth.signupTab")}</button>
      </div>

      <form id="laverta-auth-form" className="auth-fields" onSubmit={submit}>
        {mode === "signup" && <div className="auth-field"><label htmlFor="fullName">{t("auth.fullName")}</label><input id="fullName" name="fullName" type="text" autoComplete="name" placeholder={t("auth.namePlaceholder")} minLength={2} maxLength={80} required /></div>}
        {mode === "signup" && <div className="auth-field"><label htmlFor="organization">{t("auth.organization")} <span>{t("auth.optional")}</span></label><input id="organization" name="organization" type="text" autoComplete="organization" placeholder={t("auth.organizationPlaceholder")} maxLength={100} /></div>}
        <div className="auth-field"><label htmlFor="email">{t("auth.email")}</label><input id="email" name="email" type="email" autoComplete="email" placeholder="prenom.nom@redaction.mg" maxLength={254} required /></div>
        <div className="auth-field"><label htmlFor="password">{t("auth.password")}</label><div className="auth-password"><input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete={mode === "signup" ? "new-password" : "current-password"} placeholder={mode === "signup" ? t("auth.passwordMin") : t("auth.passwordPlaceholder")} minLength={mode === "signup" ? 12 : undefined} maxLength={128} required /><button type="button" aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
        {mode === "signup" && <div className="auth-field"><label htmlFor="passwordConfirm">{t("auth.confirmPassword")}</label><div className="auth-password"><input id="passwordConfirm" name="passwordConfirm" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder={t("auth.repeatPassword")} minLength={12} maxLength={128} required /></div></div>}
        {mode === "login" && <div className="auth-forgot"><button type="button" onClick={requestPasswordReset} disabled={busy || !emailConfigured || !available}>{t("auth.forgot")}</button></div>}
        <button className="button button--dark auth-submit" type="submit" disabled={busy || !available}>{busy ? <><LoaderCircle className="spin" size={15} /> {t("auth.processing")}</> : <>{mode === "signup" ? t("auth.submitSignup") : t("auth.submitLogin")} <ArrowRight size={15} /></>}</button>
      </form>

      {feedback && <p className={`auth-message${feedback.tone === "error" ? " auth-message--error" : ""}`} role={feedback.tone === "error" ? "alert" : "status"}>{feedback.tone === "error" ? <CircleAlert size={15} /> : <MailCheck size={15} />}{feedback.text}</p>}
      {!configured && <p className="auth-config-note">{t("auth.configNote")}</p>}
      {configured && mode === "login" && !emailConfigured && <p className="auth-config-note">{t("auth.smtpNote")}</p>}
      {mode === "signup" && <p className="auth-terms">{emailConfigured ? t("auth.confirmInfo") : t("auth.accountInfo")} {t("auth.accountStored")} <Link href="/confidentialite">{t("auth.privacyLink")}</Link>.</p>}
    </>
  );
}
