import type { CategoryId, Coupon, Offer, PricePoint, Product, Review, StoreId } from "@/lib/types";
import { STORES } from "@/lib/stores";
import { REVIEW_POOLS, TEMPLATES } from "./templates";
import imagesJson from "./images.json";

// ───────────── deterministic randomness ─────────────
export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);

/** Round to Indian retail-style prices (…99 / …49). */
function retail(p: number): number {
  if (p < 100) return Math.max(9, Math.round(p));
  if (p < 1000) return Math.round(p / 10) * 10 - 1;
  return Math.round(p / 100) * 100 - 1;
}

const CATEGORY_STORES: Record<CategoryId, StoreId[]> = {
  grocery: ["bigbasket", "blinkit", "jiomart", "amazon", "flipkart"],
  snacks: ["blinkit", "bigbasket", "jiomart", "amazon", "flipkart"],
  fashion: ["myntra", "ajio", "amazon", "flipkart", "meesho", "tatacliq"],
  beauty: ["nykaa", "amazon", "flipkart", "myntra", "tatacliq"],
  electronics: ["amazon", "flipkart", "croma", "reliancedigital", "tatacliq", "snapdeal"],
  laptops: ["amazon", "flipkart", "croma", "reliancedigital", "tatacliq"],
  mobiles: ["amazon", "flipkart", "croma", "reliancedigital", "tatacliq"],
  jewellery: ["titan", "myntra", "amazon", "tatacliq", "ajio"],
  home: ["amazon", "flipkart", "snapdeal", "tatacliq", "meesho"],
  sports: ["amazon", "flipkart", "myntra", "ajio", "snapdeal"],
  books: ["amazon", "flipkart", "snapdeal"],
  toys: ["amazon", "flipkart", "meesho", "snapdeal"],
  footwear: ["myntra", "ajio", "amazon", "flipkart", "tatacliq"],
};

export const HISTORY_DAYS = 180;

