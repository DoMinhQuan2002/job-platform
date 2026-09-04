"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function getCompanyInitials(name: string): string {
  if (!name) return "JP";
  const cleaned = name
    .replace(
      /^(công ty cổ phần|công ty tnhh mtv|công ty tnhh|công ty cp|công ty|tập đoàn|doanh nghiệp|cty|co\.,\s*ltd|ltd\.)\s+/i,
      "",
    )
    .trim();
  const target = cleaned || name;
  const words = target.split(/\s+/).filter(Boolean);
  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }
  return words
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

interface CompanyLogoProps {
  name: string;
  src?: string;
  className?: string;
  fallbackClassName?: string;
  imageClassName?: string;
}

export function CompanyLogo({
  name,
  src,
  className = "size-14 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-2xs",
  fallbackClassName = "bg-blue-50 font-bold text-primary text-xs sm:text-sm",
  imageClassName = "size-full object-contain",
}: CompanyLogoProps) {
  const [failed, setFailed] = useState(false);
  const logoSrc =
    src &&
    (src.startsWith("http://") ||
      src.startsWith("https://") ||
      src.startsWith("/") ||
      src.startsWith("data:image/"))
      ? src
      : undefined;

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden",
        className,
      )}
    >
      {logoSrc && !failed ? (
        <img
          src={logoSrc}
          alt=""
          className={imageClassName}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          aria-hidden="true"
          className={cn(
            "flex size-full items-center justify-center rounded-xl uppercase",
            fallbackClassName,
          )}
        >
          {getCompanyInitials(name)}
        </div>
      )}
    </div>
  );
}
