import Link from "next/link";
import { Star } from "lucide-react";
import type { StoreId } from "@/lib/types";
import { themeFor } from "@/lib/theme/categories";
import { inr, cn } from "@/lib/utils";
import { ProductArt } from "./ProductArt";
import { StoreBadge } from "./StoreBadge";
import { AddToCartButton, WishButton } from "./ActionButtons";

export interface CardProduct {
  id: string;
  name: string;
  brand: string;
  photo: string;
  photoFit: "cover" | "contain";
  category: string;
  price: number;
  mrp: number;
  store: StoreId;
  rating: number;
  reviewCount?: number;
  storeCount?: number;
}

export function ProductCard({
  p,
  badge,
  score,
  realPrice,
  wished,
  layout = "grid",
  showCart = true,
}: {
  p: CardProduct;
  badge?: string;
  score?: number;
  realPrice?: number;
  wished?: boolean;
  layout?: "grid" | "list";
  showCart?: boolean;
}) {
  const theme = themeFor(p.category);
  const off = p.mrp > p.price ? Math.round(((p.mrp - p.price) / p.mrp) * 100) : 0;

  if (layout === "list") {
    return (
      <Link href={`/product/${p.id}`} className="card card-glow group flex items-center gap-4 p-3">
        <ProductArt photo={p.photo} fit={p.photoFit} category={p.category} alt={p.name} className="h-24 w-24 rounded-xl" />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: theme.accent }}>
            {p.brand}
          </p>
          <h3 className="line-clamp-1 font-semibold">{p.name}</h3>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted">
            <Rating value={p.rating} /> {p.reviewCount != null && <span>({p.reviewCount.toLocaleString("en-IN")})</span>}
            {score != null && <span className="ml-2">Score {score}</span>}
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">{inr(p.price)}</p>
          {off > 0 && <p className="text-xs font-semibold text-good">{off}% off</p>}
          <StoreBadge store={p.store} className="mt-1" />
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/product/${p.id}`} className="card card-glow group relative flex flex-col overflow-hidden">
      <div className="relative aspect-[4/5] overflow-hidden">
        <ProductArt photo={p.photo} fit={p.photoFit} category={p.category} alt={p.name} className="rounded-none" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/35 to-transparent" />
        {badge && (
          <span className="chip absolute left-3 top-3 text-white shadow-lg" style={{ background: theme.gradient }}>
            {badge}
          </span>
        )}
        {!badge && off >= 10 && <span className="chip absolute left-3 top-3 bg-black/70 text-white backdrop-blur">{off}% off</span>}
        <WishButton productId={p.id} initial={wished} className="absolute right-3 top-3" />
        <span className="absolute bottom-3 left-3">
          <Rating value={p.rating} />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: theme.accent }}>
          {p.brand}
        </p>
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{p.name}</h3>
        <div className="mt-1 flex flex-wrap items-baseline gap-x-2">
          <span className="font-display text-xl font-bold">{inr(p.price)}</span>
          {off > 0 && <span className="text-xs text-muted line-through">{inr(p.mrp)}</span>}
        </div>
        {realPrice != null && realPrice < p.price && (
          <p className="text-xs text-muted">
            Real price <b className="text-good">{inr(realPrice)}</b> after offers
          </p>
        )}
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <div className="flex min-w-0 items-center gap-1.5">
            <StoreBadge store={p.store} />
            {p.storeCount && p.storeCount > 1 && <span className="text-[11px] text-muted">+{p.storeCount - 1}</span>}
          </div>
          {showCart && <AddToCartButton productId={p.id} store={p.store} small iconOnly />}
        </div>
        {score != null && (
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-2" title={`Shoppiee score ${score}/100`}>
            <div className="h-full rounded-full" style={{ width: `${score}%`, background: theme.gradient }} />
          </div>
        )}
      </div>
    </Link>
  );
}

function Rating({ value }: { value: number }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-bold text-white", value >= 4 ? "bg-emerald-600" : value >= 3.5 ? "bg-amber-500" : "bg-rose-600")}>
      {value} <Star className="h-3 w-3 fill-white" />
    </span>
  );
}
