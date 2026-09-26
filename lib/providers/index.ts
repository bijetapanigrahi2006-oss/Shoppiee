import type { ProductProvider } from "./types";
import { mockProvider } from "./mock";

/**
 * Picks the product data source. Only "mock" exists today; a SerpAPI or
 * affiliate-API provider can implement ProductProvider and be selected here.
 */
export function getProvider(): ProductProvider {
  switch (process.env.DATA_PROVIDER ?? "mock") {
    case "mock":
    default:
      return mockProvider;
  }
}

export type { ProductProvider } from "./types";
