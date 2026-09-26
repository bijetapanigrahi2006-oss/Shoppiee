import Link from "next/link";
import { Sparkles, Trophy, AlertTriangle } from "lucide-react";
import type { ProductInsight } from "@/lib/analysis/insights";
import { heuristicNeed, recommend } from "@/lib/ai/tasks";
import { themeFor } from "@/lib/theme/categories";
import { inr } from "@/lib/utils";
import { ProductArt } from "@/components/product/ProductArt";
import { StoreBadge } from "@/components/product/StoreBadge";
import { AddToCartButton, BuyOnStoreButton } from "@/components/product/ActionButtons";

const MEDALS = ["#1", "#2", "#3"];

/** Top 3 recommendations with a Claude-written "why" (falls back to rule-based text). */
export async function TopPicks({ query, ranked }: { query: string; ranked: ProductInsight[] }) {
  const need = heuristicNeed(query);
  const { rec, ai } = await recommend(need, query, ranked);
  const byId = new Map(ranked.map((r) => [r.product.id, r]));

  return (
    <section className="rounded-[28px] p-1" style={{ background: "var(--brand-gradient)" }}>
      <div className="rounded-[24px] bg-surface p-5">
        <div className="mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-500" />
          <h2 className="font-display text-xl font-semibold">Top 3 picks for “{query}”</h2>
          {ai && (
            <span className="chip ml-auto bg-accent/15 text-accent">
              <Sparkles className="h-3 w-3" /> AI
            </span>
          )}
        </div>
        <p className="mb-4 text-sm text-muted">{rec.intro}</p>
        <div className="grid gap-4 lg:grid-cols-3">
          {rec.picks.slice(0, 3).map((pick, i) => {
            const ins = byId.get(pick.productId);
            if (!ins) return null;
            const p = ins.product;
            const t = themeFor(p.category);
            return (
              <div key={p.id} className="flex flex-col rounded-2xl border-2 p-4" style={{ borderColor: `${t.accent}55`, background: `color-mix(in oklab, ${t.bg} 45%, var(--surface))` }}>
                <div className="flex gap-3">
                  <Link href={`/product/${p.id}`}>
                    <ProductArt photo={p.photo} fit={p.photoFit} category={p.category} alt={p.name} className="h-20 w-20 text-4xl" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <span className="chip text-white" style={{ background: t.accent }}>
                      {MEDALS[i]} {pick.label}
                    </span>
                    <Link href={`/product/${p.id}`} className="mt-1 line-clamp-2 block text-sm font-semibold hover:underline">
                      {p.brand} {p.name}
                    </Link>
                    <p className="text-xs text-muted">
                      {p.rating}★ · score {ins.score?.total}/100
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm">{pick.why}</p>
                <p className="mt-2 flex gap-1.5 text-xs text-warn">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {pick.watchOut}
                </p>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-xl font-bold">{inr(p.bestOffer.price)}</span>
                  <StoreBadge store={p.bestOffer.store} />
                </div>
                {ins.real.effective < p.bestOffer.price && <p className="text-xs text-muted">Real price: {inr(ins.real.effective)} {ins.real.coupon && `with ${ins.real.coupon.code}`}</p>}
                <div className="mt-auto flex flex-wrap gap-2 pt-3">
                  <BuyOnStoreButton store={p.bestOffer.store} url={p.bestOffer.url} small />
                  <AddToCartButton productId={p.id} store={p.bestOffer.store} small className="btn-ghost !bg-surface-2 !text-fg !shadow-none" />
                </div>
              </div>
            );
          })}
        </div>
        {rec.tip && <p className="mt-4 rounded-xl bg-surface-2 px-4 py-2 text-sm"><b>Tip:</b> {rec.tip}</p>}
      </div>
    </section>
  );
}

export function TopPicksSkeleton() {
  return (
    <div className="card space-y-4 p-5">
      <div className="skeleton h-6 w-64" />
      <div className="grid gap-4 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton h-56" />
        ))}
      </div>
      <p className="text-sm text-muted">Reading reviews and comparing price history to pick your top 3…</p>
    </div>
  );
}
