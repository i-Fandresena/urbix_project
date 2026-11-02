"use client";

import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronRight,
  CircleAlert,
  Copy,
  ExternalLink,
  FileImage,
  Info,
  LoaderCircle,
  LockKeyhole,
  MapPinned,
  Newspaper,
  ScanSearch,
  Upload,
  X,
} from "lucide-react";
import Image from "next/image";
import { ChangeEvent, DragEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";

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

const demoAnalysis: Analysis = {
  summary: "Le contexte fourni ne suffit pas à établir où ni quand cette image a été prise. Une ressemblance visuelle ne confirme pas la légende qui circule.",
  contextStatus: "unverified",
  confidence: "insufficient",
  visualObservations: [
    "L’image doit être comparée à des publications antérieures et à des éléments géographiques reconnaissables.",
    "L’analyse visuelle seule ne permet pas de dater la scène ni d’identifier son auteur.",
  ],
  contextFindings: ["Aucune recherche de sources n’a été effectuée dans cet exemple."],
  limitations: ["Ceci est un scénario d’exercice : aucune image réelle ni source externe n’a été consultée."],
  nextSteps: [
    "Rechercher une version plus ancienne avec une recherche inversée d’image.",
    "Contacter une source locale qui peut confirmer le lieu et la date.",
  ],
  sources: [],
  isDemo: true,
};

function BrandMark({ small = false }: { small?: boolean }) {
  return (
    <span className={`brand-mark${small ? " brand-mark--small" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 40 40" fill="none">
        <path d="M4.5 13V4.5H13M27 4.5h8.5V13M35.5 27v8.5H27M13 35.5H4.5V27" />
        <circle cx="16" cy="20" r="2.7" />
        <path d="M18.7 20h8.5" />
        <circle className="brand-mark__dot" cx="30" cy="20" r="2.1" />
      </svg>
    </span>
  );
}

function statusLabel(status: Analysis["contextStatus"]) {
  if (status === "supported") return "Contexte étayé";
  if (status === "contradicted") return "Contexte contredit";
  return "À vérifier";
}

function confidenceLabel(confidence: Analysis["confidence"]) {
  if (confidence === "high") return "Plusieurs éléments convergent";
  if (confidence === "medium") return "Quelques éléments convergent";
  if (confidence === "low") return "Peu d’éléments disponibles";
  return "Éléments insuffisants";
}

export default function Home() {
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
      setError("Choisissez un fichier image au format JPEG, PNG ou WebP.");
      return;
    }
    if (nextFile.size > MAX_FILE_SIZE) {
      setFile(null);
      setFileInputKey((key) => key + 1);
      setError("Cette image dépasse 8 Mo. Choisissez un fichier plus léger.");
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
      setError("Ajoutez une image pour commencer la vérification.");
      return;
    }
    if (!consented) {
      setError("Confirmez le transfert de l’image vers Gemini pour lancer l’analyse.");
      return;
    }

    setBusy(true);
    try {
      const payload = new FormData();
      payload.set("image", file);
      payload.set("claim", claim.trim());
      payload.set("context", context.trim());
      payload.set("consent", "true");
      const response = await fetch("/api/analyze", { method: "POST", body: payload });
      const data: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message = typeof data === "object" && data !== null && "error" in data && typeof data.error === "string" ? data.error : "L’analyse n’a pas abouti. Réessayez dans un instant.";
        throw new Error(message);
      }
      if (typeof data !== "object" || data === null || !("analysis" in data)) {
        throw new Error("La réponse reçue n’est pas exploitable. Réessayez dans un instant.");
      }
      setAnalysis(data.analysis as Analysis);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Impossible de joindre le service pour le moment.");
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
      `HAMARINO — ${analysis.isDemo ? "EXEMPLE SIMULÉ" : "NOTE DE VÉRIFICATION"}`,
      "",
      analysis.summary,
      `État du contexte : ${statusLabel(analysis.contextStatus)}`,
      `Confiance : ${confidenceLabel(analysis.confidence)}`,
      "",
      "Éléments visuels :",
      ...analysis.visualObservations.map((item) => `• ${item}`),
      "",
      "Contexte recoupé :",
      ...(analysis.contextFindings.length ? analysis.contextFindings.map((item) => `• ${item}`) : ["• Aucun élément cité."]),
      "",
      "Limites :",
      ...(analysis.limitations.length ? analysis.limitations.map((item) => `• ${item}`) : ["• Aucune limite indiquée."]),
      "",
      "À faire :",
      ...analysis.nextSteps.map((item) => `• ${item}`),
      "",
      "Sources :",
      ...(analysis.sources.length ? analysis.sources.map((source) => `• ${source.title} — ${source.url}`) : ["• Aucune source citée."]),
      ...(analysis.isDemo ? ["", "Scénario d’exercice : aucune source réelle n’a été consultée."] : []),
    ];
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("La copie n’est pas disponible dans ce navigateur.");
    }
  }

  return (
    <div className="workspace">
      <aside className="sidebar">
        <a className="brand" href="#main" aria-label="Hamarino, accueil">
          <BrandMark />
          <span className="brand__word">hamarino<span className="brand__period">.</span></span>
        </a>
        <div className="brand-caption">Chaque image mérite<br />ses sources.</div>

        <div className="sidebar__section-label">ESPACE RÉDACTION</div>
        <a className="nav-item nav-item--active" href="#verification">
          <ScanSearch size={17} strokeWidth={1.8} />
          <span>Vérifier une image</span>
          <span className="nav-item__dot" />
        </a>
        <div className="sidebar__section-label sidebar__section-label--second">LA MÉTHODE</div>
        <div className="method-list">
          <div className="method-step"><span>01</span><p>Observer les indices visuels</p></div>
          <div className="method-step"><span>02</span><p>Recouper avec des sources</p></div>
          <div className="method-step"><span>03</span><p>Décider avec prudence</p></div>
        </div>

        <div className="sidebar__note">
          <div className="sidebar__note-icon"><MapPinned size={16} /></div>
          <div><strong>Ancré à Madagascar</strong><p>Un outil pensé pour le travail journalistique, partout dans le pays.</p></div>
        </div>
        <div className="sidebar__bottom">
          <span className="team-avatar">U</span>
          <div><strong>Équipe Urbix</strong><span>Projet hackathon IFM</span></div>
          <ArrowUpRight size={15} className="sidebar__team-arrow" />
        </div>
      </aside>

      <main className="main-area" id="main">
        <header className="topbar">
          <div className="topbar__path"><span>ESPACE DE TRAVAIL</span><ChevronRight size={13} /><strong>Vérification visuelle</strong></div>
          <div className="topbar__right"><span className="status-dot" /> BÊTA ÉDITORIALE <span className="topbar__divider" /> <span className="topbar__edition">ANTANANARIVO · 2026</span></div>
        </header>

        <div className="content-shell" id="verification">
          <section className="intro">
            <div className="eyebrow"><span className="eyebrow__line" /> LE BUREAU DE VÉRIFICATION <span className="eyebrow__place">MADAGASCAR</span></div>
            <h1>Une image circule.<br /><em>On remonte sa source.</em></h1>
            <p className="intro__text">Examinez son contexte, confrontez les indices aux sources disponibles et gardez la main sur la conclusion.</p>
            <div className="intro__meta"><span><span className="meta-number">01</span> IMAGE</span><span className="meta-slash">/</span><span><span className="meta-number">02</span> CONTEXTE</span><span className="meta-slash">/</span><span><span className="meta-number">03</span> SOURCES</span></div>
          </section>

          <div className="work-grid">
            <section className="form-panel" aria-labelledby="form-title">
              <div className="panel-heading">
                <div><div className="panel-kicker">NOUVELLE ENQUÊTE <span>·</span> 3 ÉTAPES</div><h2 id="form-title">Partir de l’image</h2></div>
                <div className="step-index"><span>01</span><i /> <i /> <i /></div>
              </div>

              <form onSubmit={handleSubmit} aria-busy={busy}>
                <label className="field-label" htmlFor="image-upload">L’image à vérifier <span className="required-mark">*</span></label>
                <div
                  className={`upload-zone${dragging ? " upload-zone--dragging" : ""}${file ? " upload-zone--file" : ""}`}
                  onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                >
                  <input key={fileInputKey} ref={fileInputRef} id="image-upload" className="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp" aria-label="Choisir une image JPEG, PNG ou WebP" tabIndex={-1} disabled={busy} onChange={onFileChange} />
                  {file && previewUrl ? (
                    <div className="file-preview">
                      <Image src={previewUrl} alt="Aperçu de l’image ajoutée" width={74} height={78} unoptimized />
                      <div className="file-preview__info"><span className="file-chip"><FileImage size={14} /> IMAGE CHARGÉE</span><strong>{file.name}</strong><small>{(file.size / (1024 * 1024)).toFixed(2)} Mo · aperçu local</small></div>
                      <button className="icon-button remove-file" type="button" aria-label="Retirer l’image" disabled={busy} onClick={() => { setFile(null); setConsented(false); setAnalysis(null); setFileInputKey((key) => key + 1); }}><X size={16} /></button>
                    </div>
                  ) : (
                    <button className="upload-prompt" type="button" disabled={busy} onClick={() => fileInputRef.current?.click()}>
                      <span className="upload-symbol"><Upload size={19} strokeWidth={1.7} /></span>
                      <span className="upload-copy"><strong>Déposez votre image ici</strong><span>ou <u>parcourez vos fichiers</u></span></span>
                      <span className="upload-format">JPEG · PNG · WEBP<br />8 MO MAX.</span>
                    </button>
                  )}
                </div>

                <div className="fields-row">
                  <div className="field-group">
                    <label className="field-label" htmlFor="claim">L’affirmation en circulation</label>
                    <textarea id="claim" className="text-field text-field--claim" maxLength={500} value={claim} disabled={busy} onChange={(event) => { setClaim(event.target.value); setAnalysis(null); }} placeholder="Ex. « Cette photo a été prise hier à Toamasina. »" />
                    <div className="field-hint"><span>Ce que vous souhaitez vérifier</span><span>{claim.length}/500</span></div>
                  </div>
                  <div className="field-group">
                    <label className="field-label" htmlFor="context">Ce que vous savez déjà <span className="optional-label">OPTIONNEL</span></label>
                    <textarea id="context" className="text-field text-field--context" maxLength={1200} value={context} disabled={busy} onChange={(event) => { setContext(event.target.value); setAnalysis(null); }} placeholder="Lien, date, lieu ou détails transmis par votre source…" />
                    <div className="field-hint"><span>Ces éléments guident la recherche</span><span>{context.length}/1200</span></div>
                  </div>
                </div>

                <div className="privacy-row">
                  <label className="consent-label">
                    <input type="checkbox" checked={consented} disabled={busy} onChange={(event) => setConsented(event.target.checked)} />
                    <span className="custom-checkbox"><Check size={12} /></span>
                    <span>Je comprends que l’image sera transmise à Gemini pour l’analyse.</span>
                  </label>
                  <span className="privacy-detail"><LockKeyhole size={13} /> Non conservée par Hamarino</span>
                </div>

                {error && <div className="error-message" role="alert"><CircleAlert size={16} />{error}</div>}

                <div className="form-actions">
                  <button className="submit-button" type="submit" disabled={busy}>
                    {busy ? <><LoaderCircle className="spin" size={17} /> Analyse en cours</> : <>Lancer l’enquête <ArrowRight size={17} /></>}
                  </button>
                  <button className="text-button" type="button" disabled={busy} onClick={() => { setAnalysis(demoAnalysis); setError(""); }}>Voir un exemple <ArrowDownRight size={14} /></button>
                </div>
                <p className="submit-note"><Info size={13} /> L’analyse apporte des pistes. La vérification éditoriale reste humaine.</p>
              </form>
            </section>

            <aside className="context-rail">
              <div className="rail-topline"><span>NOTRE ENGAGEMENT</span><span>U·01</span></div>
              <div className="rail-illustration" aria-hidden="true">
                <div className="rail-illustration__frame"><span className="frame-corner frame-corner--tl" /><span className="frame-corner frame-corner--tr" /><span className="frame-corner frame-corner--bl" /><span className="frame-corner frame-corner--br" /><div className="lens-ring"><div className="lens-center"><BrandMark small /></div></div><span className="scan-point scan-point--one" /><span className="scan-point scan-point--two" /><span className="scan-line" /></div>
                <span className="rail-illustration__caption">L’IMAGE N’EST QUE LE DÉBUT</span>
              </div>
              <h3>Le contexte fait<br /><em>la différence.</em></h3>
              <p className="rail-description">Une photo peut être authentique et pourtant raconter la mauvaise histoire. Hamarino sépare les indices visibles des faits à recouper.</p>
              <div className="rail-rule" />
              <div className="rail-principle"><span className="rail-principle__num">01</span><div><strong>Pas de verdict automatique</strong><p>L’outil éclaire la décision. Le journaliste la prend.</p></div></div>
              <div className="rail-principle"><span className="rail-principle__num">02</span><div><strong>Les sources restent visibles</strong><p>Chaque piste utile doit pouvoir être consultée.</p></div></div>
                <div className="rail-footnote"><Check size={15} /> Des résultats prudents, une rédaction aux commandes.</div>
            </aside>
          </div>

          {analysis && (
            <section className={`result-panel${analysis.isDemo ? " result-panel--demo" : ""}`} aria-live="polite" aria-labelledby="result-heading">
              <div className="result-head">
                <div><div className="panel-kicker">{analysis.isDemo ? "SCÉNARIO D’EXERCICE · SIMULATION" : "NOTE DE VÉRIFICATION · GEMINI"}</div><h2 id="result-heading">Ce que les éléments permettent de dire</h2></div>
                <button className="copy-button" type="button" onClick={copyBrief}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? "Copié" : "Copier la note"}</button>
              </div>
              {analysis.isDemo && <div className="demo-banner"><Info size={16} /> Résultat simulé, sans lien avec une image déposée. Aucune recherche ni source réelle n’a été consultée.</div>}
              <div className="result-summary-grid">
                <div className="result-status"><span className={`status-tag status-tag--${analysis.contextStatus}`}>{analysis.contextStatus === "supported" ? <Check size={14} /> : analysis.contextStatus === "contradicted" ? <CircleAlert size={14} /> : <Info size={14} />}{statusLabel(analysis.contextStatus)}</span><p>{analysis.summary}</p></div>
                <div className="confidence-card"><span>CONFIANCE ÉDITORIALE</span><strong>{confidenceLabel(analysis.confidence)}</strong><div className="confidence-bars" aria-label={confidenceLabel(analysis.confidence)}><i className={analysis.confidence === "low" || analysis.confidence === "medium" || analysis.confidence === "high" ? "is-on" : ""} /><i className={analysis.confidence === "medium" || analysis.confidence === "high" ? "is-on" : ""} /><i className={analysis.confidence === "high" ? "is-on" : ""} /></div><small>Un repère, jamais une probabilité de vérité.</small></div>
              </div>
              <div className="result-columns">
                <div className="result-column"><h3><ScanSearch size={16} /> Indices observés</h3><ul>{analysis.visualObservations.map((item, index) => <li key={index}>{item}</li>)}</ul>{analysis.contextFindings.length > 0 && <><h3 className="result-subhead"><Newspaper size={16} /> Contexte recoupé</h3><ul>{analysis.contextFindings.map((item, index) => <li key={index}>{item}</li>)}</ul></>}</div>
                <div className="result-column"><h3><ArrowUpRight size={16} /> Prochaines vérifications</h3><ol>{analysis.nextSteps.map((item, index) => <li key={index}><span>{String(index + 1).padStart(2, "0")}</span>{item}</li>)}</ol>{analysis.limitations.length > 0 && <div className="limits-box"><strong>À garder en tête</strong>{analysis.limitations.map((item, index) => <p key={index}>{item}</p>)}</div>}</div>
              </div>
              <div className="sources-row"><div className="sources-label"><span>SOURCES CONSULTÉES</span><small>{analysis.sources.length} piste{analysis.sources.length > 1 ? "s" : ""} citée{analysis.sources.length > 1 ? "s" : ""}</small></div><div className="source-list">{analysis.sources.length ? analysis.sources.map((source, index) => <a className="source-link" href={source.url} key={`${source.url}-${index}`} target="_blank" rel="noreferrer"><span>{source.title}</span><ExternalLink size={13} /></a>) : <span className="source-empty">Aucune source citée dans cette réponse. Le contexte reste non vérifié.</span>}</div></div>
            </section>
          )}

          <footer className="page-footer"><span>HAMARINO <span className="footer-dot">·</span> PAR URBIX</span><span>ASSISTANCE ÉDITORIALE, JAMAIS VERDICT FINAL.</span><a href="#main" onClick={(event) => { event.preventDefault(); resetForm(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Nouvelle vérification <ArrowUpRight size={13} /></a></footer>
        </div>
      </main>
    </div>
  );
}
