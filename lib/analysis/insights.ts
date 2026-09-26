import "server-only";
import type { ProductWithOffers } from "@/lib/types";
import { getProvider } from "@/lib/providers";
import { priceStats, type PriceStats } from "./priceStats";
import { realityCheck, type RealityCheck } from "./fakeDiscount";
import { realPrice, type RealPrice } from "./realPrice";
import { scoreProducts, type ScoreBreakdown } from "./scoring";
import { decideVerdict, type VerdictResult } from "./verdict";

export interface ProductInsight {
  product: ProductWithOffers;
  stats: PriceStats;
  reality: RealityCheck;
  real: RealPrice;
  /** Real price for every offer, cheapest effective first. */
  offerPrices: { offerId: string; real: RealPrice }[];
  complaints: string[];
  pros: string[];
  score?: ScoreBreakdown;
}

export async function insightFor(product: ProductWithOffers): Promise<ProductInsight> {
  const provider = getProvider();
  const [coupons, reviewData] = await Promise.all([provider.getCoupons(), provider.getReviews(product.id)]);
  const offerPrices = product.offers
    .filter((o) => o.inStock)
    .map((o) => ({ offerId: o.id, real: realPrice(o, coupons, product.category) }))
    .sort((a, b) => a.real.effective - b.real.effective);
  const bestId = offerPrices[0]?.offerId ?? product.bestOffer.id;
  const bestOffer = product.offers.find((o) => o.id === bestId) ?? product.bestOffer;
  const history = await provider.getPriceHistory(bestOffer.id);
  const stats = priceStats(history);
  return {
    product: { ...product, bestOffer },
    stats,
    reality: realityCheck(bestOffer.price, bestOffer.mrp, stats),
    real: offerPrices[0]?.real ?? realPrice(bestOffer, coupons, product.category),
    offerPrices,
    complaints: reviewData.complaints,
    pros: reviewData.pros,
  };
}

/** Builds insights for a list and ranks them by composite score. */
export async function rankProducts(products: ProductWithOffers[]): Promise<ProductInsight[]> {
  const insights = await Promise.all(products.map(insightFor));
  const scores = scoreProducts(
    insights.map((i) => ({ product: i.product, stats: i.stats, effectivePrice: i.real.effective, complaints: i.complaints })),
  );
  for (const i of insights) i.score = scores.get(i.product.id);
  return insights.sort((a, b) => (b.score?.total ?? 0) - (a.score?.total ?? 0));
}

/** Finds cheaper-or-better alternatives in the same category/type. */
export async function alternativesFor(product: ProductWithOffers, limit = 6): Promise<ProductWithOffers[]> {
  const provider = getProvider();
  const sim = await provider.findSimilar(
    { type: product.attributes.type, category: product.category, style: product.attributes.style },
    limit + 8,
  );
  return sim.map((s) => s.product).filter((p) => p.id !== product.id && !p.name.startsWith(product.name.split(" – ")[0])).slice(0, limit);
}

export async function verdictFor(insight: ProductInsight): Promise<VerdictResult & { alternative: ProductWithOffers | null }> {
  const alts = await alternativesFor(insight.product, 8);
  const p = insight.product;
  const better =
    alts.find((a) => a.rating >= p.rating + 0.2 && a.bestOffer.price <= p.bestOffer.price * 1.05) ??
    alts.find((a) => a.rating >= p.rating && a.bestOffer.price <= p.bestOffer.price * 0.85) ??
    null;
  const result = decideVerdict({
    price: p.bestOffer.price,
    stats: insight.stats,
    reality: insight.reality,
    rating: p.rating,
    reviewCount: p.reviewCount,
    complaints: insight.complaints,
    couponSaving: insight.real.couponSaving,
    betterAlternative: better ? { id: better.id, name: better.name, price: better.bestOffer.price, rating: better.rating } : null,
  });
  return { ...result, alternative: better };
}
