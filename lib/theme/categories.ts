import type { CategoryId } from "@/lib/types";

export interface CategoryTheme {
  id: CategoryId;
  label: string;
  /** Short tagline for tiles. */
  blurb: string;
  /** Soft tinted background (light mode). */
  bg: string;
  /** Strong foreground on bg. */
  fg: string;
  /** Accent used for chart lines, buttons, badges, glows. */
  accent: string;
  gradient: string;
}

export const CATEGORY_THEMES: Record<CategoryId, CategoryTheme> = {
  grocery: { id: "grocery", label: "Fruits & Veggies", blurb: "Farm-fresh, delivered fast", bg: "#e8f8ec", fg: "#14532d", accent: "#22c55e", gradient: "linear-gradient(135deg,#86efac 0%,#22c55e 50%,#047857 100%)" },
  snacks: { id: "snacks", label: "Snacks & Packaged Food", blurb: "Cookies, chips, chocolates", bg: "#fff4e0", fg: "#7c2d12", accent: "#f59e0b", gradient: "linear-gradient(135deg,#fde047 0%,#f59e0b 50%,#ea580c 100%)" },
  fashion: { id: "fashion", label: "Fashion", blurb: "Kurtis, lehengas, tops & more", bg: "#f7ebff", fg: "#581c87", accent: "#d946ef", gradient: "linear-gradient(135deg,#f0abfc 0%,#d946ef 45%,#7e22ce 100%)" },
  beauty: { id: "beauty", label: "Beauty & Makeup", blurb: "Lipsticks, skincare, fragrance", bg: "#fff0f3", fg: "#881337", accent: "#fb7185", gradient: "linear-gradient(135deg,#fecdd3 0%,#fb7185 45%,#e11d48 100%)" },
  electronics: { id: "electronics", label: "Electronics", blurb: "Audio, wearables, TVs", bg: "#eef0f3", fg: "#111827", accent: "#22d3ee", gradient: "linear-gradient(135deg,#475569 0%,#111827 55%,#0e7490 100%)" },
  laptops: { id: "laptops", label: "Laptops", blurb: "Work, study & gaming", bg: "#eceef2", fg: "#0f172a", accent: "#38bdf8", gradient: "linear-gradient(135deg,#64748b 0%,#0f172a 60%,#0369a1 100%)" },
  mobiles: { id: "mobiles", label: "Mobiles", blurb: "Flagships to budget stars", bg: "#edf0f5", fg: "#1e293b", accent: "#818cf8", gradient: "linear-gradient(135deg,#94a3b8 0%,#1e293b 55%,#4338ca 100%)" },
  jewellery: { id: "jewellery", label: "Jewellery & Watches", blurb: "Gold, silver, everyday sparkle", bg: "#fdf6e3", fg: "#713f12", accent: "#eab308", gradient: "linear-gradient(135deg,#fef08a 0%,#eab308 40%,#a16207 100%)" },
  home: { id: "home", label: "Home & Furniture", blurb: "Cosy corners & kitchen", bg: "#fff3e6", fg: "#7c2d12", accent: "#f97316", gradient: "linear-gradient(135deg,#fdba74 0%,#f97316 50%,#b45309 100%)" },
  sports: { id: "sports", label: "Sports & Fitness", blurb: "Gear up and move", bg: "#ffeeee", fg: "#7f1d1d", accent: "#ef4444", gradient: "linear-gradient(135deg,#fca5a5 0%,#ef4444 50%,#c2410c 100%)" },
  books: { id: "books", label: "Books", blurb: "Bestsellers & tech reads", bg: "#e6f7f5", fg: "#134e4a", accent: "#14b8a6", gradient: "linear-gradient(135deg,#5eead4 0%,#14b8a6 50%,#0f766e 100%)" },
  toys: { id: "toys", label: "Toys & Kids", blurb: "Play, build, gift", bg: "#fffbe0", fg: "#713f12", accent: "#facc15", gradient: "linear-gradient(135deg,#fef08a 0%,#facc15 45%,#f97316 100%)" },
  footwear: { id: "footwear", label: "Footwear", blurb: "Sneakers, heels, juttis", bg: "#eef2ff", fg: "#312e81", accent: "#6366f1", gradient: "linear-gradient(135deg,#a5b4fc 0%,#6366f1 50%,#4338ca 100%)" },
};

export const CATEGORY_LIST = Object.values(CATEGORY_THEMES);

export function themeFor(category: CategoryId | string | undefined): CategoryTheme {
  return CATEGORY_THEMES[(category as CategoryId) ?? "electronics"] ?? CATEGORY_THEMES.electronics;
}

export const BRAND_GRADIENT = "linear-gradient(120deg,#ff4d8d 0%,#ff9f43 22%,#ffd84d 38%,#2de2a6 56%,#22d3ee 74%,#a855f7 100%)";
