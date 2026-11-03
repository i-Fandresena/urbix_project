"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { MotionConfig, motion, useReducedMotion } from "motion/react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

export function LandingMotion({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.dataset.motionReady = "true";
  }, []);

  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}

export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={[className, "motion-reveal"].filter(Boolean).join(" ")}
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.52, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function RevealArticle({ children, className, delay = 0 }: RevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      className={[className, "motion-reveal"].filter(Boolean).join(" ")}
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.48, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={reduceMotion ? undefined : { y: -3 }}
      whileTap={reduceMotion ? undefined : { scale: 0.995 }}
    >
      {children}
    </motion.article>
  );
}
