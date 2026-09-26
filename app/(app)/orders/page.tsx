import { EmptyState } from "@/components/ui/EmptyState";
import { Package } from "lucide-react";
import Link from "next/link";
import { requireUser } from "@/lib/supabase/server";
import { STORES } from "@/lib/stores";
import type { StoreId } from "@/lib/types";
import { formatDate, inr } from "@/lib/utils";
import { photoOf } from "@/lib/providers/mock/catalog";
import { ProductArt } from "@/components/product/ProductArt";
import { OrderActions } from "@/components/orders/OrderActions";
import { PageHeader } from "@/components/ui/Section";

const STATUS: Record<string, { label: string; color: string; step: number }> = {
  placed: { label: "Order placed", color: "#8b5cf6", step: 0 },
  shipped: { label: "Shipped", color: "#0ea5e9", step: 1 },
  delivered: { label: "Delivered", color: "#16a34a", step: 2 },
  cancel_requested: { label: "Cancellation requested", color: "#d97706", step: -1 },
  cancelled: { label: "Cancelled", color: "#dc2626", step: -1 },
  return_requested: { label: "Return requested", color: "#d97706", step: -1 },
  returned: { label: "Returned", color: "#64748b", step: -1 },
};

/** Estimate progress from dates when the user hasn't updated status manually. */
function effectiveStatus(o: { status: string; placed_at: string; expected_delivery: string | null }) {
  if (o.status !== "placed" && o.status !== "shipped") return o.status;
  const now = Date.now();
  if (o.expected_delivery && now > new Date(o.expected_delivery).getTime() + 86400000) return "delivered";
  if (now - new Date(o.placed_at).getTime() > 86400000) return "shipped";
  return o.status;
}

export default async function OrdersPage() {
  const { supabase, user } = await requireUser();
  const { data: orders } = await supabase.from("orders").select("*").eq("user_id", user.id).order("placed_at", { ascending: false });

  return (
    <div>
      <PageHeader icon={<Package />} gradient="linear-gradient(135deg,#0ea5e9,#6366f1 55%,#a855f7)" title="Buying history" subtitle="Everything you've ordered through Shoppiee — what's arriving when, plus quick cancel & return links." />
      {!orders?.length ? (
        <EmptyState icon={Package} title="No orders yet" body="Orders you place through Shoppiee checkout show up here with delivery dates." gradient="linear-gradient(135deg,#0ea5e9,#8b5cf6)">
          <Link href="/" className="btn btn-primary">
            Find something great
          </Link>
        </EmptyState>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => {
            const s = STORES[o.store as StoreId];
            const status = effectiveStatus(o);
            const st = STATUS[status] ?? STATUS.placed;
            return (
              <div key={o.id} className="card overflow-hidden">
                <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl font-display text-lg font-bold text-white" style={{ background: s?.color }}>
                    {s?.name[0]}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold">
                      {s?.name} {o.store_order_id && <span className="text-xs text-muted">#{o.store_order_id}</span>}
                    </p>
                    <p className="text-xs text-muted">Ordered {formatDate(o.placed_at, { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                  <span className="chip text-white" style={{ background: st.color }}>
                    {st.label}
                  </span>
                  <p className="w-24 text-right font-bold">{inr(o.amount)}</p>
                </div>
                <div className="grid gap-4 p-5 md:grid-cols-[1fr_auto]">
                  <ul className="space-y-2">
                    {(o.items as { productId: string; name: string; image: string; category: string; price: number; qty: number }[]).map((i) => (
                      <li key={i.productId} className="flex items-center gap-3">
                        <ProductArt photo={photoOf(i.productId).photo} fit={photoOf(i.productId).photoFit} category={i.category} alt={i.name} size="sm" />
                        <Link href={`/product/${i.productId}`} className="line-clamp-1 flex-1 text-sm font-medium hover:underline">
                          {i.name}
                        </Link>
                        <span className="text-sm text-muted">
                          ×{i.qty} · {inr(i.price * i.qty)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="min-w-60 space-y-3">
                    {st.step >= 0 && (
                      <div>
                        <div className="flex gap-1">
                          {[0, 1, 2].map((n) => (
                            <div key={n} className="h-2 flex-1 rounded-full" style={{ background: n <= st.step ? st.color : "var(--border)" }} />
                          ))}
                        </div>
                        <p className="mt-1.5 text-sm">
                          {status === "delivered" ? "Delivered" : "Arriving"} <b>{o.expected_delivery ? formatDate(o.expected_delivery, { weekday: "short", day: "numeric", month: "short" }) : "soon"}</b>
                        </p>
                      </div>
                    )}
                    <OrderActions id={o.id} status={status} storeName={s?.name ?? o.store} ordersUrl={o.store_order_url ?? s?.ordersUrl ?? "#"} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
