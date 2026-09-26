import type { Store, StoreId } from "@/lib/types";

const enc = encodeURIComponent;

export const STORES: Record<StoreId, Store> = {
  amazon: {
    id: "amazon",
    name: "Amazon",
    color: "#ff9900",
    domain: "amazon.in",
    searchUrl: (q) => `https://www.amazon.in/s?k=${enc(q)}`,
    ordersUrl: "https://www.amazon.in/gp/css/order-history",
    deliveryDays: [1, 4],
  },
  flipkart: {
    id: "flipkart",
    name: "Flipkart",
    color: "#2874f0",
    domain: "flipkart.com",
    searchUrl: (q) => `https://www.flipkart.com/search?q=${enc(q)}`,
    ordersUrl: "https://www.flipkart.com/account/orders",
    deliveryDays: [2, 5],
  },
  myntra: {
    id: "myntra",
    name: "Myntra",
    color: "#ff3f6c",
    domain: "myntra.com",
    searchUrl: (q) => `https://www.myntra.com/${enc(q.toLowerCase().replace(/\s+/g, "-"))}`,
    ordersUrl: "https://www.myntra.com/my/orders",
    deliveryDays: [3, 6],
  },
  ajio: {
    id: "ajio",
    name: "AJIO",
    color: "#2c4152",
    domain: "ajio.com",
    searchUrl: (q) => `https://www.ajio.com/search/?text=${enc(q)}`,
    ordersUrl: "https://www.ajio.com/my-account/orders",
    deliveryDays: [3, 7],
  },
  nykaa: {
    id: "nykaa",
    name: "Nykaa",
    color: "#fc2779",
    domain: "nykaa.com",
    searchUrl: (q) => `https://www.nykaa.com/search/result/?q=${enc(q)}`,
    ordersUrl: "https://www.nykaa.com/my-orders",
    deliveryDays: [2, 5],
  },
  snapdeal: {
    id: "snapdeal",
    name: "Snapdeal",
    color: "#e40046",
    domain: "snapdeal.com",
    searchUrl: (q) => `https://www.snapdeal.com/search?keyword=${enc(q)}`,
    ordersUrl: "https://www.snapdeal.com/myorders",
    deliveryDays: [4, 8],
  },
  tatacliq: {
    id: "tatacliq",
    name: "Tata CLiQ",
    color: "#da1c5c",
    domain: "tatacliq.com",
    searchUrl: (q) => `https://www.tatacliq.com/search/?searchCategory=all&text=${enc(q)}`,
    ordersUrl: "https://www.tatacliq.com/my-account/orders",
    deliveryDays: [3, 6],
  },
  croma: {
    id: "croma",
    name: "Croma",
    color: "#00a19a",
    domain: "croma.com",
    searchUrl: (q) => `https://www.croma.com/searchB?q=${enc(q)}`,
    ordersUrl: "https://www.croma.com/my-account/orders",
    deliveryDays: [1, 4],
  },
  reliancedigital: {
    id: "reliancedigital",
    name: "Reliance Digital",
    color: "#e42529",
    domain: "reliancedigital.in",
    searchUrl: (q) => `https://www.reliancedigital.in/search?q=${enc(q)}`,
    ordersUrl: "https://www.reliancedigital.in/my-account/orders",
    deliveryDays: [2, 5],
  },
  titan: {
    id: "titan",
    name: "Titan",
    color: "#8b6b3d",
    domain: "titan.co.in",
    searchUrl: (q) => `https://www.titan.co.in/search?q=${enc(q)}`,
    ordersUrl: "https://www.titan.co.in/my-account/orders",
    deliveryDays: [3, 7],
  },
  meesho: {
    id: "meesho",
    name: "Meesho",
    color: "#9f2089",
    domain: "meesho.com",
    searchUrl: (q) => `https://www.meesho.com/search?q=${enc(q)}`,
    ordersUrl: "https://www.meesho.com/my-orders",
    deliveryDays: [4, 9],
  },
  bigbasket: {
    id: "bigbasket",
    name: "BigBasket",
    color: "#84c225",
    domain: "bigbasket.com",
    searchUrl: (q) => `https://www.bigbasket.com/ps/?q=${enc(q)}`,
    ordersUrl: "https://www.bigbasket.com/order/list/",
    deliveryDays: [0, 1],
  },
  blinkit: {
    id: "blinkit",
    name: "Blinkit",
    color: "#f8cb46",
    domain: "blinkit.com",
    searchUrl: (q) => `https://blinkit.com/s/?q=${enc(q)}`,
    ordersUrl: "https://blinkit.com/account/orders",
    deliveryDays: [0, 0],
  },
  jiomart: {
    id: "jiomart",
    name: "JioMart",
    color: "#0078ad",
    domain: "jiomart.com",
    searchUrl: (q) => `https://www.jiomart.com/search/${enc(q)}`,
    ordersUrl: "https://www.jiomart.com/customer/orderhistory",
    deliveryDays: [1, 3],
  },
};

export const STORE_LIST = Object.values(STORES);

export function storeName(id: string): string {
  return STORES[id as StoreId]?.name ?? id;
}

/** Detect which store a pasted URL belongs to. */
export function detectStore(url: string): StoreId | null {
  let host: string;
  try {
    host = new URL(url.trim()).hostname.toLowerCase();
  } catch {
    return null;
  }
  if (host.includes("amzn")) return "amazon";
  if (host.includes("fkrt")) return "flipkart";
  for (const s of STORE_LIST) {
    const root = s.domain.split(".")[0];
    if (host.includes(root)) return s.id;
  }
  return null;
}
