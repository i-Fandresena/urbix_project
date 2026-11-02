"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CircleAlert, Eye, EyeOff, LoaderCircle, MailCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";

type FormMode = "login" | "signup";
type Feedback = { tone: "info" | "error"; text: string } | null;
type LoginFormProps = { configured: boolean; emailConfigured: boolean };

function getSafeDestination() {
  const next = new URLSearchParams(window.location.search).get("next");
  return next === "/verification" ? next : "/verification";
}

export default function LoginForm({ configured, emailConfigured }: LoginFormProps) {
  const [mode, setMode] = useState<FormMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const router = useRouter();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback(null);
    if (!configured) {
      setFeedback({ tone: "error", text: "La connexion n’est pas configurée. Renseignez PostgreSQL et BETTER_AUTH_SECRET dans web/.env.local." });
      return;
    }

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");
    const passwordConfirm = String(form.get("passwordConfirm") ?? "");
    const fullName = String(form.get("fullName") ?? "").trim();
    const organization = String(form.get("organization") ?? "").trim();

    if (mode === "signup" && password !== passwordConfirm) {
      setFeedback({ tone: "error", text: "Les deux mots de passe ne correspondent pas." });
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
          callbackURL: "/verification",
        });
        if (error) throw error;
        if (emailConfigured) {
          setFeedback({ tone: "info", text: "Un lien de confirmation vient d’être envoyé. Vérifiez votre boîte de réception." });
          return;
        }
        router.replace(getSafeDestination());
        router.refresh();
      } else {
        const { error } = await authClient.signIn.email({ email, password, callbackURL: "/verification" });
        if (error) throw error;
        router.replace(getSafeDestination());
        router.refresh();
      }
    } catch {
      setFeedback({ tone: "error", text: mode === "signup" ? "La création du compte a échoué. Vérifiez les informations et réessayez." : "Connexion impossible. Vérifiez votre adresse et votre mot de passe." });
    } finally {
      setBusy(false);
    }
  }

  async function requestPasswordReset() {
    const form = document.querySelector<HTMLFormElement>("#hamarino-auth-form");
    const email = String(new FormData(form ?? undefined).get("email") ?? "").trim().toLowerCase();
    if (!email) {
      setFeedback({ tone: "error", text: "Saisissez d’abord votre adresse e-mail." });
      return;
    }
    if (!configured || !emailConfigured) {
      setFeedback({ tone: "info", text: "La récupération par e-mail sera disponible après la configuration d’un serveur SMTP." });
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
      setFeedback({ tone: "info", text: "Si un compte correspond à cette adresse, un lien de réinitialisation va être envoyé." });
    } catch {
      setFeedback({ tone: "error", text: "La demande n’a pas abouti. Vérifiez les paramètres SMTP du serveur et réessayez." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="auth-mode" role="tablist" aria-label="Type d’accès">
        <button type="button" role="tab" aria-selected={mode === "login"} onClick={() => { setMode("login"); setFeedback(null); }}>Se connecter</button>
        <button type="button" role="tab" aria-selected={mode === "signup"} onClick={() => { setMode("signup"); setFeedback(null); }}>Créer un accès</button>
      </div>

      <form id="hamarino-auth-form" className="auth-fields" onSubmit={submit}>
        {mode === "signup" && <div className="auth-field"><label htmlFor="fullName">NOM COMPLET</label><input id="fullName" name="fullName" type="text" autoComplete="name" placeholder="Votre nom" minLength={2} maxLength={80} required /></div>}
        {mode === "signup" && <div className="auth-field"><label htmlFor="organization">MÉDIA / RÉDACTION <span>OPTIONNEL</span></label><input id="organization" name="organization" type="text" autoComplete="organization" placeholder="Votre rédaction" maxLength={100} /></div>}
        <div className="auth-field"><label htmlFor="email">ADRESSE E-MAIL</label><input id="email" name="email" type="email" autoComplete="email" placeholder="prenom.nom@redaction.mg" maxLength={254} required /></div>
        <div className="auth-field"><label htmlFor="password">MOT DE PASSE</label><div className="auth-password"><input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete={mode === "signup" ? "new-password" : "current-password"} placeholder={mode === "signup" ? "12 caractères minimum" : "Votre mot de passe"} minLength={mode === "signup" ? 12 : undefined} maxLength={128} required /><button type="button" aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"} onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
        {mode === "signup" && <div className="auth-field"><label htmlFor="passwordConfirm">CONFIRMER LE MOT DE PASSE</label><div className="auth-password"><input id="passwordConfirm" name="passwordConfirm" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder="Répétez le mot de passe" minLength={12} maxLength={128} required /></div></div>}
        {mode === "login" && <div className="auth-forgot"><button type="button" onClick={requestPasswordReset} disabled={busy || !emailConfigured}>Mot de passe oublié ?</button></div>}
        <button className="button button--dark auth-submit" type="submit" disabled={busy || !configured}>{busy ? <><LoaderCircle className="spin" size={15} /> Traitement…</> : <>{mode === "signup" ? "Créer mon accès" : "Se connecter"} <ArrowRight size={15} /></>}</button>
      </form>

      {feedback && <p className={`auth-message${feedback.tone === "error" ? " auth-message--error" : ""}`} role={feedback.tone === "error" ? "alert" : "status"}>{feedback.tone === "error" ? <CircleAlert size={15} /> : <MailCheck size={15} />}{feedback.text}</p>}
      {!configured && <p className="auth-config-note">Pour activer les comptes, branchez une base PostgreSQL et définissez BETTER_AUTH_SECRET dans web/.env.local.</p>}
      {configured && mode === "login" && !emailConfigured && <p className="auth-config-note">La récupération du mot de passe est désactivée tant qu’aucun serveur SMTP n’est configuré.</p>}
      {mode === "signup" && <p className="auth-terms">{emailConfigured ? "Un lien de confirmation sera envoyé à votre adresse." : "Votre compte sera actif dès sa création. La confirmation et la récupération par e-mail nécessitent un serveur SMTP."} Les données du compte sont conservées dans PostgreSQL. <Link href="/confidentialite">Données et confidentialité</Link>.</p>}
    </>
  );
}
