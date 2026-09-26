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
  grocery: { id: "grocery", label: "Fruits & Veggies", blurb: "Farm-fresh, delivered fast", bg: "#e8f8ec", fg: "#14532d", accent: "#22c55e", gradient: "linear-gradient(135deg,#d9f99d 0%,#4ade80 30%,#059669 68%,#064e3b 100%)" },
  snacks: { id: "snacks", label: "Snacks & Packaged Food", blurb: "Cookies, chips, chocolates", bg: "#fff4e0", fg: "#7c2d12", accent: "#f59e0b", gradient: "linear-gradient(135deg,#fef08a 0%,#fbbf24 28%,#f97316 62%,#e11d48 100%)" },
  fashion: { id: "fashion", label: "Fashion", blurb: "Kurtis, lehengas, tops & more", bg: "#f7ebff", fg: "#581c87", accent: "#d946ef", gradient: "linear-gradient(135deg,#fbcfe8 0%,#f472b6 26%,#c026d3 60%,#581c87 100%)" },
  beauty: { id: "beauty", label: "Beauty & Makeup", blurb: "Lipsticks, skincare, fragrance", bg: "#fff0f3", fg: "#881337", accent: "#fb7185", gradient: "linear-gradient(135deg,#ffe4e6 0%,#fb7185 32%,#e11d48 68%,#881337 100%)" },
  electronics: { id: "electronics", label: "Electronics", blurb: "Audio, wearables, TVs", bg: "#eef0f3", fg: "#111827", accent: "#22d3ee", gradient: "linear-gradient(135deg,#67e8f9 0%,#0891b2 28%,#1e293b 66%,#020617 100%)" },
  laptops: { id: "laptops", label: "Laptops", blurb: "Work, study & gaming", bg: "#eceef2", fg: "#0f172a", accent: "#38bdf8", gradient: "linear-gradient(135deg,#bae6fd 0%,#0ea5e9 28%,#1e3a5f 66%,#020617 100%)" },
  mobiles: { id: "mobiles", label: "Mobiles", blurb: "Flagships to budget stars", bg: "#edf0f5", fg: "#1e293b", accent: "#818cf8", gradient: "linear-gradient(135deg,#c7d2fe 0%,#818cf8 28%,#4338ca 62%,#1e1b4b 100%)" },
  jewellery: { id: "jewellery", label: "Jewellery & Watches", blurb: "Gold, silver, everyday sparkle", bg: "#fdf6e3", fg: "#713f12", accent: "#eab308", gradient: "linear-gradient(135deg,#fef9c3 0%,#fcd34d 26%,#d97706 64%,#713f12 100%)" },
  home: { id: "home", label: "Home & Furniture", blurb: "Cosy corners & kitchen", bg: "#fff3e6", fg: "#7c2d12", accent: "#f97316", gradient: "linear-gradient(135deg,#fed7aa 0%,#fb923c 30%,#c2410c 66%,#5c1d0a 100%)" },
  sports: { id: "sports", label: "Sports & Fitness", blurb: "Gear up and move", bg: "#ffeeee", fg: "#7f1d1d", accent: "#ef4444", gradient: "linear-gradient(135deg,#fecaca 0%,#f87171 26%,#dc2626 60%,#7f1d1d 100%)" },
  books: { id: "books", label: "Books", blurb: "Bestsellers & tech reads", bg: "#e6f7f5", fg: "#134e4a", accent: "#14b8a6", gradient: "linear-gradient(135deg,#ccfbf1 0%,#2dd4bf 30%,#0d9488 64%,#134e4a 100%)" },
  toys: { id: "toys", label: "Toys & Kids", blurb: "Play, build, gift", bg: "#fffbe0", fg: "#713f12", accent: "#facc15", gradient: "linear-gradient(135deg,#fef08a 0%,#facc15 30%,#fb923c 64%,#ec4899 100%)" },
  footwear: { id: "footwear", label: "Footwear", blurb: "Sneakers, heels, juttis", bg: "#eef2ff", fg: "#312e81", accent: "#6366f1", gradient: "linear-gradient(135deg,#e0e7ff 0%,#818cf8 30%,#4f46e5 64%,#1e1b4b 100%)" },
};

export const CATEGORY_LIST = Object.values(CATEGORY_THEMES);

export function themeFor(category: CategoryId | string | undefined): CategoryTheme {
  return CATEGORY_THEMES[(category as CategoryId) ?? "electronics"] ?? CATEGORY_THEMES.electronics;
}

export const BRAND_GRADIENT = "linear-gradient(120deg,#ff3d7f 0%,#ff8a3d 20%,#ffd23f 36%,#2ee6a8 54%,#1fc8f5 72%,#9b5cff 90%,#ff3d7f 100%)";
