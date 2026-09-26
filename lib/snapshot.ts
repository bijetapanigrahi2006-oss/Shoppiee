import type { CategoryId, ProductWithOffers, StoreId } from "@/lib/types";
import { photoOf } from "@/lib/providers/mock/catalog";

/** Denormalised product info stored alongside user rows (cart, wishlist, lists…). */
export interface ProductSnapshot {
  name: string;
  brand: string;
  image: string; // legacy emoji
  photo?: string;
  photoFit?: "cover" | "contain";
  category: CategoryId;
  price: number;
  mrp: number;
  store: StoreId;
  url: string;
  rating: number;
}

export function snapshotOf(p: ProductWithOffers, store?: StoreId): ProductSnapshot {
  const offer = p.offers.find((o) => o.store === store) ?? p.bestOffer;
  return {
    name: p.name,
    brand: p.brand,
    image: p.image,
    photo: p.photo,
    photoFit: p.photoFit,
    category: p.category,
    price: offer.price,
    mrp: offer.mrp,
    store: offer.store,
    url: offer.url,
    rating: p.rating,
  };
}

/** Fills in the photo for snapshots saved before photos existed. */
export function withPhoto<T extends { photo?: string; photoFit?: "cover" | "contain" }>(productId: string, s: T): T & { photo: string; photoFit: "cover" | "contain" } {
  if (s.photo) return { ...s, photo: s.photo, photoFit: s.photoFit ?? "cover" };
  return { ...s, ...photoOf(productId) };
}

/** Shapes a catalog product into ProductCard props. */
export function cardFrom(p: ProductWithOffers) {
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    photo: p.photo,
    photoFit: p.photoFit,
    category: p.category,
    price: p.bestOffer.price,
    mrp: p.bestOffer.mrp,
    store: p.bestOffer.store,
    rating: p.rating,
    reviewCount: p.reviewCount,
    storeCount: p.offers.length,
  };
}

/** Card props from a stored snapshot (cart, wishlist, recently viewed). */
export function cardFromSnapshot(id: string, s: ProductSnapshot) {
  const ph = withPhoto(id, s);
  return { id, name: s.name, brand: s.brand, photo: ph.photo, photoFit: ph.photoFit, category: s.category, price: s.price, mrp: s.mrp, store: s.store, rating: s.rating };
}
