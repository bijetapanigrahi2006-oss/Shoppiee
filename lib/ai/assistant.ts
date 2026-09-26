import "server-only";
import { getProvider } from "@/lib/providers";
import { rankProducts, type ProductInsight } from "@/lib/analysis/insights";
import { recommend, understandNeed, type Need, type Recommendation } from "./tasks";

export interface AssistantResult {
  need: Need;
  ranked: ProductInsight[];
  rec: Recommendation;
  ai: boolean;
  budgetRelaxed: boolean;
}

const num = (v: unknown) => parseFloat(String(v ?? "").replace(/[^\d.]/g, "")) || 0;

/**
 * 0..100 fit between the parsed need and a product: keyword/tag overlap plus
 * spec checks for categories where specs matter (laptops, phones, skincare).
 */
export function needFit(need: Need, i: ProductInsight): number {
  const p = i.product;
  const kws = [...new Set([...need.keywords, ...need.mustHaves, ...need.useCases].map((k) => k.toLowerCase()))].filter((k) => !["budget", "cheap", "premium"].includes(k));
  const hay = `${p.tags.join(" ")} ${Object.values(p.specs).join(" ")} ${p.name}`.toLowerCase();
  const tagFit = kws.length ? kws.filter((k) => k.split(/\s+/).some((w) => w.length > 1 && hay.includes(w))).length / kws.length : 0.5;

  const checks: boolean[] = [];
  const has = (...words: string[]) => kws.some((k) => words.some((w) => k.includes(w)));
  const specs = p.specs;
  if (p.category === "laptops") {
    const ram = num(specs.RAM);
    const gpu = String(specs.GPU ?? "").toLowerCase();
    const battery = num(specs.Battery);
    if (has("gaming", "ai", "ml", "gpu", "cuda", "deep learning")) checks.push(/rtx|gtx/.test(gpu));
    if (has("ai", "ml", "cuda")) checks.push(/rtx 40|rtx 30/.test(gpu));
    if (has("battery")) checks.push(battery >= 8);
    if (has("coding", "ai", "ml") || (need.lifespanYears ?? 0) >= 3) checks.push(ram >= 16);
    if (has("thin", "light", "portable", "travel")) checks.push(num(specs.Weight) <= 1.6);
  } else if (p.category === "mobiles") {
    if (has("battery")) checks.push(num(specs.Battery) >= 5000);
    if (has("camera")) checks.push(p.tags.includes("camera"));
  } else if (p.category === "beauty") {
    for (const skin of ["oily", "dry", "sensitive"]) if (has(skin)) checks.push(String(specs["Skin type"] ?? "").toLowerCase().includes(skin) || String(specs["Skin type"]) === "All");
  }
  const specFit = checks.length ? checks.filter(Boolean).length / checks.length : tagFit;
  const qualityFloor = p.rating >= 4 ? 1 : p.rating >= 3.7 ? 0.8 : 0.5;
  return Math.round((tagFit * 0.4 + specFit * 0.6) * 100 * qualityFloor);
}

/**
 * The "shops with you" pipeline:
 * understand → search stores → compare specs/reviews/history/coupons → rank → explain.
 */
export async function runAssistant(text: string): Promise<AssistantResult> {
  const provider = getProvider();
  const { need, ai: aiNeed } = await understandNeed(text);

  let pool = await provider.listProducts({ category: need.category });
  const type = need.productType.toLowerCase().replace(/s$/, "");
  const typed = pool.filter((p) => p.attributes.type.includes(type) || p.name.toLowerCase().includes(type));
  if (typed.length >= 2) pool = typed;
  if (pool.length < 2) pool = await provider.search(need.searchQuery);

  let budgetRelaxed = false;
  if (need.budget) {
    // Allow ~8% stretch since coupons/cashback often bring it within budget.
    const within = pool.filter((p) => p.bestOffer.price <= need.budget! * 1.08);
    if (within.length >= 2) pool = within;
    else budgetRelaxed = true;
  }

  const ranked = await rankProducts(pool);

  // Blend the generic score with how well each product fits the stated needs.
  for (const i of ranked) {
    if (!i.score) continue;
    const fit = needFit(need, i);
    i.score.total = Math.round(i.score.total * 0.6 + fit * 0.4);
    if (need.budget && i.real.effective > need.budget) i.score.total -= 8;
  }
  ranked.sort((a, b) => (b.score?.total ?? 0) - (a.score?.total ?? 0));

  const { rec, ai: aiRec } = await recommend(need, text, ranked);
  return { need, ranked, rec, ai: aiNeed || aiRec, budgetRelaxed };
}
