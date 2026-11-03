"use client";

import Image from "next/image";
import Link from "next/link";
import { useLavertaPreferences } from "./preferences";

type BrandLockupProps = {
  label: string;
  href?: string;
  inverse?: boolean;
  className?: string;
};

export function BrandLockup({ label, href = "/", inverse = false, className = "" }: BrandLockupProps) {
  const { theme } = useLavertaPreferences();
  const logo = inverse || theme === "dark" ? "/brand/laverta-logo-on-dark.png" : "/brand/laverta-logo.png";
  return (
    <Link className={`brand-lockup${className ? ` ${className}` : ""}`} href={href} aria-label={label}>
      <Image className="brand-lockup__image" src={logo} alt="" width={1169} height={264} />
    </Link>
  );
}
