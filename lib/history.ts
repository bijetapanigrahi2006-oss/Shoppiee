import "server-only";
import { createClient } from "@/lib/supabase/server";
import { snapshotOf } from "@/lib/snapshot";
import type { ProductWithOffers } from "@/lib/types";

/** Best-effort activity logging; never blocks or breaks page rendering. */
export async function logSearch(query: string, kind: "search" | "assistant" | "link" | "image" = "search") {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !query.trim()) return;
    await supabase.from("search_history").insert({ user_id: user.id, query: query.slice(0, 500), kind });
  } catch {
    /* ignore */
  }
}

export async function logView(product: ProductWithOffers) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("viewed_products")
      .upsert({ user_id: user.id, product_id: product.id, snapshot: snapshotOf(product), viewed_at: new Date().toISOString() });
  } catch {
    /* ignore */
  }
}
