"use client";

import { ArrowRight, Check, CircleAlert, LoaderCircle, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useLavertaPreferences } from "../preferences";
import type { MessageKey } from "@/lib/i18n/messages";

type PublicReport = {
  assertion: string;
  theme: string;
  status: "new" | "in_review" | "referred" | "verified" | "closed";
  verdict: "false" | "true" | "misleading" | "unverifiable" | null;
  correction: string | null;
  sources: { title: string; url: string }[];
  has_media: boolean;
  submitted_at: string;
  updated_at: string;
  published_at: string | null;
};

const themeMessageKeys = {
  education: "theme.education",
  agriculture: "theme.agriculture",
  health: "theme.health",
  economy: "theme.economy",
  politics: "theme.politics",
  safety: "theme.safety",
  other: "theme.other",
} as const;

export default function TrackingForm() {
  const { t, locale } = useLavertaPreferences();
  const [code, setCode] = useState("");
  const [report, setReport] = useState<PublicReport | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let fromFragment = window.location.hash.slice(1);
    try { fromFragment = decodeURIComponent(fromFragment); } catch { fromFragment = ""; }
    fromFragment = fromFragment.trim();
    if (!fromFragment) return;
    setCode(fromFragment);
    void lookup(fromFragment);
    // Initial fragment is intentionally read once, after hydration.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function lookup(value: string) {
    setBusy(true);
    setError("");
    setReport(null);
    try {
      const response = await fetch("/api/reports/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: value, action: "lookup" }),
        cache: "no-store",
      });
      const data: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(t("tracking.lookupError"));
      }
      if (typeof data !== "object" || data === null || !("report" in data)) throw new Error(t("tracking.invalid"));
      setReport(data.report as PublicReport);
      setCode(value.trim().toUpperCase());
    } catch (cause) {
      setError(cause instanceof Error && cause.name === "Error" ? cause.message : t("tracking.lookupError"));
    } finally {
      setBusy(false);
    }
  }

  async function handleLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await lookup(code);
  }

  async function eraseReport() {
    if (!window.confirm(t("tracking.confirmErase"))) return;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/reports/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, action: "erase" }),
        cache: "no-store",
      });
      const data: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(t("tracking.eraseError"));
      }
      setReport(null);
      setCode("");
      window.history.replaceState(null, "", "/suivi");
      setError(t("tracking.erased"));
    } catch (cause) {
      setError(cause instanceof Error && cause.name === "Error" ? cause.message : t("tracking.eraseError"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="tracking-flow">
      <form className="tracking-form" onSubmit={handleLookup}>
        <label className="report-field" htmlFor="tracking-code">{t("tracking.label")}</label>
        <div className="tracking-input-row"><input id="tracking-code" value={code} onChange={(event) => setCode(event.target.value)} autoCapitalize="characters" autoComplete="off" placeholder={t("tracking.placeholder")} required /><button className="report-primary" type="submit" disabled={busy}>{busy ? <LoaderCircle className="spin" size={16} /> : <>{t("tracking.lookup")} <ArrowRight size={16} /></>}</button></div>
      </form>
      {error && <p className={report ? "report-error" : "tracking-message"} role="status"><CircleAlert size={15} />{error}</p>}
      {report && (
        <article className="tracking-result" aria-live="polite">
          <div className="tracking-result__top"><span className={`report-status report-status--${report.status}`}>{t(({ new: "status.new", in_review: "status.inReview", referred: "status.referred", verified: "status.verified", closed: "status.closed" } as const)[report.status])}</span><span>LV · {new Date(report.submitted_at).toLocaleDateString(locale === "mg" ? "mg-MG" : locale)}</span></div>
          <h2>{report.assertion}</h2>
          <p className="tracking-result__theme">{t("tracking.theme")} · {t(themeMessageKeys[report.theme as keyof typeof themeMessageKeys] ?? "theme.other" as MessageKey)}</p>
          {report.has_media && <p className="tracking-result__media"><Check size={14} /> {t("tracking.hasImage")}</p>}
          {report.correction && (
            <section className="tracking-correction">
              <div className="tracking-correction__kicker">{t("tracking.correction")}</div>
              <span className="verdict-label">{report.verdict ? t(({ false: "verdict.false", true: "verdict.true", misleading: "verdict.misleading", unverifiable: "verdict.unverifiable" } as const)[report.verdict]) : t("status.verified")}</span>
              <p>{report.correction}</p>
              {report.sources.length > 0 && <div className="tracking-sources"><strong>{t("tracking.sources")}</strong>{report.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noopener noreferrer nofollow" referrerPolicy="no-referrer">{source.title} <ArrowRight size={13} /></a>)}</div>}
            </section>
          )}
          <div className="tracking-result__footer"><span>{t("tracking.updated")} · {new Date(report.updated_at).toLocaleDateString(locale === "mg" ? "mg-MG" : locale)}</span><button type="button" onClick={eraseReport} disabled={busy}><Trash2 size={14} /> {t("tracking.erase")}</button></div>
        </article>
      )}
      {!report && !error && <p className="tracking-message">{t("tracking.privacyNote")}</p>}
    </div>
  );
}
