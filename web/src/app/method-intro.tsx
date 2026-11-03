"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Layers, Megaphone, Scale, ScanEye, type LucideIcon } from "lucide-react";
import type { MessageKey } from "@/lib/i18n/messages";
import { useLavertaPreferences } from "./preferences";

const STEPS: { key: MessageKey; icon: LucideIcon }[] = [
  { key: "landing.stepSpot", icon: ScanEye },
  { key: "landing.stepCrosscheck", icon: Layers },
  { key: "landing.stepQualify", icon: Scale },
  { key: "landing.stepCirculate", icon: Megaphone },
];
const STEP_MS = 1300;
const END_HOLD_MS = 1600;
const SEEN_KEY = "laverta-intro-vue";

// Jauge : arc de 220° au-dessus du cadran, un secteur par étape.
const CX = 160;
const CY = 196;
const R_IN = 100;
const R_OUT = 150;
const R_PROGRESS = 91;
const AVATAR_R = 40;
const ARC_START = -200;
const ARC_SPAN = 220;
const GAP = 6;
const SECTOR = ARC_SPAN / STEPS.length;

function polar(radius: number, degrees: number) {
  const angle = (degrees * Math.PI) / 180;
  return [CX + radius * Math.cos(angle), CY + radius * Math.sin(angle)] as const;
}

function arcPath(radius: number, start: number, end: number) {
  const [x1, y1] = polar(radius, start);
  const [x2, y2] = polar(radius, end);
  return `M ${x1} ${y1} A ${radius} ${radius} 0 ${end - start > 180 ? 1 : 0} 1 ${x2} ${y2}`;
}

function sectorPath(start: number, end: number) {
  const [x3, y3] = polar(R_IN, end);
  const [x4, y4] = polar(R_IN, start);
  return `${arcPath(R_OUT, start, end)} L ${x3} ${y3} A ${R_IN} ${R_IN} 0 0 0 ${x4} ${y4} Z`;
}

function midAngle(index: number) {
  return ARC_START + SECTOR * index + SECTOR / 2;
}

const BRAND_ARC = arcPath(164, -160, -20);
const PROGRESS_ARC = arcPath(R_PROGRESS, ARC_START, ARC_START + ARC_SPAN);
// Graduations tous les 10°, plus une graduation marquée au centre de chaque étape.
const MINOR_TICKS = Array.from({ length: ARC_SPAN / 10 + 1 }, (_, index) => {
  const angle = ARC_START + index * 10;
  const [x1, y1] = polar(68, angle);
  const [x2, y2] = polar(74, angle);
  return { x1, y1, x2, y2 };
});
const MAJOR_TICKS = STEPS.map((_, index) => {
  const [x1, y1] = polar(62, midAngle(index));
  const [x2, y2] = polar(76, midAngle(index));
  return { x1, y1, x2, y2 };
});

function readShouldPlay() {
  try {
    return window.sessionStorage.getItem(SEEN_KEY) !== "1";
  } catch {
    return false;
  }
}

const noSubscription = () => () => {};

