import Link from "next/link";
import type { ProductInsight } from "@/lib/analysis/insights";
import { STORES } from "@/lib/stores";
import type { StoreId } from "@/lib/types";
import { inr } from "@/lib/utils";
import { ProductArt } from "@/components/product/ProductArt";

/** Price matrix: products × stores, cheapest cell highlighted. */
export function CompareTable({ items }: { items: ProductInsight[] }) {
  const stores = [...new Set(items.flatMap((i) => i.product.offers.map((o) => o.store)))] as StoreId[];
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
            <th className="p-3">Product</th>
            <th className="p-3">Rating</th>
            {stores.map((s) => (
              <th key={s} className="p-3" style={{ color: STORES[s].color }}>
                {STORES[s].name}
              </th>
            ))}
            <th className="p-3">Price check</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => {
            const p = i.product;
            const min = Math.min(...p.offers.filter((o) => o.inStock).map((o) => o.price));
            return (
              <tr key={p.id} className="border-b border-line last:border-0 hover:bg-surface-2/60">
                <td className="p-3">
                  <Link href={`/product/${p.id}`} className="flex items-center gap-2">
                    <ProductArt photo={p.photo} fit={p.photoFit} category={p.category} alt={p.name} size="sm" />
                    <span className="line-clamp-2 max-w-[16rem] font-medium">{p.name}</span>
                  </Link>
                </td>
                <td className="p-3 font-semibold">{p.rating}★</td>
                {stores.map((s) => {
                  const o = p.offers.find((x) => x.store === s);
                  if (!o) return <td key={s} className="p-3 text-muted">—</td>;
                  const best = o.inStock && o.price === min;
                  return (
                    <td key={s} className="p-3">
                      <a href={o.url} target="_blank" rel="noopener noreferrer" className={best ? "rounded-lg bg-green-500/15 px-2 py-1 font-bold text-good" : o.inStock ? "hover:underline" : "text-muted line-through"}>
                        {inr(o.price)}
                      </a>
                      {!o.inStock && <span className="block text-[10px] text-muted">Out of stock</span>}
                    </td>
                  );
                })}
                <td className="p-3">
                  <span
                    className="chip"
                    style={{
                      background: i.reality.level === "genuine" ? "#22c55e22" : i.reality.level === "inflated" ? "#ef444422" : "#eab30822",
                      color: i.reality.level === "genuine" ? "var(--good)" : i.reality.level === "inflated" ? "var(--bad)" : "var(--warn)",
                    }}
                  >
                    {i.reality.level === "genuine" ? "Great price" : i.reality.level === "inflated" ? "Fake discount" : "Fair"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
