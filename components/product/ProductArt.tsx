"use client";

import { useState } from "react";
import { themeFor } from "@/lib/theme/categories";
import { cn } from "@/lib/utils";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

interface Props {
  photo?: string | null;
  fit?: "cover" | "contain";
  category: string;
  alt?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

/**
 * Real product photo. Studio shots ("contain") sit on a soft light stage;
 * lifestyle photos ("cover") fill the frame. Falls back to a category-coloured
 * placeholder with an icon if the photo can't load.
 */
export function ProductArt({ photo, fit = "cover", category, alt = "", size = "md", className }: Props) {
  const [failed, setFailed] = useState(false);
  const theme = themeFor(category);
  const dims = {
    sm: "h-12 w-12 rounded-xl",
    md: "h-full w-full rounded-2xl",
    lg: "h-64 w-full rounded-3xl",
    xl: "aspect-square w-full rounded-[28px]",
  }[size];

  if (!photo || failed) {
    return (
      <div className={cn("relative grid shrink-0 place-items-center overflow-hidden", dims, className)} style={{ background: theme.gradient }}>
        <CategoryIcon category={category} className={cn("text-white/90 drop-shadow", size === "sm" ? "h-5 w-5" : "h-12 w-12")} />
      </div>
    );
  }

  return (
    <div
      className={cn("relative shrink-0 overflow-hidden", dims, className)}
      style={{ background: fit === "contain" ? `radial-gradient(circle at 50% 40%, #ffffff 0%, var(--img-bg) 70%)` : theme.bg }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className={cn(
          "h-full w-full transition duration-500 group-hover:scale-105",
          fit === "contain" ? "object-contain p-[8%] mix-blend-multiply" : "object-cover",
        )}
      />
      <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-black/5" />
    </div>
  );
}
