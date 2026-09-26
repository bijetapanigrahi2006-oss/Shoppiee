"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/supabase/server";
import { getProvider } from "@/lib/providers";
import { snapshotOf } from "@/lib/snapshot";
import { photoOf } from "@/lib/providers/mock/catalog";
import { STORES } from "@/lib/stores";
import { DISPLAY_COOKIE, type DisplayPrefs } from "@/lib/display";
import type { StoreId } from "@/lib/types";

type Result = { ok: true } | { ok: false; error: string };

async function productOrThrow(productId: string) {
  const p = await getProvider().getProduct(productId);
  if (!p) throw new Error("Product not found");
  return p;
}

// ───────────── cart ─────────────
export async function addToCart(productId: string, store?: StoreId): Promise<Result> {
  const { supabase, user } = await requireUser();
  const r = await putInCart(supabase, user.id, productId, store);
  revalidatePath("/", "layout");
  return r;
}

/** Adds several products in one go (curated lists, AI picks). */
export async function addManyToCart(items: { productId: string; store?: StoreId }[]): Promise<Result> {
  const { supabase, user } = await requireUser();
  for (const it of items.slice(0, 30)) {
    const r = await putInCart(supabase, user.id, it.productId, it.store);
    if (!r.ok) {
      revalidatePath("/", "layout");
      return r;
    }
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

async function putInCart(supabase: Awaited<ReturnType<typeof requireUser>>["supabase"], userId: string, productId: string, store?: StoreId): Promise<Result> {
  const p = await productOrThrow(productId);
  const snap = snapshotOf(p, store);
  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, qty")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .eq("store", snap.store)
    .maybeSingle();
  const { error } = existing
    ? await supabase.from("cart_items").update({ qty: existing.qty + 1 }).eq("id", existing.id)
    : await supabase.from("cart_items").insert({
        user_id: userId,
        product_id: productId,
        store: snap.store,
        price_snapshot: snap.price,
        url: snap.url,
        snapshot: snap,
      });
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function updateCartQty(id: string, qty: number): Promise<Result> {
  const { supabase } = await requireUser();
  const { error } = qty <= 0 ? await supabase.from("cart_items").delete().eq("id", id) : await supabase.from("cart_items").update({ qty }).eq("id", id);
  revalidatePath("/", "layout");
  return error ? { ok: false, error: error.message } : { ok: true };
}

// ───────────── wishlist ─────────────
export async function toggleWishlist(productId: string): Promise<{ ok: boolean; wished: boolean }> {
  const { supabase, user } = await requireUser();
  const { data: existing } = await supabase.from("wishlist").select("id").eq("user_id", user.id).eq("product_id", productId).maybeSingle();
  if (existing) {
    await supabase.from("wishlist").delete().eq("id", existing.id);
    revalidatePath("/", "layout");
    return { ok: true, wished: false };
  }
  const p = await productOrThrow(productId);
  const { error } = await supabase.from("wishlist").insert({ user_id: user.id, product_id: productId, snapshot: snapshotOf(p) });
  revalidatePath("/", "layout");
  return { ok: !error, wished: !error };
}

// ───────────── lists ─────────────
export async function createList(name: string, emoji = "🛍️", items: { title: string; productId?: string }[] = [], source: "user" | "ai" = "user") {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase.from("shopping_lists").insert({ user_id: user.id, name, emoji, source }).select("id").single();
  if (error || !data) return { ok: false as const, error: error?.message ?? "Could not create list" };
  if (items.length) {
    const provider = getProvider();
    const rows = await Promise.all(
      items.map(async (it) => {
        const p = it.productId ? await provider.getProduct(it.productId) : null;
        return { list_id: data.id, user_id: user.id, title: it.title, product_id: it.productId ?? null, snapshot: p ? snapshotOf(p) : null };
      }),
    );
    await supabase.from("list_items").insert(rows);
  }
  revalidatePath("/", "layout");
  return { ok: true as const, id: data.id as string };
}

export async function addListItem(listId: string, title: string, productId?: string): Promise<Result> {
  const { supabase, user } = await requireUser();
  const p = productId ? await getProvider().getProduct(productId) : null;
  const { error } = await supabase
    .from("list_items")
    .insert({ list_id: listId, user_id: user.id, title: p ? p.name : title, product_id: productId ?? null, snapshot: p ? snapshotOf(p) : null });
  revalidatePath(`/lists/${listId}`);
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function toggleListItem(id: string, done: boolean, listId: string): Promise<Result> {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("list_items").update({ done }).eq("id", id);
  revalidatePath(`/lists/${listId}`);
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function deleteListItem(id: string, listId: string): Promise<Result> {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("list_items").delete().eq("id", id);
  revalidatePath(`/lists/${listId}`);
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function deleteList(id: string): Promise<Result> {
  const { supabase } = await requireUser();
  const { error } = await supabase.from("shopping_lists").delete().eq("id", id);
  revalidatePath("/", "layout");
  return error ? { ok: false, error: error.message } : { ok: true };
}

// ───────────── guided checkout ─────────────
export async function startCheckout(): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const { supabase, user } = await requireUser();
  const { data: items } = await supabase.from("cart_items").select("*").eq("user_id", user.id);
  if (!items?.length) return { ok: false, error: "Your cart is empty" };
  const stores = [...new Set(items.map((i) => i.store as string))].map((store) => ({ store, status: "pending" }));
  const total = items.reduce((s, i) => s + Number(i.price_snapshot) * i.qty, 0);
  const { data, error } = await supabase.from("checkout_sessions").insert({ user_id: user.id, stores, total }).select("id").single();
  if (error || !data) return { ok: false, error: error?.message ?? "Could not start checkout" };
  return { ok: true, id: data.id };
}

export async function confirmStoreOrder(input: {
  checkoutId: string;
  store: StoreId;
  storeOrderId?: string;
  expectedDelivery?: string;
}): Promise<Result> {
  const { supabase, user } = await requireUser();
  const { data: session } = await supabase.from("checkout_sessions").select("*").eq("id", input.checkoutId).single();
  if (!session) return { ok: false, error: "Checkout not found" };
  const { data: items } = await supabase.from("cart_items").select("*").eq("user_id", user.id).eq("store", input.store);
  if (!items?.length) return { ok: false, error: "No items for this store" };

  const s = STORES[input.store];
  const fallbackEta = new Date(Date.now() + (s?.deliveryDays[1] ?? 5) * 86400000).toISOString().slice(0, 10);
  const amount = items.reduce((sum, i) => sum + Number(i.price_snapshot) * i.qty, 0);
  const { error } = await supabase.from("orders").insert({
    user_id: user.id,
    checkout_id: input.checkoutId,
    store: input.store,
    store_order_id: input.storeOrderId || null,
    items: items.map((i) => ({ productId: i.product_id, name: i.snapshot.name, photo: i.snapshot.photo ?? photoOf(i.product_id).photo, category: i.snapshot.category, price: Number(i.price_snapshot), qty: i.qty })),
    amount,
    expected_delivery: input.expectedDelivery || fallbackEta,
    store_order_url: s?.ordersUrl ?? null,
  });
  if (error) return { ok: false, error: error.message };

  await supabase.from("cart_items").delete().eq("user_id", user.id).eq("store", input.store);
  const stores = (session.stores as { store: string; status: string }[]).map((x) => (x.store === input.store ? { ...x, status: "ordered" } : x));
  const done = stores.every((x) => x.status !== "pending");
  await supabase
    .from("checkout_sessions")
    .update({ stores, status: done ? "completed" : "in_progress", completed_at: done ? new Date().toISOString() : null })
    .eq("id", input.checkoutId);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function skipStore(checkoutId: string, store: StoreId): Promise<Result> {
  const { supabase } = await requireUser();
  const { data: session } = await supabase.from("checkout_sessions").select("*").eq("id", checkoutId).single();
  if (!session) return { ok: false, error: "Checkout not found" };
  const stores = (session.stores as { store: string; status: string }[]).map((x) => (x.store === store ? { ...x, status: "skipped" } : x));
  const done = stores.every((x) => x.status !== "pending");
  await supabase.from("checkout_sessions").update({ stores, status: done ? "completed" : "in_progress" }).eq("id", checkoutId);
  revalidatePath(`/checkout/${checkoutId}`);
  return { ok: true };
}

// ───────────── orders ─────────────
const ORDER_STATUSES = ["placed", "shipped", "delivered", "cancel_requested", "cancelled", "return_requested", "returned"] as const;

export async function updateOrderStatus(id: string, status: (typeof ORDER_STATUSES)[number]): Promise<Result> {
  if (!ORDER_STATUSES.includes(status)) return { ok: false, error: "Invalid status" };
  const { supabase } = await requireUser();
  const { error } = await supabase.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
  revalidatePath("/orders");
  return error ? { ok: false, error: error.message } : { ok: true };
}

// ───────────── profile & display ─────────────
export async function updateProfile(input: { full_name?: string; avatar_style?: string; avatar_seed?: string; avatar_url?: string | null }): Promise<Result> {
  const { supabase, user } = await requireUser();
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, ...input, updated_at: new Date().toISOString() });
  revalidatePath("/", "layout");
  return error ? { ok: false, error: error.message } : { ok: true };
}

export async function saveDisplayPrefs(prefs: DisplayPrefs): Promise<Result> {
  const { supabase, user } = await requireUser();
  (await cookies()).set(DISPLAY_COOKIE, JSON.stringify(prefs), { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  const { error } = await supabase.from("profiles").upsert({ id: user.id, display_prefs: prefs, updated_at: new Date().toISOString() });
  revalidatePath("/", "layout");
  return error ? { ok: false, error: error.message } : { ok: true };
}

// ───────────── history & alerts ─────────────
export async function clearHistory(): Promise<Result> {
  const { supabase, user } = await requireUser();
  await supabase.from("search_history").delete().eq("user_id", user.id);
  await supabase.from("viewed_products").delete().eq("user_id", user.id);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function setPriceAlert(productId: string, targetPrice: number): Promise<Result> {
  const { supabase, user } = await requireUser();
  const p = await productOrThrow(productId);
  const { error } = await supabase
    .from("price_alerts")
    .upsert({ user_id: user.id, product_id: productId, target_price: targetPrice, snapshot: snapshotOf(p), active: true }, { onConflict: "user_id,product_id" });
  return error ? { ok: false, error: error.message } : { ok: true };
}
