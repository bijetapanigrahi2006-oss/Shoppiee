import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { priceStats } from "@/lib/analysis/priceStats";
import { realityCheck } from "@/lib/analysis/fakeDiscount";
import { couponSaving, realPrice } from "@/lib/analysis/realPrice";
import { decideVerdict } from "@/lib/analysis/verdict";
import { scoreProducts } from "@/lib/analysis/scoring";
import { detectStore } from "@/lib/stores";
import { extractBudget, mockProvider } from "@/lib/providers/mock";
import type { Coupon, Offer, PricePoint } from "@/lib/types";

const hist = (prices: number[]): PricePoint[] => prices.map((price, i) => ({ date: `2026-01-${String((i % 28) + 1).padStart(2, "0")}`, price }));

describe("priceStats", () => {
  it("computes averages, lowest and percentile", () => {
    const s = priceStats(hist([100, 90, 110, 100, 80, 100]));
    expect(s.current).toBe(100);
    expect(s.lowest).toBe(80);
    expect(s.highest).toBe(110);
    expect(s.percentile).toBe(33); // 2 of 6 points are cheaper
  });
});

describe("realityCheck (fake discount detector)", () => {
  it("flags an inflated discount: big MRP gap but normal price", () => {
    const stats = priceStats(hist(Array(60).fill(68500).concat([69999])));
    const r = realityCheck(69999, 89999, stats);
    expect(r.advertisedDiscountPct).toBe(22);
    expect(r.realDiscountPct).toBeLessThan(1);
    expect(r.level).toBe("inflated");
  });

  it("recognises a genuine deal", () => {
    const stats = priceStats(hist(Array(60).fill(1000).concat([850])));
    const r = realityCheck(850, 1200, stats);
    expect(r.level).toBe("genuine");
  });
});

describe("realPrice", () => {
  const offer: Offer = { id: "p:amazon", productId: "p", store: "amazon", price: 10000, mrp: 12000, inStock: true, shipping: 0, url: "", cashbackPct: 2 };
  const coupons: Coupon[] = [
    { id: "a", store: "amazon", code: "FLAT500", description: "", kind: "flat", value: 500, minOrder: 5000 },
    { id: "b", store: "amazon", code: "PCT10", description: "", kind: "percent", value: 10, minOrder: 0, maxDiscount: 800 },
    { id: "c", store: "flipkart", code: "OTHER", description: "", kind: "flat", value: 5000, minOrder: 0 },
  ];

  it("picks the best applicable coupon for the store and applies cashback", () => {
    const r = realPrice(offer, coupons);
    expect(r.coupon?.code).toBe("PCT10");
    expect(r.couponSaving).toBe(800);
    expect(r.cashback).toBe(184); // 2% of 9200
    expect(r.effective).toBe(9016);
  });

  it("respects min order and category limits", () => {
    expect(couponSaving(coupons[0], 4000)).toBe(0);
    expect(couponSaving({ ...coupons[0], categories: ["beauty"] }, 9000, "laptops")).toBe(0);
  });
});

describe("decideVerdict", () => {
  const base = {
    price: 54999,
    rating: 4.4,
    reviewCount: 5000,
    complaints: [],
    couponSaving: 0,
    betterAlternative: null,
  };

  it("says BUY when price is at its low and reviews are strong", () => {
    const stats = priceStats(hist([...Array(60).fill(60000), 54999]));
    const v = decideVerdict({ ...base, stats, reality: realityCheck(54999, 70000, stats) });
    expect(v.verdict).toBe("BUY");
  });

  it("says WAIT when price is high and it regularly drops", () => {
    const series = [...Array(20).fill(58000), ...Array(5).fill(50000), ...Array(20).fill(58000), ...Array(5).fill(49999), ...Array(20).fill(58000), 60000];
    const stats = priceStats(hist(series));
    const v = decideVerdict({ ...base, price: 60000, stats, reality: realityCheck(60000, 65000, stats) });
    expect(v.verdict).toBe("WAIT");
    expect(v.waitSaving).not.toBeNull();
  });

  it("says AVOID for poor reviews, many complaints and a better alternative", () => {
    const stats = priceStats(hist([...Array(60).fill(50000), 55000]));
    const v = decideVerdict({
      ...base,
      price: 55000,
      rating: 3.2,
      complaints: ["heating", "battery drains fast", "fan noise"],
      stats,
      reality: realityCheck(55000, 80000, stats),
      betterAlternative: { id: "x", name: "Product X", price: 52000, rating: 4.5 },
    });
    expect(v.verdict).toBe("AVOID");
    expect(v.reasons.some((r) => r.includes("Product X"))).toBe(true);
  });
});

describe("scoreProducts", () => {
  it("ranks a cheaper, better-rated product higher", async () => {
    const [a, b] = await mockProvider.search("sunscreen");
    const stats = priceStats(hist([100, 100, 100]));
    const scores = scoreProducts([
      { product: { ...a, rating: 4.6, reviewCount: 10000 }, stats, effectivePrice: 400, complaints: [] },
      { product: { ...b, rating: 3.4, reviewCount: 50 }, stats, effectivePrice: 900, complaints: ["white cast", "caused breakouts"] },
    ]);
    expect(scores.get(a.id)!.total).toBeGreaterThan(scores.get(b.id)!.total);
  });
});

describe("URL parsing", () => {
  it("detects stores from links", () => {
    expect(detectStore("https://www.amazon.in/dp/B09XS7JWHH")).toBe("amazon");
    expect(detectStore("https://amzn.in/d/abc")).toBe("amazon");
    expect(detectStore("https://www.flipkart.com/x/p/itm1")).toBe("flipkart");
    expect(detectStore("https://www.myntra.com/sneakers/nike/123/buy")).toBe("myntra");
    expect(detectStore("not a url")).toBeNull();
  });

  it("maps a product link to the right catalog product", async () => {
    const r = await mockProvider.resolveUrl("https://www.amazon.in/Sony-WH-1000XM5-Wireless-Cancelling-Headphones/dp/B09XS7JWHH");
    expect(r.store).toBe("amazon");
    expect(r.product?.brand).toBe("Sony");
    expect(r.confidence).toBeGreaterThan(0.5);
  });

  it("extracts budgets from natural language", () => {
    expect(extractBudget("best laptop under ₹70,000")).toBe(70000);
    expect(extractBudget("phone under 25k")).toBe(25000);
    expect(extractBudget("sunscreen")).toBeUndefined();
  });
});

describe("mock catalog", () => {
  it("finds sunscreens across multiple stores", async () => {
    const results = await mockProvider.search("sunscreen");
    expect(results.length).toBeGreaterThanOrEqual(5);
    expect(results.every((p) => p.offers.length >= 2)).toBe(true);
  });

  it("returns lookalikes for a sneaker description", async () => {
    const sims = await mockProvider.findSimilar({ type: "sneakers", color: "white", style: "low-top classic" });
    expect(sims[0].similarity).toBeGreaterThanOrEqual(85);
    expect(sims.some((s) => s.product.bestOffer.price < 2000)).toBe(true);
  });
});
