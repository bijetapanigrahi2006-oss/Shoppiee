import { notFound } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { CheckoutFlow, type CheckoutStore } from "@/components/checkout/CheckoutFlow";
import { withPhoto, type ProductSnapshot } from "@/lib/snapshot";
import type { StoreId } from "@/lib/types";
import { photoOf } from "@/lib/providers/mock/catalog";

export default async function CheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  const [{ data: session }, { data: cart }, { data: orders }] = await Promise.all([
    supabase.from("checkout_sessions").select("*").eq("id", id).maybeSingle(),
    supabase.from("cart_items").select("*").eq("user_id", user.id),
    supabase.from("orders").select("*").eq("checkout_id", id).order("placed_at"),
  ]);
  if (!session) notFound();

  const stores: CheckoutStore[] = (session.stores as { store: StoreId; status: "pending" | "ordered" | "skipped" }[]).map((s) => ({
    store: s.store,
    status: s.status,
    items: (cart ?? [])
      .filter((c) => c.store === s.store)
      .map((c) => ({ productId: c.product_id, qty: c.qty, price: Number(c.price_snapshot), url: c.url, snapshot: withPhoto(c.product_id, c.snapshot as ProductSnapshot) })),
  }));

  return (
    <CheckoutFlow
      checkoutId={id}
      total={Number(session.total)}
      stores={stores}
      orders={(orders ?? []).map((o) => ({ id: o.id, store: o.store, amount: Number(o.amount), expected: o.expected_delivery, items: (o.items as { productId: string; name: string; photo?: string; category: string; qty: number }[]).map((i) => ({ ...i, photo: i.photo || photoOf(i.productId).photo })), storeOrderId: o.store_order_id }))}
    />
  );
}
