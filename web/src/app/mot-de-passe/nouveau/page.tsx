"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CircleAlert, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function NewPasswordPage() {
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
      setMessage("Les deux mots de passe ne correspondent pas.");
      setError(true);
      return;
    }
    if (!isSupabaseConfigured()) {
      setMessage("La configuration Supabase est manquante.");
      setError(true);
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      router.replace("/verification");
      router.refresh();
    } catch {
      setMessage("Le lien de réinitialisation a expiré ou n’est plus valide. Demandez-en un nouveau.");
      setError(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="password-page">
      <div className="password-card">
        <Link href="/" className="brand-lockup"><span className="brand-lockup__mark" aria-hidden="true"><svg viewBox="0 0 36 36" fill="none"><path d="M4 12V4h8M24 4h8v8M32 24v8h-8M12 32H4v-8" /><circle cx="14.5" cy="18" r="2.4" /><path d="M17 18h7.2" /><circle cx="27.2" cy="18" r="1.8" /></svg></span><span className="brand-lockup__word">hamarino<span>.</span></span></Link>
        <span className="auth-heading__eyebrow">SÉCURITÉ DU COMPTE</span>
        <h1>Nouveau mot de passe</h1>
        <p>Choisissez un mot de passe d’au moins 12 caractères pour retrouver votre espace.</p>
        <form className="auth-fields" onSubmit={updatePassword}>
          <div className="auth-field"><label htmlFor="password">NOUVEAU MOT DE PASSE</label><div className="auth-password"><input id="password" name="password" type={passwordVisible ? "text" : "password"} autoComplete="new-password" minLength={12} maxLength={128} required /><button type="button" aria-label={passwordVisible ? "Masquer le mot de passe" : "Afficher le mot de passe"} onClick={() => setPasswordVisible((visible) => !visible)}>{passwordVisible ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></div>
          <div className="auth-field"><label htmlFor="confirm">CONFIRMER LE MOT DE PASSE</label><input id="confirm" name="confirm" type={passwordVisible ? "text" : "password"} autoComplete="new-password" minLength={12} maxLength={128} required /></div>
          <button className="button button--dark auth-submit" disabled={busy} type="submit">{busy ? <><LoaderCircle className="spin" size={15} /> Enregistrement…</> : <>Enregistrer <ArrowRight size={15} /></>}</button>
        </form>
        {message && <p className={`auth-message${error ? " auth-message--error" : ""}`} role={error ? "alert" : "status"}><CircleAlert size={15} />{message}</p>}
      </div>
    </main>
  );
}
