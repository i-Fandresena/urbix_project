"use client";

import { ArrowLeft, ArrowRight, Check, Copy, Info, LoaderCircle, Upload } from "lucide-react";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useLavertaPreferences } from "../preferences";
import type { MessageKey } from "@/lib/i18n/messages";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const themes = ["education", "agriculture", "health", "economy", "politics", "safety", "other"] as const;

type ReportDraft = { assertion: string; context: string; theme: string; language: string; sourceUrl: string };

export default function ReportForm() {
  const { t, locale } = useLavertaPreferences();
  const [review, setReview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [trackingCode, setTrackingCode] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [draft, setDraft] = useState<ReportDraft | null>(null);
  const [fileError, setFileError] = useState("");
  const [copied, setCopied] = useState(false);
  const [consented, setConsented] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  function selectFile(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0] ?? null;
    setFileError("");
    setFile(null);
    if (!next) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(next.type)) {
      setFileError(t("report.imageTypeError"));
      event.target.value = "";
      return;
    }
    if (next.size > MAX_FILE_SIZE) {
      setFileError(t("report.imageSizeError"));
      event.target.value = "";
      return;
    }
    setFile(next);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!review) {
      const form = event.currentTarget;
      const values = new FormData(form);
      const sourceUrl = values.get("sourceUrl");
      const nextDraft = {
        assertion: String(values.get("assertion") ?? "").trim(),
        context: String(values.get("context") ?? "").trim(),
        theme: String(values.get("theme") ?? "other"),
        language: String(values.get("language") ?? "fr"),
        sourceUrl: typeof sourceUrl === "string" ? sourceUrl.trim() : "",
      };
      if (!file && !nextDraft.sourceUrl) {
        setError(t("report.mediaRequired"));
        return;
      }
      setDraft(nextDraft);
      setReview(true);
      return;
    }
    if (!consented) {
      setError(t("report.consentRequired"));
      return;
    }

    setBusy(true);
    try {
      const formData = new FormData(event.currentTarget);
      if (file) formData.set("media", file);
      formData.set("consent", "true");
      const response = await fetch("/api/reports", { method: "POST", body: formData, cache: "no-store" });
      const data: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(t("report.sendError"));
      }
      if (typeof data !== "object" || data === null || !("trackingCode" in data) || typeof data.trackingCode !== "string") {
        throw new Error(t("report.codeError"));
      }
      setTrackingCode(data.trackingCode);
    } catch (cause) {
      setError(cause instanceof Error && cause.name === "Error" ? cause.message : t("report.serviceError"));
    } finally {
      setBusy(false);
    }
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(trackingCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError(t("report.copyError"));
    }
  }

  if (trackingCode) {
    return (
      <section className="report-success" aria-live="polite">
        <div className="report-success__icon"><Check size={20} /></div>
        <div className="report-success__kicker">{t("report.sent")}</div>
        <h2>{t("report.keepCode")}</h2>
        <p>{t("report.keepCodeText")}</p>
        <div className="tracking-code"><strong>{trackingCode}</strong><button type="button" onClick={copyCode} aria-label={t("report.copyCode")}>{copied ? <Check size={17} /> : <Copy size={17} />}</button></div>
        <p className="report-success__privacy">{t("report.codePrivate")}</p>
        <a className="report-primary" href={`/suivi#${encodeURIComponent(trackingCode)}`}>{t("report.openTracking")} <ArrowRight size={16} /></a>
      </section>
    );
  }

  return (
    <form className="report-form" onSubmit={handleSubmit}>
      {!review ? (
        <>
          <div className="report-form__step"><span>01</span><div><strong>{t("report.stepSignal")}</strong><small>{t("report.stepSignalHint")}</small></div></div>
          <label className="report-field">{t("report.assertion")}
            <textarea name="assertion" required minLength={12} maxLength={500} defaultValue={draft?.assertion ?? ""} placeholder={t("report.assertionPlaceholder")} rows={4} />
            <small>{t("report.charCount")}</small>
          </label>
          <div className="report-form__grid">
            <label className="report-field">{t("report.theme")}
              <select name="theme" defaultValue={draft?.theme ?? "other"} required>{themes.map((value) => <option value={value} key={value}>{t(`theme.${value}` as MessageKey)}</option>)}</select>
            </label>
            <label className="report-field">{t("report.language")}
              <select name="language" defaultValue={draft?.language ?? locale} required><option value="fr">Français</option><option value="mg">Malagasy</option><option value="en">English</option></select>
            </label>
          </div>
          <label className="report-field">{t("report.context")} <span className="optional-label">{t("report.optional")}</span>
            <textarea name="context" maxLength={1200} defaultValue={draft?.context ?? ""} placeholder={t("report.contextPlaceholder")} rows={3} />
          </label>
          <div className="report-form__step report-form__step--media"><span>02</span><div><strong>{t("report.stepMedia")}</strong><small>{t("report.stepMediaHint")}</small></div></div>
          <label className="report-field">{t("report.image")}
            <span className="upload-field"><Upload size={17} /><span>{file ? file.name : t("report.chooseImage")}<small>{file ? `${(file.size / 1024 / 1024).toFixed(1)} Mo · 5 Mo max.` : t("report.imageEncrypted")}</small></span><input ref={fileRef} type="file" name="media" accept="image/jpeg,image/png,image/webp" onChange={selectFile} /></span>
            {fileError && <small className="form-error">{fileError}</small>}
          </label>
          {previewUrl && <div className="report-image-preview"><img src={previewUrl} alt={t("report.attachedImage", { name: file?.name ?? "" })} /><button type="button" onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ""; }}>{t("report.removeImage")}</button></div>}
          <label className="report-field">{t("report.sourceLink")} <span className="optional-label">{t("report.optionalImage")}</span>
            <input name="sourceUrl" type="url" maxLength={2000} defaultValue={draft?.sourceUrl ?? ""} placeholder="https://…" />
          </label>
          <label className="report-consent"><input type="checkbox" checked={consented} onChange={(event) => setConsented(event.target.checked)} /><span>{t("report.consent")}</span></label>
          <p className="report-form__note"><Info size={14} /> {t("report.aiNote")}</p>
          <div className="honeypot" aria-hidden="true"><label>Ne pas remplir<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
          {error && <p className="report-error" role="alert">{error}</p>}
          <button className="report-primary" type="submit">{t("report.reviewButton")} <ArrowRight size={16} /></button>
        </>
      ) : (
        <>
          <div className="report-form__step"><span>03</span><div><strong>{t("report.reviewTitle")}</strong><small>{t("report.reviewHint")}</small></div></div>
          <div className="report-review">
            <input type="hidden" name="assertion" value={draft?.assertion ?? ""} />
            <input type="hidden" name="context" value={draft?.context ?? ""} />
            <input type="hidden" name="theme" value={draft?.theme ?? "other"} />
            <input type="hidden" name="language" value={draft?.language ?? "fr"} />
            <input type="hidden" name="sourceUrl" value={draft?.sourceUrl ?? ""} />
            <span>{t("report.assertionShort")}</span><p>{draft?.assertion}</p>
            <div><span>{t("report.theme")}</span><strong>{draft?.theme ? t(`theme.${draft.theme}` as MessageKey) : t("theme.other")}</strong></div>
            <div><span>{t("report.mediaShort")}</span><strong>{file ? t("report.attachedImage", { name: file.name }) : t("report.publicationLink")}</strong></div>
          </div>
          <label className="report-consent"><input type="checkbox" checked={consented} onChange={(event) => setConsented(event.target.checked)} /><span>{t("report.reviewConsent")}</span></label>
          {error && <p className="report-error" role="alert">{error}</p>}
          <div className="report-form__actions">
            <button className="report-secondary" type="button" onClick={() => { setReview(false); setError(""); }}><ArrowLeft size={15} /> {t("report.edit")}</button>
            <button className="report-primary" type="submit" disabled={busy || !consented}>{busy ? <><LoaderCircle className="spin" size={16} /> {t("report.sending")}</> : <>{t("report.confirmSend")} <ArrowRight size={16} /></>}</button>
          </div>
        </>
      )}
    </form>
  );
}
