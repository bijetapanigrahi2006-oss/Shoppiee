export type CategoryId =
  | "grocery"
  | "snacks"
  | "fashion"
  | "beauty"
  | "electronics"
  | "laptops"
  | "mobiles"
  | "jewellery"
  | "home"
  | "sports"
  | "books"
  | "toys"
  | "footwear";

export type StoreId =
  | "amazon"
  | "flipkart"
  | "myntra"
  | "ajio"
  | "nykaa"
  | "snapdeal"
  | "tatacliq"
  | "croma"
  | "reliancedigital"
  | "titan"
  | "meesho"
  | "bigbasket"
  | "blinkit"
  | "jiomart";

export interface Store {
  id: StoreId;
  name: string;
  color: string;
  domain: string;
  /** Builds a real outbound search URL on the store for a product name. */
  searchUrl: (q: string) => string;
  ordersUrl: string;
  deliveryDays: [number, number];
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: CategoryId;
  subcategory: string;
  image: string; // legacy emoji, no longer shown in the UI
  photo: string; // real product photo (served from /public/products)
  photoFit: "cover" | "contain";
  photoCredit?: string;
  description: string;
  specs: Record<string, string | number>;
  tags: string[];
  /** Visual attributes used for screenshot/lookalike matching. */
  attributes: { color?: string; style?: string; material?: string; type: string };
  rating: number;
  reviewCount: number;
  mrp: number;
}

export interface Offer {
  id: string; // `${productId}:${storeId}`
  productId: string;
  store: StoreId;
  price: number;
  mrp: number; // "advertised" reference price at this store
  inStock: boolean;
  shipping: number;
  url: string;
  cashbackPct: number;
}

export interface PricePoint {
  date: string; // YYYY-MM-DD
  price: number;
}

export interface Review {
  id: string;
  productId: string;
  rating: number;
  title: string;
  body: string;
  author: string;
  date: string;
}

export interface Coupon {
  id: string;
  store: StoreId;
  code: string;
  description: string;
  kind: "flat" | "percent" | "bank";
  value: number;
  minOrder: number;
  maxDiscount?: number;
  categories?: CategoryId[];
}

export interface SearchFilters {
  category?: CategoryId;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  stores?: StoreId[];
  sort?: "relevance" | "price_asc" | "price_desc" | "rating" | "score";
}

export interface ProductWithOffers extends Product {
  offers: Offer[];
  bestOffer: Offer;
}
