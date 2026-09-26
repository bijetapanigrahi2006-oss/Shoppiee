import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import { themeFor } from "@/lib/theme/categories";
import { cn, inr } from "@/lib/utils";

/**
 * The "Shop by category" look, reusable: a big rounded tile filled with a real
 * photo under a colour wash, icon badge and title at the bottom, zoom + sheen
 * on hover. The whole tile is a link; `action` sits above it and stays clickable.
 */
export function PhotoTile({
  href,
  title,
  photo,
  fit = "cover",
  gradient,
  accent,
  duotone = false,
  icon,
  eyebrow,
  subtitle,
  meta,
  action,
  className,
}: {
  href: string;
  title: string;
  photo?: string;
  fit?: "cover" | "contain";
  gradient: string;
  accent: string;
  /** Tint the photo into the tile's colours until hover (category-style). */
  duotone?: boolean;
  icon?: React.ReactNode;
  eyebrow?: React.ReactNode;
  subtitle?: React.ReactNode;
  meta?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  // True-colour studio shots need a light backdrop to melt into.
  const background = fit === "contain" && !duotone ? "radial-gradient(circle at 50% 35%, #ffffff 0%, #f3f0f9 70%, #e9e4f3 100%)" : gradient;
  return (
    <div className={cn("tile group", className)} style={{ background, ["--tile-accent" as string]: accent }}>
      {photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="" loading="lazy" className={cn("tile-photo", fit === "contain" && "tile-photo-contain", duotone && "tile-duotone")} />
      )}
      <div
        className="tile-shade"
        style={{
          background: `linear-gradient(to top, ${accent}f5 0%, ${accent}b3 22%, ${accent}40 48%, transparent 72%), linear-gradient(to top, rgb(0 0 0 / 0.28), transparent 45%)`,
        }}
      />
      <Link href={href} className="absolute inset-0 z-[2] rounded-[inherit]" aria-label={title} />
      <span className="tile-arrow" aria-hidden>
        <ArrowUpRight />
      </span>
      <div className="pointer-events-none relative z-[3] p-4 sm:p-5">
        {icon && <span className="tile-icon">{icon}</span>}
        {eyebrow && <div className="mb-0.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white/85">{eyebrow}</div>}
        <p className="line-clamp-2 font-display text-lg font-semibold leading-tight [text-shadow:0_2px_12px_rgb(0_0_0/0.35)] sm:text-xl">{title}</p>
        {subtitle && <div className="mt-0.5 text-xs text-white/90 sm:text-sm">{subtitle}</div>}
        {(meta || action) && (
          <div className="mt-3 flex items-center justify-between gap-2">
            <div className="min-w-0 text-sm text-white/95">{meta}</div>
            {action && <div className="pointer-events-auto relative z-[8] shrink-0">{action}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

export interface TileProduct {
  id: string;
  name: string;
  brand: string;
  photo: string;
  photoFit: "cover" | "contain";
  category: string;
  price: number;
  mrp: number;
  rating: number;
}

/** A product in the same photo-tile style, washed in its category colour. */
export function ProductTile({ p, action, className }: { p: TileProduct; action?: React.ReactNode; className?: string }) {
  const t = themeFor(p.category);
  const off = p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;
  return (
    <PhotoTile
      href={`/product/${p.id}`}
      title={p.name}
      photo={p.photo}
      fit={p.photoFit}
      gradient={t.gradient}
      accent={t.accent}
      className={cn("aspect-[4/5]", className)}
      eyebrow={p.brand}
      meta={
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <b className="font-display text-lg">{inr(p.price)}</b>
          {off >= 5 && <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-bold">{off}% off</span>}
          <span className="inline-flex items-center gap-0.5 text-xs">
            <Star className="h-3 w-3 fill-white" /> {p.rating}
          </span>
        </span>
      }
      action={action}
    />
  );
}
