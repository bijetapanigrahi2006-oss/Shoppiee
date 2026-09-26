import Link from "next/link";
import { Sparkles, CheckCircle2, Clock, XCircle, Tag, TrendingDown } from "lucide-react";
import type { ProductInsight } from "@/lib/analysis/insights";
import { verdictFor } from "@/lib/analysis/insights";
import { explainVerdict } from "@/lib/ai/tasks";
import { inr } from "@/lib/utils";
import { ProductArt } from "./ProductArt";

const STYLE = {
  BUY: { color: "#16a34a", bg: "linear-gradient(135deg,#22c55e,#16a34a)", Icon: CheckCircle2 },
  WAIT: { color: "#d97706", bg: "linear-gradient(135deg,#fbbf24,#f97316)", Icon: Clock },
  AVOID: { color: "#dc2626", bg: "linear-gradient(135deg,#f87171,#dc2626)", Icon: XCircle },
};

/** BUY / WAIT / AVOID with the full "why". The decision is rule-based; Claude explains it. */
export async function VerdictPanel({ insight }: { insight: ProductInsight }) {
  const v = await verdictFor(insight);
  const text = await explainVerdict(insight, v);
  const s = STYLE[v.verdict];
  const p = insight.product;

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-4 p-5 text-white" style={{ background: s.bg }}>
        <s.Icon className="h-12 w-12" />
        <div className="flex-1">
          <p className="text-xs font-bold uppercase tracking-widest opacity-90">Should I buy this?</p>
          <p className="font-display text-4xl font-bold">{v.verdict}</p>
          <p className="text-sm opacity-95">{text.headline}</p>
        </div>
        <span className="chip bg-white/25 text-white">{v.confidence} confidence</span>
      </div>
      <div className="space-y-4 p-5">
        <p className="text-sm">
          {text.ai && <Sparkles className="mr-1 inline h-4 w-4 text-accent" />}
          {text.explanation}
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          <Stat label="Current price" value={inr(p.bestOffer.price)} />
          <Stat label="90-day average" value={inr(insight.stats.avg90)} />
          <Stat label="Lowest recorded" value={inr(insight.stats.lowest)} tone="good" />
          <Stat label="Real price today" value={inr(insight.real.effective)} tone="accent" />
        </div>
        <ul className="space-y-1.5 text-sm">
          {v.reasons.map((r) => (
            <li key={r} className="flex gap-2">
              <span style={{ color: s.color }}>•</span> {r}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2">
          {insight.real.coupon && (
            <span className="chip bg-accent/15 py-1 text-accent">
              <Tag className="h-3.5 w-3.5" /> Coupon {insight.real.coupon.code}: save {inr(insight.real.couponSaving)}
            </span>
          )}
          {v.waitSaving && (
            <span className="chip bg-amber-500/15 py-1 text-warn">
              <TrendingDown className="h-3.5 w-3.5" /> Potential saving by waiting: {inr(v.waitSaving[0])}–{inr(v.waitSaving[1])}
            </span>
          )}
        </div>
        {v.alternative && (
          <Link href={`/product/${v.alternative.id}`} className="flex items-center gap-3 rounded-2xl border border-line p-3 hover:bg-surface-2">
            <ProductArt photo={v.alternative.photo} fit={v.alternative.photoFit} category={v.alternative.category} alt={v.alternative.name} className="h-16 w-16 rounded-xl" />
            <div className="flex-1">
              <p className="text-xs font-bold uppercase text-muted">Better alternative</p>
              <p className="text-sm font-semibold">
                {v.alternative.brand} {v.alternative.name}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold">{inr(v.alternative.bestOffer.price)}</p>
              <p className="text-xs text-muted">{v.alternative.rating}★</p>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "good" | "accent" }) {
  return (
    <div className="rounded-xl bg-surface-2 p-2.5">
      <p className="text-xs text-muted">{label}</p>
      <p className={tone === "good" ? "font-bold text-good" : tone === "accent" ? "font-bold text-accent" : "font-bold"}>{value}</p>
    </div>
  );
}

export function VerdictSkeleton() {
  return (
    <div className="card space-y-3 p-5">
      <div className="skeleton h-20" />
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-4 w-2/3" />
      <p className="text-sm text-muted">Weighing price history, reviews and alternatives…</p>
    </div>
  );
}
