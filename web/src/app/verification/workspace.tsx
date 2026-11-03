"use client";

import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  Copy,
  ExternalLink,
  FileImage,
  Info,
  LoaderCircle,
  LockKeyhole,
  LogOut,
  MapPinned,
  Newspaper,
  ScanSearch,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import { ChangeEvent, DragEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { signOut } from "../actions";
import { useLavertaPreferences } from "../preferences";
import type { MessageKey } from "@/lib/i18n/messages";

type Source = { title: string; url: string };
type Analysis = {
  summary: string;
  contextStatus: "supported" | "contradicted" | "unverified";
  confidence: "low" | "medium" | "high" | "insufficient";
  visualObservations: string[];
  contextFindings: string[];
  limitations: string[];
  nextSteps: string[];
  sources: Source[];
  isDemo?: boolean;
};

const MAX_FILE_SIZE = 8 * 1024 * 1024;

const demoAnalysis = (t: (key: MessageKey) => string): Analysis => ({
  summary: t("verify.demoSummary"),
  contextStatus: "unverified",
  confidence: "insufficient",
  visualObservations: [t("verify.demoObservation1"), t("verify.demoObservation2")],
  contextFindings: [t("verify.demoContext")],
  limitations: [t("verify.demoLimitation")],
  nextSteps: [t("verify.demoNext1"), t("verify.demoNext2")],
  sources: [],
  isDemo: true,
});

function BrandMark({ small = false, inverse = false }: { small?: boolean; inverse?: boolean }) {
  return (
    <span className={`brand-mark${small ? " brand-mark--small" : ""}`} aria-hidden="true">
      <Image src={inverse ? "/brand/laverta-symbol-on-dark.png" : "/brand/laverta-symbol.png"} alt="" width={40} height={40} />
    </span>
  );
}

function statusLabel(status: Analysis["contextStatus"], t: (key: MessageKey) => string) {
  return t(({ supported: "verify.statusSupported", contradicted: "verify.statusContradicted", unverified: "verify.statusUnverified" } as const)[status]);
}

function confidenceLabel(confidence: Analysis["confidence"], t: (key: MessageKey) => string) {
  return t(({ high: "verify.confidenceHigh", medium: "verify.confidenceMedium", low: "verify.confidenceLow", insufficient: "verify.confidenceInsufficient" } as const)[confidence]);
}

export default function Home() {
  const { t, locale, theme } = useLavertaPreferences();
  const [file, setFile] = useState<File | null>(null);
  const [claim, setClaim] = useState("");
  const [context, setContext] = useState("");
  const [consented, setConsented] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function acceptFile(nextFile?: File) {
    setError("");
    setAnalysis(null);
    setConsented(false);
    if (!nextFile) return;
    if (!nextFile.type.startsWith("image/")) {
      setFile(null);
      setFileInputKey((key) => key + 1);
      setError(t("verify.fileTypeError"));
      return;
    }
    if (nextFile.size > MAX_FILE_SIZE) {
      setFile(null);
      setFileInputKey((key) => key + 1);
      setError(t("verify.fileSizeError"));
      return;
    }
    setFile(nextFile);
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    acceptFile(event.target.files?.[0]);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    acceptFile(event.dataTransfer.files?.[0]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setAnalysis(null);
    if (!file) {
      setError(t("verify.imageRequired"));
      return;
    }
    if (!consented) {
      setError(t("verify.consentRequired"));
      return;
    }

    setBusy(true);
    try {
      const payload = new FormData();
      payload.set("image", file);
      payload.set("claim", claim.trim());
      payload.set("context", context.trim());
      payload.set("consent", "true");
      payload.set("locale", locale);
      const response = await fetch("/api/analyze", { method: "POST", body: payload });
      const data: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(t("verify.error"));
      }
      if (typeof data !== "object" || data === null || !("analysis" in data)) {
        throw new Error(t("verify.error"));
      }
      setAnalysis(data.analysis as Analysis);
    } catch (cause) {
      setError(cause instanceof Error && cause.name === "Error" ? cause.message : t("verify.error"));
    } finally {
      setBusy(false);
    }
  }

  function resetForm() {
    setFile(null);
    setClaim("");
    setContext("");
    setConsented(false);
    setAnalysis(null);
    setError("");
    setFileInputKey((key) => key + 1);
  }

  async function copyBrief() {
    if (!analysis) return;
    const lines = [
      `LAVERTA — ${analysis.isDemo ? t("verify.resultDemo") : t("verify.resultReal")}`,
      "",
      analysis.summary,
      `${t("verify.context")} : ${statusLabel(analysis.contextStatus, t)}`,
      `${t("verify.confidence")} : ${confidenceLabel(analysis.confidence, t)}`,
      "",
      `${t("verify.observed")} :`,
      ...analysis.visualObservations.map((item) => `• ${item}`),
      "",
      `${t("verify.contextFindings")} :`,
      ...(analysis.contextFindings.length ? analysis.contextFindings.map((item) => `• ${item}`) : [`• ${t("verify.noneFound")}`]),
      "",
      `${t("verify.limits")} :`,
      ...(analysis.limitations.length ? analysis.limitations.map((item) => `• ${item}`) : [`• ${t("verify.noneFound")}`]),
      "",
      `${t("verify.nextSteps")} :`,
      ...analysis.nextSteps.map((item) => `• ${item}`),
      "",
      `${t("verify.sourcesTitle")} :`,
      ...(analysis.sources.length ? analysis.sources.map((source) => `• ${source.title} — ${source.url}`) : [`• ${t("verify.noSources")}`]),
      ...(analysis.isDemo ? ["", t("verify.demoNotice")] : []),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError(t("verify.copyError"));
    }
  }

  return (
    <div className="workspace">
      <aside className="sidebar">
        <a className="brand" href="#main" aria-label={t("nav.home")}>
          <BrandMark inverse={theme === "dark"} />
          <span className="brand__word">laverta<span className="brand__period">.</span></span>
        </a>
        <div className="brand-caption">{t("brand.tagline")}</div>

        <div className="sidebar__section-label">{t("verify.sideLabel")}</div>
        <a className="nav-item" href="/redaction">
          <ClipboardList size={17} strokeWidth={1.8} />
          <span>{t("verify.navQueue")}</span>
        </a>
        <a className="nav-item nav-item--active" href="#verification">
          <ScanSearch size={17} strokeWidth={1.8} />
          <span>{t("verify.navCurrent")}</span>
          <span className="nav-item__dot" />
        </a>
        <div className="sidebar__section-label sidebar__section-label--second">{t("verify.method")}</div>
        <div className="method-list">
          <div className="method-step"><span>01</span><p>{t("verify.step1")}</p></div>
          <div className="method-step"><span>02</span><p>{t("verify.step2")}</p></div>
          <div className="method-step"><span>03</span><p>{t("verify.step3")}</p></div>
        </div>

        <div className="sidebar__note">
          <div className="sidebar__note-icon"><MapPinned size={16} /></div>
          <div><strong>{t("verify.noteTitle")}</strong><p>{t("verify.noteText")}</p></div>
        </div>
        <div className="sidebar__bottom">
          <span className="team-avatar">U</span>
          <div><strong>{t("verify.teamName")}</strong><span>{t("verify.projectName")}</span></div>
          <form action={signOut}><button className="sidebar__signout" type="submit" aria-label={t("nav.signOut")} title={t("nav.signOut")}><LogOut size={15} /></button></form>
        </div>
      </aside>

      <main className="main-area" id="main">
        <header className="topbar">
          <div className="topbar__path"><span>{t("verify.workspace")}</span><ChevronRight size={13} /><strong>{t("verify.navCurrent")}</strong></div>
          <div className="topbar__right"><span className="status-dot" /> {t("verify.beta")} <span className="topbar__divider" /> <span className="topbar__edition">{t("verify.location")}</span><form className="topbar__signout" action={signOut}><button type="submit">{t("nav.signOut")} <LogOut size={13} /></button></form></div>
        </header>

        <div className="content-shell" id="verification">
          <section className="intro">
            <div className="eyebrow"><span className="eyebrow__line" /> {t("verify.kicker")} <span className="eyebrow__place">MADAGASCAR</span></div>
            <h1>{t("verify.titleA")}<br /><em>{t("verify.titleB")}</em></h1>
            <p className="intro__text">{t("verify.intro")}</p>
            <div className="intro__meta"><span><span className="meta-number">01</span> {t("verify.fromImage")}</span><span className="meta-slash">/</span><span><span className="meta-number">02</span> {t("verify.context")}</span><span className="meta-slash">/</span><span><span className="meta-number">03</span> {t("verify.sourcesTitle")}</span></div>
          </section>

          <div className="work-grid">
            <section className="form-panel" aria-labelledby="form-title">
              <div className="panel-heading">
                <div><div className="panel-kicker">{t("verify.newInvestigation")} <span>·</span> {t("verify.threeSteps")}</div><h2 id="form-title">{t("verify.fromImage")}</h2></div>
                <div className="step-index"><span>01</span><i /> <i /> <i /></div>
              </div>

              <form onSubmit={handleSubmit} aria-busy={busy}>
                <label className="field-label" htmlFor="image-upload">{t("verify.uploadLabel")} <span className="required-mark">*</span></label>
                <div
                  className={`upload-zone${dragging ? " upload-zone--dragging" : ""}${file ? " upload-zone--file" : ""}`}
                  onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                >
                  <input key={fileInputKey} ref={fileInputRef} id="image-upload" className="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp" aria-label={t("verify.chooseImage")} tabIndex={-1} disabled={busy} onChange={onFileChange} />
                  {file && previewUrl ? (
                    <div className="file-preview">
                      <Image src={previewUrl} alt={t("verify.uploadAlt")} width={74} height={78} unoptimized />
                      <div className="file-preview__info"><span className="file-chip"><FileImage size={14} /> {t("verify.imageLoaded")}</span><strong>{file.name}</strong><small>{(file.size / (1024 * 1024)).toFixed(2)} Mo · {t("verify.localPreview")}</small></div>
                      <button className="icon-button remove-file" type="button" aria-label={t("verify.removeImage")} disabled={busy} onClick={() => { setFile(null); setConsented(false); setAnalysis(null); setFileInputKey((key) => key + 1); }}><X size={16} /></button>
                    </div>
                  ) : (
                    <button className="upload-prompt" type="button" disabled={busy} onClick={() => fileInputRef.current?.click()}>
                      <span className="upload-symbol"><Upload size={19} strokeWidth={1.7} /></span>
                      <span className="upload-copy"><strong>{t("verify.dropImage")}</strong><span>{locale === "fr" ? "ou " : ""}<u>{t("verify.browseFiles")}</u></span></span>
                      <span className="upload-format">JPEG · PNG · WEBP<br />{t("verify.fileSize")}</span>
                    </button>
                  )}
                </div>

                <div className="fields-row">
                  <div className="field-group">
                    <label className="field-label" htmlFor="claim">{t("verify.claim")}</label>
                    <textarea id="claim" className="text-field text-field--claim" maxLength={500} value={claim} disabled={busy} onChange={(event) => { setClaim(event.target.value); setAnalysis(null); }} placeholder={t("verify.claimPlaceholder")} />
                    <div className="field-hint"><span>{t("verify.claimHint")}</span><span>{claim.length}/500</span></div>
                  </div>
                  <div className="field-group">
                    <label className="field-label" htmlFor="context">{t("verify.context")} <span className="optional-label">{t("verify.optional")}</span></label>
                    <textarea id="context" className="text-field text-field--context" maxLength={1200} value={context} disabled={busy} onChange={(event) => { setContext(event.target.value); setAnalysis(null); }} placeholder={t("verify.contextPlaceholder")} />
                    <div className="field-hint"><span>{t("verify.contextHint")}</span><span>{context.length}/1200</span></div>
                  </div>
                </div>

                <div className="privacy-row">
                  <label className="consent-label">
                    <input type="checkbox" checked={consented} disabled={busy} onChange={(event) => setConsented(event.target.checked)} />
                    <span className="custom-checkbox"><Check size={12} /></span>
                    <span>{t("verify.consent")}</span>
                  </label>
                  <span className="privacy-detail"><LockKeyhole size={13} /> {t("verify.privacyDetail")}</span>
                </div>
                <p className="privacy-footnote">{t("verify.freeTierPrivacy")}</p>

                {error && <div className="error-message" role="alert"><CircleAlert size={16} />{error}</div>}

                <div className="form-actions">
                  <button className="submit-button" type="submit" disabled={busy}>
                    {busy ? <><LoaderCircle className="spin" size={17} /> {t("verify.searching")}</> : <>{t("verify.search")} <ArrowRight size={17} /></>}
                  </button>
                  <button className="text-button" type="button" disabled={busy} onClick={() => { setAnalysis(demoAnalysis(t)); setError(""); }}>{t("verify.example")} <ArrowDownRight size={14} /></button>
                </div>
                <p className="submit-note"><Info size={13} /> {t("verify.submitNote")}</p>
              </form>
            </section>

            <aside className="context-rail">
              <div className="rail-topline"><span>{t("verify.engagement")}</span><span>U·01</span></div>
              <div className="rail-illustration" aria-hidden="true">
                <div className="rail-illustration__frame"><span className="frame-corner frame-corner--tl" /><span className="frame-corner frame-corner--tr" /><span className="frame-corner frame-corner--bl" /><span className="frame-corner frame-corner--br" /><div className="lens-ring"><div className="lens-center"><BrandMark small inverse={theme === "dark"} /></div></div><span className="scan-point scan-point--one" /><span className="scan-point scan-point--two" /><span className="scan-line" /></div>
                <span className="rail-illustration__caption">{t("auth.storyKicker")}</span>
              </div>
              <h3>{t("verify.contextHeadlineA")}<br /><em>{t("verify.contextHeadlineB")}</em></h3>
              <p className="rail-description">{t("verify.contextDescription")}</p>
              <div className="rail-rule" />
              <div className="rail-principle"><span className="rail-principle__num">01</span><div><strong>{t("verify.noAutoVerdict")}</strong><p>{t("verify.humanDecides")}</p></div></div>
              <div className="rail-principle"><span className="rail-principle__num">02</span><div><strong>{t("verify.visibleSources")}</strong><p>{t("verify.sourceCanCheck")}</p></div></div>
                <div className="rail-footnote"><Check size={15} /> {t("verify.cautiousResults")}</div>
            </aside>
          </div>

          {analysis && (
            <section className={`result-panel${analysis.isDemo ? " result-panel--demo" : ""}`} aria-live="polite" aria-labelledby="result-heading">
              <div className="result-head">
                <div><div className="panel-kicker">{analysis.isDemo ? t("verify.resultDemo") : t("verify.resultReal")}</div><h2 id="result-heading">{t("verify.resultTitle")}</h2></div>
                <button className="copy-button" type="button" onClick={copyBrief}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? t("verify.copied") : t("verify.copy")}</button>
              </div>
              {analysis.isDemo && <div className="demo-banner"><Info size={16} /> {t("verify.demoNotice")}</div>}
              <div className="result-summary-grid">
                <div className="result-status"><span className={`status-tag status-tag--${analysis.contextStatus}`}>{analysis.contextStatus === "supported" ? <Check size={14} /> : analysis.contextStatus === "contradicted" ? <CircleAlert size={14} /> : <Info size={14} />}{statusLabel(analysis.contextStatus, t)}</span><p>{analysis.summary}</p></div>
                <div className="confidence-card"><span>{t("verify.confidence")}</span><strong>{confidenceLabel(analysis.confidence, t)}</strong><div className="confidence-bars" aria-label={confidenceLabel(analysis.confidence, t)}><i className={analysis.confidence === "low" || analysis.confidence === "medium" || analysis.confidence === "high" ? "is-on" : ""} /><i className={analysis.confidence === "medium" || analysis.confidence === "high" ? "is-on" : ""} /><i className={analysis.confidence === "high" ? "is-on" : ""} /></div><small>{t("verify.confidenceNote")}</small></div>
              </div>
              <div className="result-columns">
                <div className="result-column"><h3><ScanSearch size={16} /> {t("verify.observed")}</h3><ul>{analysis.visualObservations.map((item, index) => <li key={index}>{item}</li>)}</ul>{analysis.contextFindings.length > 0 && <><h3 className="result-subhead"><Newspaper size={16} /> {t("verify.contextFindings")}</h3><ul>{analysis.contextFindings.map((item, index) => <li key={index}>{item}</li>)}</ul></>}</div>
                <div className="result-column"><h3><ArrowUpRight size={16} /> {t("verify.nextSteps")}</h3><ol>{analysis.nextSteps.map((item, index) => <li key={index}><span>{String(index + 1).padStart(2, "0")}</span>{item}</li>)}</ol>{analysis.limitations.length > 0 && <div className="limits-box"><strong>{t("verify.keepInMind")}</strong>{analysis.limitations.map((item, index) => <p key={index}>{item}</p>)}</div>}</div>
              </div>
              <div className="sources-row"><div className="sources-label"><span>{t("verify.sourcesTitle")}</span><small>{t("verify.sourceCount", { count: analysis.sources.length })}</small></div><div className="source-list">{analysis.sources.length ? analysis.sources.map((source, index) => <a className="source-link" href={source.url} key={`${source.url}-${index}`} target="_blank" rel="noreferrer"><span>{source.title}</span><ExternalLink size={13} /></a>) : <span className="source-empty">{t("verify.sourceEmpty")}</span>}</div></div>
            </section>
          )}

          <footer className="page-footer"><span>LAVERTA <span className="footer-dot">·</span> URBIX</span><span>{t("verify.footerNote")}</span><a href="#main" onClick={(event) => { event.preventDefault(); resetForm(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>{t("verify.newCheck")} <ArrowUpRight size={13} /></a></footer>
        </div>
      </main>
    </div>
  );
}
