"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { MotionConfig, motion } from "motion/react";

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

// Mêmes valeurs au rendu serveur et dans le navigateur : sinon l’hydratation laisse le contenu invisible
// quand l’appareil demande moins d’animations. MotionConfig reducedMotion="user" retire alors les déplacements.
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  return (
    <motion.div
      className={[className, "motion-reveal"].filter(Boolean).join(" ")}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.52, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function RevealArticle({ children, className, delay = 0 }: RevealProps) {
  return (
    <motion.article
      className={[className, "motion-reveal"].filter(Boolean).join(" ")}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.18 }}
      transition={{ duration: 0.48, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.995 }}
    >
      {children}
    </motion.article>
  );
}
