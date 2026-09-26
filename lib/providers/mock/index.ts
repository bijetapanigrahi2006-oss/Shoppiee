import type { Product, ProductWithOffers, SearchFilters, StoreId } from "@/lib/types";
import { detectStore } from "@/lib/stores";
import type { ProductProvider, SimilarQuery, SimilarResult } from "../types";
import { getCatalog, hashString } from "./catalog";

const SYNONYMS: Record<string, string[]> = {
  sunscreen: ["sunblock", "spf", "sun cream", "suncream", "sun screen"],
  mobiles: ["phone", "smartphone", "mobile", "iphone"],
  laptops: ["laptop", "notebook", "macbook"],
  headphones: ["headphone", "headset"],
  earbuds: ["earphones", "tws", "airpods", "buds"],
  sneakers: ["shoes", "sneaker", "trainers", "kicks"],
  "running shoes": ["running", "joggers"],
  dress: ["dresses", "gown", "frock"],
  vegetable: ["veggies", "vegetables", "sabzi"],
  fruit: ["fruits"],
  watch: ["watches", "wristwatch"],
  smartwatch: ["smart watch", "fitness band"],
  sofa: ["couch"],
  jewellery: ["jewelry", "jewel"],
  tv: ["television"],
  kurti: ["kurtis", "kurthi", "kurta for women"],
  lehenga: ["lehnga", "lengha", "ghagra", "chaniya", "choli"],
  saree: ["sari", "sarees", "saris"],
  jeans: ["denims", "denim pants"],
  top: ["tops", "blouse", "crop top", "tee for women"],
  shirt: ["shirts"],
  "lip balm": ["lipbalm", "lip balm", "chapstick", "lip care"],
  lipstick: ["lipsticks", "lip colour", "lip color"],
  foundation: ["base makeup"],
  makeup: ["make up", "cosmetics"],
  perfume: ["perfumes", "fragrance", "scent", "deo"],
  chips: ["crisps", "wafers", "namkeen", "snack"],
  cookies: ["biscuits", "biscuit", "cookie"],
  cake: ["cakes", "muffin", "cupcake"],
  chocolate: ["chocolates", "choco"],
  anklet: ["anklets", "payal"],
  bracelet: ["bracelets", "band", "kada"],
  choker: ["chokers"],
  bangles: ["bangle", "chudi", "kangan"],
  earrings: ["earring", "jhumka", "jhumkas", "studs", "hoops"],
};

function normalise(q: string): string[] {
  let text = q.toLowerCase();
  for (const [canon, alts] of Object.entries(SYNONYMS)) {
    for (const a of alts) if (text.includes(a)) text += ` ${canon}`;
  }
  return text
    .replace(/[^a-z0-9₹+ ]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP.has(w));
}

const STOP = new Set(["the", "for", "and", "with", "under", "best", "buy", "me", "find", "a", "an", "to", "of", "in", "my", "some", "good", "i", "want", "need", "rs", "inr"]);

