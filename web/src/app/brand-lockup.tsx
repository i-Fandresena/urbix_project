"use client";

import Image from "next/image";
import Link from "next/link";

type BrandLockupProps = {
  label: string;
  href?: string;
  inverse?: boolean;
  className?: string;
};

// Les deux logos sont rendus et le CSS montre celui du thème actif : le rendu serveur et
// l’hydratation restent identiques, même quand le cookie de thème est lu après coup.
export function BrandLockup({ label, href = "/", inverse = false, className = "" }: BrandLockupProps) {
  return (
    <Link className={`brand-lockup${className ? ` ${className}` : ""}`} href={href} aria-label={label}>
      {inverse ? (
        <Image className="brand-lockup__image" src="/brand/laverta-logo-on-dark.png" alt="" width={1169} height={264} />
      ) : (
        <>
          <Image className="brand-lockup__image brand-lockup__image--light" src="/brand/laverta-logo.png" alt="" width={1169} height={264} />
          <Image className="brand-lockup__image brand-lockup__image--dark" src="/brand/laverta-logo-on-dark.png" alt="" width={1169} height={264} />
        </>
      )}
    </Link>
  );
}
