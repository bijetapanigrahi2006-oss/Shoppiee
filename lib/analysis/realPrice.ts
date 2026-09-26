import type { CategoryId, Coupon, Offer } from "@/lib/types";

export interface RealPrice {
  listed: number;
  shipping: number;
  coupon: Coupon | null;
  couponSaving: number;
  cashback: number;
  effective: number;
}

export function couponSaving(c: Coupon, amount: number, category?: CategoryId): number {
  if (amount < c.minOrder) return 0;
  if (c.categories && category && !c.categories.includes(category)) return 0;
  const raw = c.kind === "flat" ? c.value : (amount * c.value) / 100;
  return Math.round(Math.min(raw, c.maxDiscount ?? Infinity));
}

/** Effective price after the best applicable coupon, shipping and cashback. */
export function realPrice(offer: Offer, coupons: Coupon[], category?: CategoryId): RealPrice {
  const applicable = coupons.filter((c) => c.store === offer.store);
  let best: Coupon | null = null;
  let bestSaving = 0;
  for (const c of applicable) {
    const s = couponSaving(c, offer.price, category);
    if (s > bestSaving) {
      bestSaving = s;
      best = c;
    }
  }
  const afterCoupon = offer.price - bestSaving;
  const cashback = Math.round((afterCoupon * offer.cashbackPct) / 100);
  return {
    listed: offer.price,
    shipping: offer.shipping,
    coupon: best,
    couponSaving: bestSaving,
    cashback,
    effective: Math.max(0, afterCoupon + offer.shipping - cashback),
  };
}
