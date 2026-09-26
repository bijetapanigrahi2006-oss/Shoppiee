import type { ProductWithOffers } from "@/lib/types";
import type { PriceStats } from "./priceStats";

export interface ScoreInput {
  product: ProductWithOffers;
  stats: PriceStats; // for the best offer
  effectivePrice: number;
  complaints: string[];
}

export interface ScoreBreakdown {
  total: number; // 0..100
  value: number; // cheap relative to peers in this result set
  quality: number; // rating
  confidence: number; // review volume
  timing: number; // price vs. its own history
  reliability: number; // complaint severity
}

const SEVERE = ["heating", "battery", "breaks", "damaged", "breakouts", "connectivity", "wobbly", "not fresh", "glue", "fades"];

/**
 * Scores products within a result set so "Top 3" picks balance price,
 * quality, review confidence, price-history timing and complaints.
 */
export function scoreProducts(items: ScoreInput[]): Map<string, ScoreBreakdown> {
  const out = new Map<string, ScoreBreakdown>();
  if (!items.length) return out;
  const prices = items.map((i) => i.effectivePrice);
  const minP = Math.min(...prices);
  const maxP = Math.max(...prices);
  for (const i of items) {
    const value = maxP === minP ? 70 : 100 - ((i.effectivePrice - minP) / (maxP - minP)) * 100;
    const quality = Math.max(0, Math.min(100, ((i.product.rating - 3) / 1.8) * 100));
    const confidence = Math.min(100, (Math.log10(Math.max(10, i.product.reviewCount)) / 4.3) * 100);
    const timing = 100 - i.stats.percentile;
    const severeHits = i.complaints.filter((c) => SEVERE.some((s) => c.includes(s))).length;
    const reliability = Math.max(0, 100 - severeHits * 25 - (i.complaints.length - severeHits) * 8);
    const total = Math.round(value * 0.28 + quality * 0.3 + confidence * 0.12 + timing * 0.15 + reliability * 0.15);
    out.set(i.product.id, {
      total,
      value: Math.round(value),
      quality: Math.round(quality),
      confidence: Math.round(confidence),
      timing: Math.round(timing),
      reliability: Math.round(reliability),
    });
  }
  return out;
}
