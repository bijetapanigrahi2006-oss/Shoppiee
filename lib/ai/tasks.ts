import "server-only";
import { z } from "zod";
import { askStructured } from "./claude";
import { extractBudget } from "@/lib/providers/mock";
import type { CategoryId } from "@/lib/types";
import type { ProductInsight } from "@/lib/analysis/insights";
import type { VerdictResult } from "@/lib/analysis/verdict";

const CATEGORIES = ["grocery", "snacks", "fashion", "beauty", "electronics", "laptops", "mobiles", "jewellery", "home", "sports", "books", "toys", "footwear"] as const;

const fmt = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

// ───────────── 1. Understand a free-text need ─────────────
export const NeedSchema = z.object({
  category: z.enum(CATEGORIES),
  productType: z.string().describe("Short product noun, e.g. 'laptop', 'sunscreen', 'dress'"),
  searchQuery: z.string().describe("A concise keyword search for this need"),
  budget: z.number().nullable().describe("Max budget in INR, null if not stated"),
  useCases: z.array(z.string()),
  mustHaves: z.array(z.string()),
  niceToHaves: z.array(z.string()),
  dealBreakers: z.array(z.string()),
  lifespanYears: z.number().nullable(),
  keywords: z.array(z.string()).describe("Lowercase tags to match catalog tags, e.g. gaming, battery, ai, ml, coding, oily skin"),
  summary: z.string().describe("One sentence restating what the shopper needs"),
});
export type Need = z.infer<typeof NeedSchema>;

const KEYWORD_CATEGORY: [RegExp, CategoryId][] = [
  [/laptop|macbook|notebook/, "laptops"],
  [/phone|mobile|iphone|smartphone/, "mobiles"],
  [/headphone|earbud|speaker|tv|watch.*smart|smartwatch|power ?bank/, "electronics"],
  [/sunscreen|serum|moistur|lipstick|lip ?balm|lip gloss|foundation|concealer|mascara|eyeliner|kajal|blush|highlighter|nail polish|primer|face ?wash|cleanser|perfume|fragrance|skincare|makeup|spf/, "beauty"],
  [/dress|kurti|kurta|lehenga|saree|sari|anarkali|sharara|salwar|sherwani|gown|skirt|jumpsuit|co-?ord|blazer|hoodie|chinos|cargo|shirt|jeans|jacket|bag|sunglass|t-?shirt|top/, "fashion"],
  [/sneaker|shoe|heels|sandal|jutti|mojari|footwear/, "footwear"],
  [/ring|necklace|choker|earring|jhumka|anklet|bracelet|bangle|kada|mangalsutra|nose pin|maang tikka|chain|jewel|gold|silver|watch/, "jewellery"],
  [/cookie|biscuit|cake|chips|kurkure|lays|namkeen|bhujia|chocolate|snack|cereal|oats|peanut butter|ketchup|juice|cola|soft drink|almond/, "snacks"],
  [/sofa|mattress|table|chair|lamp|cookware|fryer|mixer|bedsheet|furniture/, "home"],
  [/fruit|vegetable|veggie|milk|rice|atta|dal|grocery|butter|oil|tea/, "grocery"],
  [/bat|yoga|dumbbell|racquet|football|cycle|gym/, "sports"],
  [/book|novel/, "books"],
  [/toy|lego|teddy|board game/, "toys"],
];

export function heuristicNeed(text: string): Need {
  const t = text.toLowerCase();
  const category = KEYWORD_CATEGORY.find(([re]) => re.test(t))?.[1] ?? "electronics";
  const budgetMatch = extractBudget(t) ?? (() => {
    const m = t.match(/(?:₹|rs\.?\s?|inr\s?)([\d,.]+)\s*(k)?|([\d,.]+)\s*k\b/);
    if (!m) return undefined;
    const n = parseFloat((m[1] ?? m[3]).replace(/,/g, ""));
    return m[2] || m[3] ? n * 1000 : n;
  })();
  const vocab = ["gaming", "battery", "ai", "ml", "coding", "college", "camera", "oily", "dry", "sensitive", "party", "office", "travel", "anc", "wireless", "running", "gift", "thin", "light", "gpu", "5g", "floral", "white"];
  const keywords = vocab.filter((v) => new RegExp(`\\b${v}\\b`).test(t) || (v === "ai" && /machine learning|deep learning/.test(t)));
  const typeWord = t.match(/laptop|phone|headphones?|earbuds?|sunscreen|serum|lip ?balm|lipstick|foundation|mascara|kajal|perfume|lehenga|saree|kurti|anarkali|dress|gown|kurta|top|sneakers?|shoes?|watch|anklet|bracelet|choker|earrings?|ring|chips|cookies|biscuits|cake|chocolate|sofa|mattress|chair|jeans|shirt/)?.[0] ?? category;
  const years = t.match(/(\d+)\s*years?/);
  return {
    category,
    productType: typeWord,
    searchQuery: typeWord,
    budget: budgetMatch ?? null,
    useCases: keywords,
    mustHaves: [],
    niceToHaves: [],
    dealBreakers: [],
    lifespanYears: years ? parseInt(years[1], 10) : null,
    keywords,
    summary: `Looking for a ${typeWord}${budgetMatch ? ` under ${fmt(budgetMatch)}` : ""}${keywords.length ? ` for ${keywords.join(", ")}` : ""}.`,
  };
}

