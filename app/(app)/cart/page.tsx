import { EmptyState } from "@/components/ui/EmptyState";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { requireUser } from "@/lib/supabase/server";
import { STORES } from "@/lib/stores";
import type { StoreId } from "@/lib/types";
import { withPhoto, type ProductSnapshot } from "@/lib/snapshot";
import { inr } from "@/lib/utils";
import { ProductArt } from "@/components/product/ProductArt";
import { CartQty, CheckoutButton } from "@/components/cart/CartControls";
import { PageHeader } from "@/components/ui/Section";

export default async function CartPage() {
  const { supabase, user } = await requireUser();
  const { data: items } = await supabase.from("cart_items").select("*").eq("user_id", user.id).order("created_at");
  const groups = new Map<string, NonNullable<typeof items>>();
  for (const it of items ?? []) groups.set(it.store, [...(groups.get(it.store) ?? []), it]);
  const total = (items ?? []).reduce((s, i) => s + Number(i.price_snapshot) * i.qty, 0);
  const mrpTotal = (items ?? []).reduce((s, i) => s + Number((i.snapshot as ProductSnapshot).mrp) * i.qty, 0);

  return (
    <div>
      <PageHeader icon={<ShoppingBag />} gradient="linear-gradient(135deg,#f97316,#db2777 55%,#7c3aed)" title="Your cart" subtitle="One cart across every store. At checkout I'll take you to each store one by one — you pay safely on their site." />
      {!items?.length ? (
        <EmptyState icon={ShoppingBag} title="Your cart is empty" body="Find something you love and add it from any store." gradient="linear-gradient(135deg,#f97316,#db2777)">
          <Link href="/" className="btn btn-primary">
            Start shopping
          </Link>
        </EmptyState>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-5">
            {[...groups.entries()].map(([store, list]) => {
              const s = STORES[store as StoreId];
              const sub = list.reduce((a, i) => a + Number(i.price_snapshot) * i.qty, 0);
              return (
                <div key={store} className="card overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 text-white" style={{ background: s.color }}>
                    <p className="font-display text-lg font-semibold">{s.name}</p>
                    <p className="text-sm font-semibold">{inr(sub)}</p>
                  </div>
                  <ul className="divide-y divide-line">
                    {list.map((i) => {
                      const snap = i.snapshot as ProductSnapshot;
                      return (
                        <li key={i.id} className="flex flex-wrap items-center gap-4 p-4">
                          <ProductArt photo={withPhoto(i.product_id, snap).photo} fit={withPhoto(i.product_id, snap).photoFit} category={snap.category} alt={snap.name} className="h-16 w-16 text-3xl" />
                          <div className="min-w-0 flex-1">
                            <Link href={`/product/${i.product_id}`} className="line-clamp-2 font-semibold hover:underline">
                              {snap.name}
                            </Link>
                            <p className="text-xs text-muted">{snap.brand}</p>
                          </div>
                          <CartQty id={i.id} qty={i.qty} />
                          <p className="w-24 text-right font-bold">{inr(Number(i.price_snapshot) * i.qty)}</p>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
          <aside className="card h-fit space-y-4 p-5 lg:sticky lg:top-24">
            <p className="font-display text-lg font-semibold">Order summary</p>
            <ul className="space-y-1.5 text-sm">
              {[...groups.entries()].map(([store, list]) => (
                <li key={store} className="flex justify-between">
                  <span style={{ color: STORES[store as StoreId].color }} className="font-semibold">
                    {STORES[store as StoreId].name}
                  </span>
                  <span>{inr(list.reduce((a, i) => a + Number(i.price_snapshot) * i.qty, 0))}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-line pt-3">
              {mrpTotal > total && (
                <p className="flex justify-between text-sm text-good">
                  <span>You save vs MRP</span>
                  <span>{inr(mrpTotal - total)}</span>
                </p>
              )}
              <p className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>{inr(total)}</span>
              </p>
              <p className="text-xs text-muted">Across {groups.size} store{groups.size > 1 ? "s" : ""}. Final prices may differ slightly on each store.</p>
            </div>
            <CheckoutButton stores={groups.size} />
            <p className="text-center text-xs text-muted">Shoppiee never takes payment. You pay directly on each store.</p>
          </aside>
        </div>
      )}
    </div>
  );
}
