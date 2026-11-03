"use client";

import { Lottie } from "lottie-react";
import { useReducedMotion } from "motion/react";

export function SignalLottie({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion();

  return (
    <Lottie
      className={className}
      src="/animations/laverta-signal.json"
      autoplay={!reduceMotion}
      loop={false}
      aria-hidden="true"
    />
  );
}
