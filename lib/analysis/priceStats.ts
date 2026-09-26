import type { PricePoint } from "@/lib/types";

export interface PriceStats {
  current: number;
  avg30: number;
  avg90: number;
  lowest: number;
  lowestDate: string;
  highest: number;
  /** 0 = cheapest ever seen, 100 = most expensive ever seen (over the window). */
  percentile: number;
  /** How many distinct dips ≥7% below the 90-day average occurred. */
  dipCount: number;
  /** Typical depth (₹) of those dips vs. the current price. */
  typicalDipPrice: number | null;
  trend7d: number; // % change over last 7 days
}

const mean = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

export function priceStats(history: PricePoint[]): PriceStats {
  if (!history.length) {
    return { current: 0, avg30: 0, avg90: 0, lowest: 0, lowestDate: "", highest: 0, percentile: 50, dipCount: 0, typicalDipPrice: null, trend7d: 0 };
  }
  const prices = history.map((h) => h.price);
  const current = prices[prices.length - 1];
  const last = (n: number) => prices.slice(-n);
  const avg30 = Math.round(mean(last(30)));
  const avg90 = Math.round(mean(last(90)));
  let lowest = Infinity;
  let lowestDate = "";
  for (const h of history) {
    if (h.price < lowest) {
      lowest = h.price;
      lowestDate = h.date;
    }
  }
  const highest = Math.max(...prices);
  const below = prices.filter((p) => p < current).length;
  const percentile = Math.round((below / prices.length) * 100);

  // Count dip "episodes" in the last 180 days.
  const threshold = avg90 * 0.93;
  let dipCount = 0;
  let inDip = false;
  const dipPrices: number[] = [];
  for (const p of prices) {
    if (p <= threshold && !inDip) {
      dipCount++;
      inDip = true;
    }
    if (p <= threshold) dipPrices.push(p);
    if (p > threshold) inDip = false;
  }
  const typicalDipPrice = dipPrices.length ? Math.round(mean(dipPrices)) : null;
  const weekAgo = prices[Math.max(0, prices.length - 8)];
  const trend7d = weekAgo ? Math.round(((current - weekAgo) / weekAgo) * 1000) / 10 : 0;

  return { current, avg30, avg90, lowest, lowestDate, highest, percentile, dipCount, typicalDipPrice, trend7d };
}
