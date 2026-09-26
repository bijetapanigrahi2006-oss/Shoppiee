import type { PriceStats } from "./priceStats";

export type RealityLevel = "genuine" | "modest" | "inflated";

export interface RealityCheck {
  advertisedDiscountPct: number;
  /** Discount vs. the 30-day average price (negative = today is pricier than usual). */
  realDiscountPct: number;
  vsLowestPct: number; // how far today is above the all-time low (%)
  level: RealityLevel;
  headline: string;
  explanation: string;
}

const pct = (a: number, b: number) => (b ? Math.round(((b - a) / b) * 1000) / 10 : 0);

/**
 * Compares the store's advertised "X% OFF" (price vs. MRP/strike-through) with
 * what the price history actually says.
 */
export function realityCheck(price: number, mrp: number, stats: PriceStats): RealityCheck {
  const advertisedDiscountPct = Math.max(0, Math.round(pct(price, mrp)));
  const realDiscountPct = Math.round(pct(price, stats.avg30) * 10) / 10;
  const vsLowestPct = stats.lowest ? Math.round(((price - stats.lowest) / stats.lowest) * 1000) / 10 : 0;

  let level: RealityLevel;
  if (realDiscountPct >= 7 || stats.percentile <= 10) level = "genuine";
  else if (advertisedDiscountPct - Math.max(0, realDiscountPct) >= 15) level = "inflated";
  else level = "modest";

  const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;
  let headline: string;
  let explanation: string;
  if (level === "genuine") {
    headline = "This is a genuinely good price";
    explanation = `Today's ${fmt(price)} is ${Math.max(0, realDiscountPct)}% below the 30-day average of ${fmt(stats.avg30)}${
      stats.percentile <= 10 ? " and close to the lowest we've tracked" : ""
    }.`;
  } else if (level === "inflated") {
    headline = "The advertised discount is inflated";
    explanation = `The ${advertisedDiscountPct}% discount is calculated from a reference price of ${fmt(mrp)} that the product rarely sells at. Compared with its 30-day average of ${fmt(
      stats.avg30,
    )}, today's price is ${realDiscountPct >= 0 ? `only ${realDiscountPct}% lower` : `${Math.abs(realDiscountPct)}% higher`}. The lowest recorded price was ${fmt(stats.lowest)}.`;
  } else {
    headline = "Fair price, but not a special deal";
    explanation = `Today's price is within the usual range (30-day average ${fmt(stats.avg30)}, lowest ${fmt(stats.lowest)}).`;
  }

  return { advertisedDiscountPct, realDiscountPct, vsLowestPct, level, headline, explanation };
}
