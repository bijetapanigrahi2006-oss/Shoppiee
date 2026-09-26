import type { PriceStats } from "./priceStats";
import type { RealityCheck } from "./fakeDiscount";

export type Verdict = "BUY" | "WAIT" | "AVOID";

export interface VerdictSignals {
  price: number;
  stats: PriceStats;
  reality: RealityCheck;
  rating: number;
  reviewCount: number;
  complaints: string[];
  couponSaving: number;
  betterAlternative: { name: string; price: number; rating: number; id: string } | null;
}

export interface VerdictResult {
  verdict: Verdict;
  reasons: string[];
  /** Estimated saving range if the user waits for the next typical dip. */
  waitSaving: [number, number] | null;
  confidence: "low" | "medium" | "high";
}

const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/**
 * Rule-based verdict. The AI layer only *explains* this; the decision is
 * transparent and reproducible.
 */
export function decideVerdict(s: VerdictSignals): VerdictResult {
  const reasons: string[] = [];
  let buy = 0;
  let wait = 0;
  let avoid = 0;

  // Price position
  if (s.stats.percentile <= 15) {
    buy += 2;
    reasons.push(`Price is near its lowest (${s.stats.percentile}th percentile of the last 180 days).`);
  } else if (s.stats.percentile >= 70) {
    wait += 2;
    reasons.push(`Price is on the high side (${s.stats.percentile}th percentile of the last 180 days).`);
  } else {
    reasons.push(`Price is in its normal range (90-day average ${fmt(s.stats.avg90)}).`);
  }

  // Discount honesty
  if (s.reality.level === "inflated") {
    avoid += 1;
    wait += 1;
    reasons.push(`Advertised ${s.reality.advertisedDiscountPct}% off is inflated; the real discount vs. the 30-day average is ~${Math.max(0, s.reality.realDiscountPct)}%.`);
  } else if (s.reality.level === "genuine") {
    buy += 1;
  }

  // Drop pattern
  let waitSaving: [number, number] | null = null;
  if (s.stats.dipCount >= 2 && s.stats.typicalDipPrice && s.stats.typicalDipPrice < s.price) {
    const lo = Math.round((s.price - s.stats.typicalDipPrice) * 0.6);
    const hi = s.price - s.stats.lowest;
    if (hi > s.price * 0.03) {
      wait += 1;
      waitSaving = [Math.max(0, Math.min(lo, hi)), Math.max(lo, hi)];
      reasons.push(`It has dropped ${s.stats.dipCount} times in 6 months; waiting could save ${fmt(waitSaving[0])}–${fmt(waitSaving[1])}.`);
    }
  }

  // Quality
  if (s.rating >= 4.3 && s.reviewCount > 500) {
    buy += 2;
    reasons.push(`Strong reviews: ${s.rating}★ from ${s.reviewCount.toLocaleString("en-IN")} ratings.`);
  } else if (s.rating < 3.6) {
    avoid += 2;
    reasons.push(`Weak reviews: ${s.rating}★.`);
  } else {
    buy += 1;
  }
  if (s.complaints.length >= 3) {
    avoid += 1;
    reasons.push(`Frequent complaints: ${s.complaints.join(", ")}.`);
  } else if (s.complaints.length) {
    reasons.push(`Common complaints: ${s.complaints.join(", ")}.`);
  }

  if (s.couponSaving > 0) {
    buy += 1;
    reasons.push(`A coupon can save you ${fmt(s.couponSaving)} today.`);
  }

  if (s.betterAlternative) {
    avoid += 1;
    reasons.push(`Better alternative: ${s.betterAlternative.name} at ${fmt(s.betterAlternative.price)} (${s.betterAlternative.rating}★).`);
  }

  let verdict: Verdict;
  if (avoid >= 3 && avoid >= buy) verdict = "AVOID";
  else if (wait >= 2 && wait >= buy - 1) verdict = "WAIT";
  else if (buy >= wait + avoid) verdict = "BUY";
  else verdict = "WAIT";

  const margin = Math.abs(buy - Math.max(wait, avoid));
  const confidence = margin >= 3 ? "high" : margin >= 1 ? "medium" : "low";
  return { verdict, reasons, waitSaving, confidence };
}
