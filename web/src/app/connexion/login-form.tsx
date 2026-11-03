"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CircleAlert, Eye, EyeOff, LoaderCircle, MailCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import type { MessageKey } from "@/lib/i18n/messages";
import { useLavertaPreferences } from "../preferences";

type FormMode = "login" | "signup";
type Feedback = { tone: "info" | "error"; text: string } | null;
type LoginFormProps = { configured: boolean; emailConfigured: boolean; serviceUnavailable?: boolean; invitedEmail?: string | null; invitation?: boolean };

const MAX_CARD_BYTES = 5 * 1024 * 1024;
const CARD_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"]);
const MATRICULE_PATTERN = /^[\p{L}\p{N} ./_#-]{1,60}$/u;

function getSafeDestination() {
  const next = new URLSearchParams(window.location.search).get("next");
  // Chemin interne uniquement : pas de redirection ouverte vers un autre site.
  return next && /^\/[a-z0-9/-]*$/i.test(next) && !next.startsWith("//") ? next : "/espace";
}

function credentialErrorKey(code: string): MessageKey {
  if (code === "CARD_TOO_LARGE") return "auth.cardTooLarge";
  if (code === "CARD_UNSUPPORTED" || code === "CARD_INVALID" || code === "CARD_MISMATCH") return "auth.cardType";
  if (code === "MATRICULE_INVALID") return "auth.matriculeInvalid";
  return "auth.credentialsFailed";
}

export default function LoginForm({ configured, emailConfigured, serviceUnavailable = false, invitedEmail = null, invitation = false }: LoginFormProps) {
  const { t } = useLavertaPreferences();
  const [mode, setMode] = useState<FormMode>(invitation ? "signup" : "login");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [credentialProvided, setCredentialProvided] = useState({ matricule: false, card: false });
  const [completed, setCompleted] = useState(false);
  const router = useRouter();
  const available = configured && !serviceUnavailable;
  const needsConsent = credentialProvided.matricule || credentialProvided.card;

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
    const matricule = String(form.get("matricule") ?? "").trim().replace(/\s+/g, " ");
    const cardField = form.get("card");
    const card = cardField instanceof File && cardField.size > 0 ? cardField : null;

    if (mode === "signup" && password !== passwordConfirm) {
      setFeedback({ tone: "error", text: t("auth.passwordMismatch") });
      return;
    }
    // Le justificatif est vérifié avant la création du compte pour ne pas créer un compte sans la pièce attendue.
    if (mode === "signup" && (matricule || card)) {
      if (matricule && !MATRICULE_PATTERN.test(matricule)) {
        setFeedback({ tone: "error", text: t("auth.matriculeInvalid") });
        return;
      }
      if (card && card.size > MAX_CARD_BYTES) {
        setFeedback({ tone: "error", text: t("auth.cardTooLarge") });
        return;
      }
      if (card && card.type && !CARD_TYPES.has(card.type)) {
        setFeedback({ tone: "error", text: t("auth.cardType") });
        return;
      }
      if (form.get("credentialsConsent") !== "on") {
        setFeedback({ tone: "error", text: t("auth.credentialsConsentRequired") });
        return;
      }
    }

    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await authClient.signUp.email({
          name: fullName,
          email,
          password,
          callbackURL: "/espace",
        });
        if (error) throw error;
        let credentialMessage: Feedback = null;
        if (matricule || card) {
          const upload = new FormData();
          upload.set("email", email);
          upload.set("userId", data?.user?.id ?? "");
          upload.set("consent", "true");
          if (matricule) upload.set("matricule", matricule);
          if (card) upload.set("card", card);
          const response = await fetch("/api/inscription/justificatif", { method: "POST", body: upload, credentials: "same-origin" }).catch(() => null);
          const body = response && !response.ok ? await response.json().catch(() => null) as { error?: string } | null : null;
          credentialMessage = response?.ok
            ? { tone: "info", text: t("auth.credentialsSaved") }
            : { tone: "error", text: t(credentialErrorKey(body?.error ?? "")) };
        }
        if (emailConfigured) {
          setCompleted(true);
          setFeedback({ tone: credentialMessage?.tone ?? "info", text: credentialMessage ? `${t("auth.confirmSent")} ${credentialMessage.text}` : t("auth.confirmSent") });
          return;
        }
        if (credentialMessage?.tone === "error") {
          // Compte créé : on garde le message visible et on propose de continuer plutôt que de renvoyer le formulaire.
          setCompleted(true);
          setFeedback(credentialMessage);
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
      else if (code === "INVITATION_REQUIRED") setFeedback({ tone: "error", text: t("auth.invitationOnly") });
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

  function switchMode(next: FormMode) {
    setMode(next);
    setFeedback(null);
    setCredentialProvided({ matricule: false, card: false });
  }

  if (completed) {
    return (
      <>
        {feedback && <p className={`auth-message${feedback.tone === "error" ? " auth-message--error" : ""}`} role={feedback.tone === "error" ? "alert" : "status"}>{feedback.tone === "error" ? <CircleAlert size={15} /> : <MailCheck size={15} />}{feedback.text}</p>}
        {!emailConfigured && <Link className="button button--dark auth-submit" href={getSafeDestination()} onClick={() => router.refresh()}>{t("auth.continue")} <ArrowRight size={15} /></Link>}
      </>
    );
  }

  return (
    <>
      <div className="auth-mode" role="tablist" aria-label={t("auth.panelTitle")}>
        <button type="button" role="tab" aria-selected={mode === "login"} disabled={!available || busy} onClick={() => switchMode("login")}>{t("auth.loginTab")}</button>
        <button type="button" role="tab" aria-selected={mode === "signup"} disabled={!available || busy} onClick={() => switchMode("signup")}>{t("auth.signupTab")}</button>
      </div>

      {invitation && mode === "signup" && <p className="auth-message" role="status"><MailCheck size={15} />{t("auth.invitedNotice")}</p>}

      <form id="laverta-auth-form" className="auth-fields" onSubmit={submit}>
        {mode === "signup" && <div className="auth-field"><label htmlFor="fullName">{t("auth.fullName")}</label><input id="fullName" name="fullName" type="text" autoComplete="name" placeholder={t("auth.namePlaceholder")} minLength={2} maxLength={80} required /></div>}
        <div className="auth-field"><label htmlFor="email">{t("auth.email")}</label><input id="email" name="email" type="email" autoComplete="email" placeholder="prenom.nom@redaction.mg" maxLength={254} defaultValue={invitedEmail ?? undefined} required /></div>
        <div className="auth-field"><label htmlFor="password">{t("auth.password")}</label><div className="auth-password"><input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete={mode === "signup" ? "new-password" : "current-password"} placeholder={mode === "signup" ? t("auth.passwordMin") : t("auth.passwordPlaceholder")} minLength={mode === "signup" ? 12 : undefined} maxLength={128} required /><button type="button" aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
        {mode === "signup" && <div className="auth-field"><label htmlFor="passwordConfirm">{t("auth.confirmPassword")}</label><div className="auth-password"><input id="passwordConfirm" name="passwordConfirm" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder={t("auth.repeatPassword")} minLength={12} maxLength={128} required /></div></div>}
        {mode === "signup" && (
          <fieldset className="auth-credentials">
            <legend>{t("auth.credentialsTitle")} <span className="auth-field__hint">· {t("auth.optional")}</span></legend>
            <p className="auth-credentials__help" id="credentials-help">{t("auth.credentialsHelp")}</p>
            <div className="auth-field"><label htmlFor="matricule">{t("auth.matricule")} <span>{t("auth.optional")}</span></label><input id="matricule" name="matricule" type="text" autoComplete="off" placeholder={t("auth.matriculePlaceholder")} maxLength={60} aria-describedby="credentials-help" onChange={(event) => { const filled = event.currentTarget.value.trim() !== ""; setCredentialProvided((current) => current.matricule === filled ? current : { ...current, matricule: filled }); }} /></div>
            <div className="auth-field"><label htmlFor="card">{t("auth.pressCard")} <span>{t("auth.optional")}</span></label><input id="card" name="card" type="file" accept="image/jpeg,image/png,image/webp,application/pdf,.jpg,.jpeg,.png,.webp,.pdf" aria-describedby="card-hint credentials-help" onChange={(event) => { const filled = Boolean(event.currentTarget.files?.length); setCredentialProvided((current) => ({ ...current, card: filled })); }} /><p className="auth-field__hint" id="card-hint">{t("auth.pressCardHint")}</p></div>
            {needsConsent && <label className="auth-consent"><input type="checkbox" name="credentialsConsent" required /> <span>{t("auth.credentialsConsent")}</span></label>}
          </fieldset>
        )}
        {mode === "login" && <div className="auth-forgot"><button type="button" onClick={requestPasswordReset} disabled={busy || !emailConfigured || !available}>{t("auth.forgot")}</button></div>}
        <button className="button button--dark auth-submit" type="submit" disabled={busy || !available}>{busy ? <><LoaderCircle className="spin" size={15} /> {t("auth.processing")}</> : <>{mode === "signup" ? t("auth.submitSignup") : t("auth.submitLogin")} <ArrowRight size={15} /></>}</button>
      </form>

      {feedback && <p className={`auth-message${feedback.tone === "error" ? " auth-message--error" : ""}`} role={feedback.tone === "error" ? "alert" : "status"}>{feedback.tone === "error" ? <CircleAlert size={15} /> : <MailCheck size={15} />}{feedback.text}</p>}
      {!configured && <p className="auth-config-note">{t("auth.configNote")}</p>}
      {configured && mode === "login" && !emailConfigured && <p className="auth-config-note">{t("auth.smtpNote")}</p>}
      {mode === "signup" && <p className="auth-terms">{t("auth.invitationOnly")} {emailConfigured ? t("auth.confirmInfo") : t("auth.accountInfo")} {t("auth.accountStored")} <Link href="/confidentialite">{t("auth.privacyLink")}</Link>.</p>}
    </>
  );
}