function haystack(p: Product): string {
  return [p.name, p.brand, p.category, p.subcategory, p.attributes.type, p.attributes.style, p.attributes.color, p.attributes.material, ...p.tags]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function withOffers(p: Product): ProductWithOffers | null {
  const offers = getCatalog().offers.get(p.id) ?? [];
  const inStock = offers.filter((o) => o.inStock);
  const list = inStock.length ? inStock : offers;
  if (!list.length) return null;
  const bestOffer = list.reduce((a, b) => (a.price + a.shipping <= b.price + b.shipping ? a : b));
  return { ...p, offers, bestOffer };
}

function applyFilters(list: ProductWithOffers[], f?: SearchFilters): ProductWithOffers[] {
  if (!f) return list;
  let out = list;
  if (f.category) out = out.filter((p) => p.category === f.category);
  if (f.minPrice != null) out = out.filter((p) => p.bestOffer.price >= f.minPrice!);
  if (f.maxPrice != null) out = out.filter((p) => p.bestOffer.price <= f.maxPrice!);
  if (f.minRating != null) out = out.filter((p) => p.rating >= f.minRating!);
  if (f.stores?.length) out = out.filter((p) => p.offers.some((o) => f.stores!.includes(o.store)));
  switch (f.sort) {
    case "price_asc":
      out = [...out].sort((a, b) => a.bestOffer.price - b.bestOffer.price);
      break;
    case "price_desc":
      out = [...out].sort((a, b) => b.bestOffer.price - a.bestOffer.price);
      break;
    case "rating":
      out = [...out].sort((a, b) => b.rating - a.rating);
      break;
  }
  return out;
}

/** Extracts a price ceiling like "under 70k", "below ₹2,000", "budget 70000". */
export function extractBudget(q: string): number | undefined {
  const m = q.toLowerCase().match(/(?:under|below|less than|within|budget|upto|up to|max)\s*(?:of\s*)?(?:rs\.?|₹|inr)?\s*([\d,.]+)\s*(k|thousand|lakh|l)?/);
  if (!m) return undefined;
  let n = parseFloat(m[1].replace(/,/g, ""));
  if (m[2] === "k" || m[2] === "thousand") n *= 1000;
  if (m[2] === "lakh" || m[2] === "l") n *= 100000;
  return Number.isFinite(n) ? n : undefined;
}

export const mockProvider: ProductProvider = {
  async search(query, filters) {
    const terms = normalise(query);
    const budget = filters?.maxPrice ?? extractBudget(query);
    const { products } = getCatalog();
    const scored: { p: Product; s: number }[] = [];
    for (const p of products) {
      const hay = haystack(p);
      let s = 0;
      for (const t of terms) {
        if (/^\d/.test(t)) continue;
        if (hay.includes(t)) s += p.attributes.type.includes(t) || p.tags.includes(t) ? 3 : 1;
      }
      if (s > 0) scored.push({ p, s });
    }
    scored.sort((a, b) => b.s - a.s || b.p.rating - a.p.rating);
    const top = scored.length ? scored[0].s : 0;
    const relevant = scored.filter((x) => x.s >= Math.max(1, top * 0.5)).map((x) => withOffers(x.p)).filter(Boolean) as ProductWithOffers[];
    return applyFilters(relevant, { ...filters, maxPrice: budget });
  },

  async listProducts(filters) {
    return applyFilters(getCatalog().products.map(withOffers).filter(Boolean) as ProductWithOffers[], filters);
  },

  async getProduct(id) {
    const p = getCatalog().byId.get(id);
    return p ? withOffers(p) : null;
  },

  async getOffers(productId) {
    return getCatalog().offers.get(productId) ?? [];
  },

  async getPriceHistory(offerId, days = 180) {
    const h = getCatalog().history.get(offerId) ?? [];
    return h.slice(-days);
  },

  async getReviews(productId) {
    const c = getCatalog();
    return {
      reviews: c.reviews.get(productId) ?? [],
      complaints: c.complaints.get(productId) ?? [],
      pros: c.pros.get(productId) ?? [],
    };
  },

  async getCoupons(store?: StoreId) {
    const all = getCatalog().coupons;
    return store ? all.filter((c) => c.store === store) : all;
  },

  async resolveUrl(url) {
    const store = detectStore(url);
    let path = "";
    try {
      const u = new URL(url.trim());
      path = decodeURIComponent(u.pathname + " " + (u.searchParams.get("q") ?? u.searchParams.get("k") ?? ""));
    } catch {
      return { store: null, product: null, confidence: 0 };
    }
    // Product slugs usually live in the path: /Sony-WH-1000XM5-Wireless/dp/B0... or /nike-air-force-1/p/itm...
    const words = path
      .replace(/\/(dp|p|gp|product|buy|itm)\/[a-z0-9]+/gi, " ")
      .replace(/[-_/+]/g, " ")
      .replace(/[^a-zA-Z0-9 ]/g, " ")
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 2 && !/^\d+$/.test(w) && !["www", "com", "html", "ref", "sr", "qid", "sspa", "search"].includes(w));

    const { products } = getCatalog();
    let best: Product | null = null;
    let bestScore = 0;
    if (words.length) {
      for (const p of products) {
        const hay = haystack(p);
        const s = words.reduce((acc, w) => acc + (hay.includes(w) ? 1 : 0), 0);
        if (s > bestScore) {
          bestScore = s;
          best = p;
        }
      }
    }
    if (best && bestScore >= 2) {
      const product = withOffers(best);
      return { store, product, confidence: Math.min(0.95, 0.4 + bestScore * 0.12) };
    }
    // Demo fallback: map unknown links to a stable catalog product so the flow is explorable.
    const pool = store ? products.filter((p) => (getCatalog().offers.get(p.id) ?? []).some((o) => o.store === store)) : products;
    const pick = pool[hashString(url) % pool.length];
    return { store, product: withOffers(pick), confidence: 0.2 };
  },

  async findSimilar(q: SimilarQuery, limit = 12) {
    const { products } = getCatalog();
    const kw = (q.keywords ?? []).map((k) => k.toLowerCase());
    const out: SimilarResult[] = [];
    for (const p of products) {
      let score = 0;
      let max = 0;
      const hay = haystack(p);
      const add = (w: number, hit: boolean) => {
        max += w;
        if (hit) score += w;
      };
      if (q.type) add(40, p.attributes.type === q.type.toLowerCase() || hay.includes(q.type.toLowerCase()));
      if (q.category) add(15, p.category === q.category);
      if (q.style) add(15, !!p.attributes.style && q.style.toLowerCase().split(" ").some((w) => p.attributes.style!.includes(w)));
      if (q.color) add(15, !!p.attributes.color && (p.attributes.color.includes(q.color.toLowerCase()) || q.color.toLowerCase().includes(p.attributes.color)));
      if (q.material) add(5, !!p.attributes.material && p.attributes.material.includes(q.material.toLowerCase()));
      if (q.brand) add(10, p.brand.toLowerCase() === q.brand.toLowerCase());
      if (kw.length) {
        const hits = kw.filter((k) => hay.includes(k)).length;
        max += 10;
        score += (10 * hits) / kw.length;
      }
      if (max === 0 || score === 0) continue;
      const similarity = Math.round((score / max) * 100);
      if (similarity < 35) continue;
      const pw = withOffers(p);
      if (pw) out.push({ product: pw, similarity: Math.min(99, similarity) });
    }
    return out.sort((a, b) => b.similarity - a.similarity).slice(0, limit);
  },
};
