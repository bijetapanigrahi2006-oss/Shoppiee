import { CreditCard } from "lucide-react";
import { requireUser } from "@/lib/supabase/server";
import { STORES } from "@/lib/stores";
import type { StoreId } from "@/lib/types";
import { formatDate, inr } from "@/lib/utils";
import { PageHeader } from "@/components/ui/Section";

const REFUNDED = new Set(["cancelled", "returned"]);

export default async function PaymentsPage() {
  const { supabase, user } = await requireUser();
  const { data: orders } = await supabase.from("orders").select("*").eq("user_id", user.id).order("placed_at", { ascending: false });
  const list = orders ?? [];
  const spent = list.filter((o) => !REFUNDED.has(o.status)).reduce((s, o) => s + Number(o.amount), 0);
  const refunded = list.filter((o) => REFUNDED.has(o.status)).reduce((s, o) => s + Number(o.amount), 0);
  const byStore = new Map<string, number>();
  for (const o of list) if (!REFUNDED.has(o.status)) byStore.set(o.store, (byStore.get(o.store) ?? 0) + Number(o.amount));
  const maxStore = Math.max(1, ...byStore.values());

  return (
    <div className="space-y-6">
      <PageHeader icon={<CreditCard />} gradient="linear-gradient(135deg,#0d9488,#2563eb 60%,#7c3aed)" title="Payment history" subtitle="What you've paid to each store (payments are made on the stores themselves)." />
      <div className="grid gap-4 sm:grid-cols-3">
        <Tile label="Total spent" value={inr(spent)} color="#8b5cf6" />
        <Tile label="Refunded / cancelled" value={inr(refunded)} color="#16a34a" />
        <Tile label="Orders" value={String(list.length)} color="#f97316" />
      </div>
      {byStore.size > 0 && (
        <div className="card p-5">
          <p className="mb-3 font-display text-lg font-semibold">By store</p>
          <div className="space-y-2">
            {[...byStore.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([store, amt]) => {
                const s = STORES[store as StoreId];
                return (
                  <div key={store} className="flex items-center gap-3 text-sm">
                    <span className="w-28 font-semibold" style={{ color: s?.color }}>
                      {s?.name ?? store}
                    </span>
                    <div className="h-3 flex-1 overflow-hidden rounded-full bg-surface-2">
                      <div className="h-full rounded-full" style={{ width: `${(amt / maxStore) * 100}%`, background: s?.color }} />
                    </div>
                    <span className="w-24 text-right font-semibold">{inr(amt)}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase text-muted">
              <th className="p-3">Date</th>
              <th className="p-3">Store</th>
              <th className="p-3">Order ID</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {list.map((o) => (
              <tr key={o.id} className="border-b border-line last:border-0">
                <td className="p-3">{formatDate(o.placed_at, { day: "numeric", month: "short", year: "numeric" })}</td>
                <td className="p-3 font-semibold" style={{ color: STORES[o.store as StoreId]?.color }}>
                  {STORES[o.store as StoreId]?.name ?? o.store}
                </td>
                <td className="p-3 text-muted">{o.store_order_id ?? "—"}</td>
                <td className="p-3 capitalize">{String(o.status).replace("_", " ")}</td>
                <td className={`p-3 text-right font-bold ${REFUNDED.has(o.status) ? "text-good line-through" : ""}`}>{inr(o.amount)}</td>
              </tr>
            ))}
            {!list.length && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted">
                  No payments yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Tile({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="card p-5" style={{ borderLeft: `5px solid ${color}` }}>
      <p className="text-sm text-muted">{label}</p>
      <p className="font-display text-2xl font-bold">{value}</p>
    </div>
  );
}