// Fixed "today" so price history, deals and verdicts are stable across reloads
// within a day but still move forward over time.
function todayUTC(): Date {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// ───────────── catalog build ─────────────
export interface Catalog {
  products: Product[];
  byId: Map<string, Product>;
  offers: Map<string, Offer[]>; // productId → offers
  history: Map<string, PricePoint[]>; // offerId → history
  reviews: Map<string, Review[]>;
  complaints: Map<string, string[]>; // productId → top complaints
  pros: Map<string, string[]>;
  coupons: Coupon[];
}

const AUTHORS = ["Aarav", "Diya", "Rohan", "Ishita", "Kabir", "Ananya", "Vihaan", "Meera", "Arjun", "Sara", "Neel", "Priya", "Zoya", "Aditya", "Riya", "Kunal"];

type Photo = { local?: string; fit: "cover" | "contain"; credit?: string };
const PHOTOS = imagesJson as unknown as Record<string, Photo[]>;

/**
 * Every product gets a real photo: its own, else one from its type's pool
 * (spread so neighbouring products differ), else a related type's, else its category's.
 */
function photoPools() {
  const own = new Map<string, Photo[]>();
  const byType = new Map<string, Photo[]>();
  const byCategory = new Map<string, Photo[]>();
  const add = (m: Map<string, Photo[]>, k: string, list: Photo[]) => {
    const cur = m.get(k) ?? [];
    for (const p of list) if (!cur.some((c) => c.local === p.local)) cur.push(p);
    m.set(k, cur);
  };
  // Extra per-type pools gathered separately (keys like "__type:kurti").
  for (const [key, list] of Object.entries(PHOTOS)) {
    if (key.startsWith("__type:")) add(byType, key.slice(7), list.filter((p) => p.local));
  }
  // A photo only counts as a product's "own" if no other product uses it;
  // shared photos go into the type pool so similar products get different pictures.
  const usage = new Map<string, number>();
  for (const tpl of TEMPLATES) for (const p of PHOTOS[tpl.name] ?? []) if (p.local) usage.set(p.local, (usage.get(p.local) ?? 0) + 1);
  for (const tpl of TEMPLATES) {
    const list = (PHOTOS[tpl.name] ?? []).filter((p) => p.local);
    own.set(tpl.name, list.filter((p) => usage.get(p.local!) === 1));
    if (!list.length) continue;
    add(byType, tpl.type, list);
    add(byCategory, tpl.category, list);
  }
  // Order of each template within its type, so pool picks are spread out rather than hashed.
  const orderInType = new Map<string, number>();
  const typeCount = new Map<string, number>();
  for (const tpl of TEMPLATES) {
    if (own.get(tpl.name)?.length) continue;
    const n = typeCount.get(tpl.type) ?? 0;
    orderInType.set(tpl.name, n);
    typeCount.set(tpl.type, n + (tpl.variants?.length ?? 1));
  }
  // When a type has no photo of its own, borrow from the closest related type.
  const RELATED: Record<string, string> = {
    kajal: "eyeliner",
    primer: "foundation",
    highlighter: "blush",
    "micellar water": "face wash",
    "setting spray": "moisturiser",
    "maang tikka": "earrings",
    "nose pin": "earrings",
    "lip mask": "lip balm",
  };
  return (tpl: (typeof TEMPLATES)[number], vi: number): Photo | null => {
    const own_ = own.get(tpl.name) ?? [];
    if (own_.length) return own_[vi % own_.length];
    const pool = byType.get(tpl.type) ?? byType.get(RELATED[tpl.type] ?? "") ?? byCategory.get(tpl.category) ?? [];
    if (!pool.length) return null;
    const start = orderInType.get(tpl.name) ?? hashString(tpl.name);
    return pool[(start + vi) % pool.length];
  };
}

function buildProducts(): Product[] {
  const out: Product[] = [];
  const photoFor = photoPools();
  for (const tpl of TEMPLATES) {
    const variants = tpl.variants ?? [undefined];
    variants.forEach((variant, vi) => {
      const name = variant ? `${tpl.name} – ${variant}` : tpl.name;
      const id = slug(`${tpl.brand}-${name}`);
      const r = rng(hashString(id));
      const quality = Math.min(0.97, Math.max(0.35, (tpl.quality ?? 0.7) + (r() - 0.5) * 0.08));
      const rating = Math.round((2.6 + quality * 2.3) * 10) / 10;
      const reviewCount = Math.round(80 + r() * 25000 * quality);
      const price = tpl.price * (1 + (vi === 0 ? 0 : (r() - 0.5) * 0.06));
      out.push({
        id,
        name,
        brand: tpl.brand,
        category: tpl.category,
        subcategory: tpl.sub,
        image: tpl.emoji,
        ...(() => {
          const ph = photoFor(tpl, vi);
          return { photo: ph?.local ?? "", photoFit: ph?.fit ?? "cover", photoCredit: ph?.credit };
        })(),
        description: `${tpl.brand} ${name}. ${tpl.sub} in ${tpl.category}. ${tpl.tags.slice(0, 3).join(", ")}.`,
        specs: { ...(tpl.specs ?? {}), ...(variant ? { Colour: variant } : {}) },
        tags: tpl.tags,
        attributes: {
          type: tpl.type,
          color: variant?.toLowerCase(),
          style: tpl.style,
          material: tpl.material,
        },
        rating: Math.min(4.8, rating),
        reviewCount,
        mrp: retail(price * (1.25 + r() * 0.35)),
      });
    });
  }
  return out;
}

/**
 * Generates a deterministic 180-day price history ending at `today`.
 * - Random walk around a "fair" price with occasional sale dips.
 * - `inflated` offers rise in the weeks before a sale so the "discount" looks bigger than it is.
 */
function buildHistory(offerId: string, fair: number, inflated: boolean, today: Date): PricePoint[] {
  const r = rng(hashString(offerId + ":hist"));
  const pts: PricePoint[] = [];
  let p = fair * (0.97 + r() * 0.08);
  // two sale windows at pseudo-random places in the timeline
  const sale1 = 40 + Math.floor(r() * 40);
  const sale2 = 110 + Math.floor(r() * 40);
  const saleDepth = 0.08 + r() * 0.12;
  for (let i = HISTORY_DAYS - 1; i >= 0; i--) {
    const dayIdx = HISTORY_DAYS - 1 - i;
    const d = new Date(today.getTime() - i * 86400000);
    p += (fair - p) * 0.08 + (r() - 0.5) * fair * 0.015;
    let shown = p;
    const inSale = (dayIdx >= sale1 && dayIdx < sale1 + 6) || (dayIdx >= sale2 && dayIdx < sale2 + 7);
    if (inSale) shown = p * (1 - saleDepth);
    if (inflated && i < 25 && i > 3) shown = p * (1.1 + (25 - i) * 0.004); // pre-sale hike
    pts.push({ date: isoDay(d), price: retail(shown) });
  }
  return pts;
}

function buildReviews(p: Product, quality: number): { reviews: Review[]; complaints: string[]; pros: string[] } {
  const pool = REVIEW_POOLS[p.category] ?? REVIEW_POOLS.electronics;
  const r = rng(hashString(p.id + ":rev"));
  const pick = <T,>(arr: T[]) => arr[Math.floor(r() * arr.length)];
  // Lower-quality products get more (and more consistent) complaints.
  const nComplaints = quality > 0.85 ? 1 : quality > 0.7 ? 2 : 3;
  const shuffledCons = [...pool.cons].sort(() => r() - 0.5);
  const complaints = shuffledCons.slice(0, nComplaints);
  const pros = [...pool.pros].sort(() => r() - 0.5).slice(0, 3);

  const reviews: Review[] = [];
  for (let i = 0; i < 8; i++) {
    const positive = r() < quality;
    const rating = positive ? (r() < 0.6 ? 5 : 4) : r() < 0.5 ? 2 : r() < 0.5 ? 1 : 3;
    const pro = pick(pros);
    const con = pick(complaints);
    reviews.push({
      id: `${p.id}-r${i}`,
      productId: p.id,
      rating,
      title: positive ? pro : `Disappointed — ${con}`,
      body: positive
        ? `${pro}. ${r() < 0.35 ? `Only issue is ${con}, but overall happy.` : "Would recommend."}`
        : `Facing ${con}. ${r() < 0.5 ? `${pro} though.` : "Expected better at this price."}`,
      author: pick(AUTHORS),
      date: isoDay(new Date(Date.now() - Math.floor(r() * 150) * 86400000)),
    });
  }
  return { reviews, complaints, pros };
}

const COUPONS: Coupon[] = [
  { id: "c1", store: "amazon", code: "HDFC10", description: "10% instant discount on HDFC Bank cards", kind: "bank", value: 10, minOrder: 5000, maxDiscount: 1500 },
  { id: "c2", store: "amazon", code: "SAVE100", description: "₹100 off on orders above ₹999", kind: "flat", value: 100, minOrder: 999 },
  { id: "c3", store: "flipkart", code: "AXIS5", description: "5% off with Flipkart Axis Bank card", kind: "bank", value: 5, minOrder: 0, maxDiscount: 4000 },
  { id: "c4", store: "flipkart", code: "SBI1500", description: "₹1,500 off on SBI cards for electronics", kind: "flat", value: 1500, minOrder: 25000, categories: ["laptops", "mobiles", "electronics"] },
  { id: "c5", store: "myntra", code: "MYNTRA300", description: "₹300 off on first order above ₹1,499", kind: "flat", value: 300, minOrder: 1499 },
  { id: "c6", store: "myntra", code: "STYLE15", description: "15% off fashion, up to ₹500", kind: "percent", value: 15, minOrder: 999, maxDiscount: 500, categories: ["fashion", "footwear"] },
  { id: "c7", store: "ajio", code: "AJIO20", description: "Extra 20% off on ₹2,499+", kind: "percent", value: 20, minOrder: 2499, maxDiscount: 800 },
  { id: "c8", store: "nykaa", code: "GLOW10", description: "10% off skincare", kind: "percent", value: 10, minOrder: 499, maxDiscount: 200, categories: ["beauty"] },
  { id: "c9", store: "croma", code: "CROMA2K", description: "₹2,000 off laptops above ₹50,000", kind: "flat", value: 2000, minOrder: 50000, categories: ["laptops"] },
  { id: "c10", store: "tatacliq", code: "CLIQ10", description: "10% off, up to ₹1,000", kind: "percent", value: 10, minOrder: 1999, maxDiscount: 1000 },
  { id: "c11", store: "bigbasket", code: "BBFRESH50", description: "₹50 off fruits & veg above ₹399", kind: "flat", value: 50, minOrder: 399, categories: ["grocery"] },
  { id: "c12", store: "blinkit", code: "FREEDEL", description: "Free delivery + ₹25 off above ₹299", kind: "flat", value: 25, minOrder: 299 },
  { id: "c13", store: "jiomart", code: "JIO5", description: "5% off groceries", kind: "percent", value: 5, minOrder: 500, maxDiscount: 150, categories: ["grocery"] },
  { id: "c14", store: "titan", code: "TITAN500", description: "₹500 off watches above ₹4,999", kind: "flat", value: 500, minOrder: 4999 },
  { id: "c15", store: "reliancedigital", code: "ICICI7", description: "7.5% off on ICICI cards", kind: "bank", value: 7.5, minOrder: 10000, maxDiscount: 3000 },
  { id: "c16", store: "meesho", code: "MEESHO50", description: "₹50 off first order", kind: "flat", value: 50, minOrder: 299 },
  { id: "c17", store: "snapdeal", code: "SNAP10", description: "10% off up to ₹250", kind: "percent", value: 10, minOrder: 499, maxDiscount: 250 },
];

function buildCatalog(): Catalog {
  const today = todayUTC();
  const products = buildProducts();
  const byId = new Map(products.map((p) => [p.id, p]));
  const offers = new Map<string, Offer[]>();
  const history = new Map<string, PricePoint[]>();
  const reviews = new Map<string, Review[]>();
  const complaints = new Map<string, string[]>();
  const pros = new Map<string, string[]>();

  for (const p of products) {
    const r = rng(hashString(p.id + ":offers"));
    const pool = CATEGORY_STORES[p.category];
    const n = Math.min(pool.length, 2 + Math.floor(r() * (pool.length - 1)));
    const stores = [...pool].sort(() => r() - 0.5).slice(0, n);
    // Titan only sells its own group brands.
    const eligible = stores.filter((s) => s !== "titan" || ["Titan", "Tanishq", "CaratLane", "Fastrack"].includes(p.brand));
    const typical = p.mrp / 1.35;
    const inflatedProduct = r() < 0.3;

    const productOffers: Offer[] = eligible.map((store) => {
      const id = `${p.id}:${store}`;
      const fair = typical * (0.93 + r() * 0.14);
      const inflated = inflatedProduct && r() < 0.7;
      const hist = buildHistory(id, fair, inflated, today);
      history.set(id, hist);
      const price = hist[hist.length - 1].price;
      const mrp = inflated ? retail(Math.max(p.mrp, price * 1.3)) : p.mrp;
      return {
        id,
        productId: p.id,
        store,
        price,
        mrp,
        inStock: r() > 0.08,
        shipping: price > 499 || ["blinkit"].includes(store) ? 0 : 40,
        url: STORES[store].searchUrl(`${p.brand} ${p.name}`),
        cashbackPct: Math.round(r() * 5 * 10) / 10,
      };
    });
    offers.set(p.id, productOffers);

    const quality = (p.rating - 2.6) / 2.3;
    const rv = buildReviews(p, quality);
    reviews.set(p.id, rv.reviews);
    complaints.set(p.id, rv.complaints);
    pros.set(p.id, rv.pros);
  }

  return { products, byId, offers, history, reviews, complaints, pros, coupons: COUPONS };
}

/** Photo lookup for rows saved before photos existed (cart, wishlist, orders…). */
export function photoOf(productId: string): { photo: string; photoFit: "cover" | "contain" } {
  const p = getCatalog().byId.get(productId);
  return { photo: p?.photo ?? "", photoFit: p?.photoFit ?? "cover" };
}

/** A representative photo per category, for tiles and headers. */
const COVER_SUB: Record<string, string> = {
  grocery: "Fruits",
  snacks: "Chips & namkeen",
  fashion: "Lehengas",
  beauty: "Lipstick",
  electronics: "Headphones",
  laptops: "Thin & light",
  mobiles: "Premium",
  jewellery: "Earrings",
  home: "Sofas",
  sports: "Cycling",
  books: "Self-help",
  toys: "Soft toys",
  footwear: "Sneakers",
};

export function categoryCover(category: string, n = 0): string {
  const inCat = getCatalog().products.filter((p) => p.category === category && p.photo);
  const preferred = inCat.filter((p) => p.subcategory === COVER_SUB[category]).sort((a, b) => b.rating - a.rating);
  const list = preferred.length ? preferred : inCat;
  return list.length ? list[n % list.length].photo : "";
}

let cached: { day: string; catalog: Catalog } | null = null;

/** Catalog is rebuilt once per day so price history keeps "moving". */
export function getCatalog(): Catalog {
  const day = isoDay(todayUTC());
  if (!cached || cached.day !== day) cached = { day, catalog: buildCatalog() };
  return cached.catalog;
}
