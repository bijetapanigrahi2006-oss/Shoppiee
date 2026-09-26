import type {
  Coupon,
  Offer,
  PricePoint,
  Product,
  ProductWithOffers,
  Review,
  SearchFilters,
  StoreId,
} from "@/lib/types";

export interface ResolvedUrl {
  store: StoreId | null;
  product: ProductWithOffers | null;
  /** 0..1 — how confident we are the pasted link maps to this catalog product. */
  confidence: number;
}

export interface SimilarQuery {
  type?: string;
  category?: string;
  color?: string;
  style?: string;
  material?: string;
  brand?: string;
  keywords?: string[];
}

export interface SimilarResult {
  product: ProductWithOffers;
  similarity: number; // 0..100
}

/**
 * Every data source (mock catalog today, SerpAPI / affiliate APIs later)
 * implements this interface so the UI never needs to change.
 */
export interface ProductProvider {
  search(query: string, filters?: SearchFilters): Promise<ProductWithOffers[]>;
  getProduct(id: string): Promise<ProductWithOffers | null>;
  getOffers(productId: string): Promise<Offer[]>;
  getPriceHistory(offerId: string, days?: number): Promise<PricePoint[]>;
  getReviews(productId: string): Promise<{ reviews: Review[]; complaints: string[]; pros: string[] }>;
  getCoupons(store?: StoreId): Promise<Coupon[]>;
  resolveUrl(url: string): Promise<ResolvedUrl>;
  findSimilar(q: SimilarQuery, limit?: number): Promise<SimilarResult[]>;
  listProducts(filters?: SearchFilters): Promise<ProductWithOffers[]>;
}

export type { Product };
