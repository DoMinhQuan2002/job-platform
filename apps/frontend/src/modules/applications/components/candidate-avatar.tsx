"use client";

/* eslint-disable @next/next/no-img-element -- Dynamic avatar URL from Supabase storage */

import { useState } from "react";
import { cn, resolveStorageUrl } from "@/lib/utils";

export function getCandidateInitials(name: string): string {
  if (!name) return "UV";
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(-2)
      .map((word) => word[0])
      .join("")
      .toUpperCase() || "UV"
  );
}

interface CandidateAvatarProps {
  name: string;
  avatarUrl?: string | null;
  className?: string;
  fallbackClassName?: string;
  imageClassName?: string;
}

export function CandidateAvatar({
  name,
  avatarUrl,
  className = "size-10",
  fallbackClassName = "bg-primary/10 text-primary font-bold text-xs",
  imageClassName = "size-full object-cover",
}: CandidateAvatarProps) {
  const [imageError, setImageError] = useState(false);
  const resolvedUrl = resolveStorageUrl(avatarUrl);

  const showImage = Boolean(resolvedUrl) && !imageError;

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border/60 bg-surface",
        className,
      )}
    >
      {showImage ? (
        <img
          src={resolvedUrl}
          alt={name}
          className={imageClassName}
          loading="lazy"
          onError={() => setImageError(true)}
        />
      ) : (
        <span
          aria-hidden="true"
          className={cn(
            "flex size-full items-center justify-center select-none",
            fallbackClassName,
          )}
        >
          {getCandidateInitials(name)}
        </span>
      )}
    </div>
  );
}