// Présente les quatre étapes une fois par session ; « Passer » ou Échap la ferment.
export function MethodIntro() {
  const { t, locale } = useLavertaPreferences();
  const reduceMotion = useReducedMotion();
  // Lu dans le navigateur seulement : le rendu serveur n’affiche jamais l’intro.
  const shouldPlay = useSyncExternalStore(noSubscription, readShouldPlay, () => false);
  const [closed, setClosed] = useState(false);
  const [step, setStep] = useState(0);
  const skipRef = useRef<HTMLButtonElement>(null);
  const open = shouldPlay && !closed && !reduceMotion;

  const close = useCallback(() => {
    try {
      window.sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      // Sans stockage de session, l’intro se ferme seulement pour cette page.
    }
    setClosed(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const last = step === STEPS.length - 1;
    const timer = window.setTimeout(() => (last ? close() : setStep(step + 1)), last ? END_HOLD_MS : STEP_MS);
    return () => window.clearTimeout(timer);
  }, [open, step, close]);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    skipRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "Tab") {
        event.preventDefault();
        skipRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [open, close]);

  const label = t(STEPS[step].key);
  const title = label.charAt(0) + label.slice(1).toLocaleLowerCase(locale);
  const progress = (midAngle(step) - ARC_START) / ARC_SPAN;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="method-intro"
          role="dialog"
          aria-modal="true"
          aria-label={t("landing.ribbonAria")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div className="method-intro__stage">
            <motion.svg
              className="method-intro__gauge"
              viewBox="0 0 320 300"
              aria-hidden="true"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            >
              <defs>
                <path id="method-intro-arc" d={BRAND_ARC} />
                <linearGradient id="method-intro-active" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8ef0fb" />
                  <stop offset="100%" stopColor="#36c6e6" />
                </linearGradient>
                <linearGradient id="method-intro-done" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#d7e4ff" />
                </linearGradient>
                <radialGradient id="method-intro-dial" cx="50%" cy="38%" r="70%">
                  <stop offset="0%" stopColor="#14295e" />
                  <stop offset="100%" stopColor="#060f29" />
                </radialGradient>
                <clipPath id="method-intro-avatar"><circle cx={CX} cy={CY} r={AVATAR_R} /></clipPath>
              </defs>

              <text className="method-intro__brand">
                <textPath href="#method-intro-arc" startOffset="50%" textAnchor="middle">LAVERTA</textPath>
              </text>

              {STEPS.map(({ key, icon: Icon }, index) => {
                const start = ARC_START + SECTOR * index + GAP / 2;
                const state = index < step ? "done" : index === step ? "active" : "pending";
                const [iconX, iconY] = polar(130, midAngle(index));
                const [numberX, numberY] = polar(108, midAngle(index));
                return (
                  <motion.g
                    key={key}
                    className={`method-intro__sector method-intro__sector--${state}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: state === "active" ? 1.06 : 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: step === 0 ? 0.15 + index * 0.07 : 0 }}
                  >
                    <path className="method-intro__shape" d={sectorPath(start, start + SECTOR - GAP)} />
                    <Icon x={iconX - 14} y={iconY - 14} width={28} height={28} strokeWidth={2.2} />
                    <text className="method-intro__sector-number" x={numberX} y={numberY + 3.5} textAnchor="middle">{String(index + 1).padStart(2, "0")}</text>
                  </motion.g>
                );
              })}

              <circle className="method-intro__dial" cx={CX} cy={CY} r={84} />
              <path className="method-intro__track" d={PROGRESS_ARC} />
              <motion.path
                className="method-intro__progress"
                d={PROGRESS_ARC}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: progress }}
                transition={{ type: "spring", stiffness: 90, damping: 18 }}
              />
              {MINOR_TICKS.map((tick, index) => <line className="method-intro__tick" key={`minor-${index}`} {...tick} />)}
              {MAJOR_TICKS.map((tick, index) => (
                <line className={`method-intro__tick method-intro__tick--major${index <= step ? " is-reached" : ""}`} key={`major-${index}`} {...tick} />
              ))}

              <motion.g initial={{ rotate: ARC_START }} animate={{ rotate: midAngle(step) }} transition={{ type: "spring", stiffness: 120, damping: 14 }}>
                {/* Cercle invisible : centre la rotation de l’aiguille sur le cadran. */}
                <circle cx={CX} cy={CY} r={66} fill="none" />
                <path className="method-intro__needle" d={`M ${CX + 66} ${CY} L ${CX + 30} ${CY - 5} L ${CX + 30} ${CY + 5} Z`} />
              </motion.g>
              {/* Le robot Laverta au centre du cadran, par-dessus le pivot de l’aiguille. */}
              <circle className="method-intro__avatar-ring" cx={CX} cy={CY} r={AVATAR_R + 3} />
              <motion.image
                key={step}
                href="/brand/laverta-mascot.webp"
                x={CX - AVATAR_R}
                y={CY - AVATAR_R}
                width={AVATAR_R * 2}
                height={AVATAR_R * 2}
                preserveAspectRatio="xMidYMid slice"
                clipPath="url(#method-intro-avatar)"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 320, damping: 14 }}
              />
              <text className="method-intro__count" x={CX} y={CY + 64} textAnchor="middle">
                {String(step + 1).padStart(2, "0")}<tspan className="method-intro__count-total"> / {String(STEPS.length).padStart(2, "0")}</tspan>
              </text>
            </motion.svg>

            <div className="method-intro__caption" aria-live="polite">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="method-intro__step">{title}</p>
              </motion.div>
            </div>
            <p className="method-intro__slogan">{t("landing.titleA")} <em>{t("landing.titleB")}</em></p>
          </div>
          <button ref={skipRef} className="method-intro__skip" type="button" onClick={close}>{t("intro.skip")}</button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
