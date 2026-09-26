import type { CategoryId, ProductWithOffers } from "@/lib/types";
import { getProvider } from "@/lib/providers";

/** AI-curated starter lists shown on Home. Each item is a search that resolves to a top product. */
export const CURATED_LISTS: { id: string; name: string; category: CategoryId; blurb: string; items: string[] }[] = [
  { id: "festive", name: "Festive ethnic edit", category: "fashion", blurb: "Lehenga, kurti, juttis & bangles", items: ["lehenga", "anarkali kurti", "juttis", "bangles", "maang tikka"] },
  { id: "makeup", name: "Everyday makeup kit", category: "beauty", blurb: "Lips, face & eyes essentials", items: ["lip balm", "liquid lipstick", "foundation", "mascara", "kajal"] },
  { id: "snacks", name: "Movie-night snack box", category: "snacks", blurb: "Chips, cookies & chocolate", items: ["kurkure", "lays", "oreo", "dairy milk silk", "coca cola"] },
  { id: "college-tech", name: "College tech kit", category: "laptops", blurb: "Everything for a new semester", items: ["laptop coding college", "earbuds", "power bank", "office chair"] },
  { id: "skincare", name: "Summer skincare", category: "beauty", blurb: "SPF, serum and cleanse", items: ["sunscreen oily skin", "niacinamide serum", "face wash", "moisturiser"] },
  { id: "party", name: "Party-ready look", category: "fashion", blurb: "Top, jeans, heels & sparkle", items: ["corset top", "flared jeans", "block heel", "hoop earrings"] },
  { id: "groceries", name: "Weekly groceries", category: "grocery", blurb: "Fresh fruits, veggies & staples", items: ["bananas", "tomatoes", "onions", "milk", "atta"] },
  { id: "jewels", name: "Everyday jewellery", category: "jewellery", blurb: "Chains, anklets, bracelets", items: ["layered chain", "anklet", "friendship bracelet", "charm bracelet"] },
];

export type CuratedList = (typeof CURATED_LISTS)[number];

/** Resolves each item search to its top product, skipping duplicates. */
export async function resolveCurated(list: CuratedList): Promise<ProductWithOffers[]> {
  const provider = getProvider();
  const items = await Promise.all(list.items.map(async (q) => (await provider.search(q))[0]));
  const seen = new Set<string>();
  return items.filter((p): p is ProductWithOffers => !!p && !seen.has(p.id) && !!seen.add(p.id));
}