export async function understandNeed(text: string): Promise<{ need: Need; ai: boolean }> {
  const need = await askStructured({
    system:
      "You are Shoppiee, an Indian shopping assistant. Turn the shopper's message into structured requirements. Prices are in INR; '70k' means 70000. Pick the single best category. Keywords should be short lowercase tags (e.g. gaming, battery, ai, ml, coding, college, gpu, oily skin, party).",
    content: text,
    schema: NeedSchema,
    effort: "low",
  });
  return need ? { need, ai: true } : { need: heuristicNeed(text), ai: false };
}

// ───────────── 2. Recommend + explain tradeoffs ─────────────
const RecommendationSchema = z.object({
  intro: z.string().describe("2-3 sentences addressing the shopper directly"),
  picks: z
    .array(
      z.object({
        productId: z.string(),
        label: z.string().describe("e.g. 'Best overall', 'Best value', 'Best for gaming'"),
        why: z.string().describe("1-2 sentences why this fits THIS shopper's needs"),
        watchOut: z.string().describe("The main tradeoff or complaint to be aware of"),
      }),
    )
    .describe("Exactly the top 3 picks, best first"),
  tradeoffs: z.array(z.string()).describe("3-5 bullet points comparing the picks"),
  tip: z.string().describe("One money-saving or timing tip based on price history / coupons"),
});
export type Recommendation = z.infer<typeof RecommendationSchema>;

function candidateBrief(i: ProductInsight): string {
  const p = i.product;
  return [
    `id=${p.id}`,
    `name=${p.brand} ${p.name}`,
    `rating=${p.rating} (${p.reviewCount} reviews)`,
    `best=${fmt(i.product.bestOffer.price)} at ${i.product.bestOffer.store}`,
    `realPriceAfterCoupons=${fmt(i.real.effective)}`,
    `30dAvg=${fmt(i.stats.avg30)} lowest=${fmt(i.stats.lowest)} percentile=${i.stats.percentile}`,
    `discountReality=${i.reality.level}`,
    `specs=${Object.entries(p.specs).map(([k, v]) => `${k}: ${v}`).join("; ")}`,
    `tags=${p.tags.join(",")}`,
    `pros=${i.pros.join("; ")}`,
    `complaints=${i.complaints.join("; ")}`,
    `score=${i.score?.total ?? "?"}`,
  ].join(" | ");
}

export function heuristicRecommendation(needSummary: string, ranked: ProductInsight[]): Recommendation {
  const top = ranked.slice(0, 3);
  const labels = ["Best overall", "Runner-up", "Great alternative"];
  const cheapest = [...top].sort((a, b) => a.real.effective - b.real.effective)[0];
  return {
    intro: `${needSummary} I compared ${ranked.length} options across stores on price, price history, ratings and common complaints. Here are my top picks.`,
    picks: top.map((i, idx) => ({
      productId: i.product.id,
      label: i === cheapest && idx > 0 ? "Best value" : labels[idx],
      why: `${i.product.rating}★ from ${i.product.reviewCount.toLocaleString("en-IN")} reviews; real price ${fmt(i.real.effective)} at ${i.product.bestOffer.store}${i.pros[0] ? `. Buyers love: ${i.pros[0].toLowerCase()}` : ""}.`,
      watchOut: i.complaints.length ? `Some buyers mention ${i.complaints.join(", ")}.` : "No recurring complaints.",
    })),
    tradeoffs: top.map((i) => `${i.product.brand} ${i.product.name.split(" (")[0]}: score ${i.score?.total ?? "-"}/100, ${i.reality.level === "inflated" ? "discount looks inflated" : "fair pricing"}.`),
    tip:
      top.find((i) => i.stats.percentile > 60)
        ? `Prices for some picks are above their usual range — consider setting a price alert.`
        : `Prices are currently near normal or below; apply the listed coupons for extra savings.`,
  };
}

