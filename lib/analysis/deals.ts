import "server-only";
import { getProvider } from "@/lib/providers";
import type { ProductWithOffers } from "@/lib/types";
import { priceStats } from "./priceStats";
import { realityCheck, type RealityCheck } from "./fakeDiscount";

export interface Deal {
  product: ProductWithOffers;
  reality: RealityCheck;
}

/** Deal scanner: products whose current price is genuinely low vs. their own history. */
export async function scanDeals(opts: { level?: RealityCheck["level"]; limit?: number } = {}): Promise<Deal[]> {
  const provider = getProvider();
  const all = await provider.listProducts();
  const out: Deal[] = [];
  for (const p of all) {
    const hist = await provider.getPriceHistory(p.bestOffer.id);
    const stats = priceStats(hist);
    const reality = realityCheck(p.bestOffer.price, p.bestOffer.mrp, stats);
    if (reality.level === (opts.level ?? "genuine")) out.push({ product: p, reality });
  }
  const key = (d: Deal) => (opts.level === "inflated" ? d.reality.advertisedDiscountPct - d.reality.realDiscountPct : d.reality.realDiscountPct);
  return out.sort((a, b) => key(b) - key(a)).slice(0, opts.limit ?? 12);
}