export async function recommend(need: Need, userText: string, ranked: ProductInsight[]): Promise<{ rec: Recommendation; ai: boolean }> {
  const candidates = ranked.slice(0, 10);
  if (!candidates.length) return { rec: heuristicRecommendation(need.summary, ranked), ai: false };
  const rec = await askStructured({
    system:
      "You are Shoppiee, an honest Indian shopping assistant that shops WITH the user. Choose the top 3 from the candidates for this shopper's stated needs (not just the highest score). Use only the facts given — never invent specs or prices. Mention complaints honestly. Use ₹ and Indian number formatting. Only use productIds from the candidate list.",
    content: `Shopper said: "${userText}"\n\nParsed needs: ${JSON.stringify(need)}\n\nCandidates (already filtered from multiple stores):\n${candidates.map(candidateBrief).join("\n")}`,
    schema: RecommendationSchema,
    effort: "medium",
  });
  const valid = rec && rec.picks.every((p) => candidates.some((c) => c.product.id === p.productId));
  return valid ? { rec: rec!, ai: true } : { rec: heuristicRecommendation(need.summary, ranked), ai: false };
}

// ───────────── 3. Explain a Should-I-Buy verdict ─────────────
const VerdictExplainSchema = z.object({
  headline: z.string().describe("One punchy line, max 12 words"),
  explanation: z.string().describe("2-4 sentences explaining the verdict using the provided numbers"),
});

export async function explainVerdict(insight: ProductInsight, v: VerdictResult): Promise<{ headline: string; explanation: string; ai: boolean }> {
  const fallback = {
    headline: v.verdict === "BUY" ? "Good time to buy" : v.verdict === "WAIT" ? "Hold on — it's likely to get cheaper" : "Skip this one",
    explanation: v.reasons.slice(0, 3).join(" "),
  };
  const out = await askStructured({
    system:
      "You explain a shopping verdict (BUY / WAIT / AVOID) that has ALREADY been decided by rules. Do not change the verdict. Be concrete, cite the numbers, be friendly and honest. Use ₹.",
    content: `Verdict: ${v.verdict} (confidence ${v.confidence})\nProduct: ${candidateBrief(insight)}\nReasons:\n- ${v.reasons.join("\n- ")}`,
    schema: VerdictExplainSchema,
    effort: "low",
  });
  return out ? { ...out, ai: true } : { ...fallback, ai: false };
}

// ───────────── 4. Screenshot → product ─────────────
export const VisionSchema = z.object({
  items: z
    .array(
      z.object({
        label: z.string().describe("Human label, e.g. 'White low-top sneakers'"),
        type: z.string().describe("Product noun matching retail catalogs, e.g. sneakers, dress, headphones, sunglasses, watch, sofa"),
        category: z.enum(CATEGORIES),
        color: z.string().nullable(),
        style: z.string().nullable().describe("e.g. 'low-top classic', 'midi floral', 'over-ear', 'aviator'"),
        material: z.string().nullable(),
        brandGuess: z.string().nullable().describe("Brand only if a logo/design makes it clear"),
        keywords: z.array(z.string()),
        visiblePrice: z.number().nullable().describe("Price shown in the screenshot in INR, if any"),
      }),
    )
    .describe("Shoppable products visible, most prominent first (max 3)"),
});
export type VisionResult = z.infer<typeof VisionSchema>;

export async function identifyProducts(base64: string, mediaType: "image/png" | "image/jpeg" | "image/webp" | "image/gif", hint?: string): Promise<VisionResult | null> {
  return askStructured({
    system:
      "You identify shoppable products in screenshots from Instagram, Pinterest, YouTube, WhatsApp or websites. Describe them so they can be matched in Indian e-commerce catalogs. Ignore UI chrome, people's faces and non-product items.",
    content: [
      { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
      { type: "text", text: `Identify the products in this screenshot.${hint ? ` User note: ${hint}` : ""}` },
    ],
    schema: VisionSchema,
    effort: "low",
  });
}
