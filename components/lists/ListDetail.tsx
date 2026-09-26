"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ListChecks, Loader2, Plus, ShoppingCart, Trash2, Search } from "lucide-react";
import { addListItem, addToCart, deleteList, deleteListItem, toggleListItem } from "@/app/actions";
import { STORES } from "@/lib/stores";
import type { StoreId } from "@/lib/types";
import { cn, inr } from "@/lib/utils";
import { ProductArt } from "@/components/product/ProductArt";
import { toast } from "@/components/ui/toast";

export interface ListRow {
  id: string;
  title: string;
  done: boolean;
  productId: string | null;
  photo: string;
  photoFit: "cover" | "contain";
  category: string;
  price: number | null;
  store: string | null;
  suggestion: boolean;
  suggestionName?: string;
}

export function ListDetail({ list, rows }: { list: { id: string; name: string; emoji: string; source: string }; rows: ListRow[] }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [pending, start] = useTransition();
  const total = rows.filter((r) => !r.done && r.price).reduce((s, r) => s + (r.price ?? 0), 0);
  const buyable = rows.filter((r) => !r.done && r.productId);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-center gap-4 rounded-3xl p-6" style={{ background: "linear-gradient(135deg, color-mix(in oklab, var(--accent) 20%, var(--surface)), var(--surface))" }}>
        <span className="grid h-14 w-14 place-items-center rounded-2xl text-white shadow-lg" style={{ background: String(list.emoji).startsWith("#") ? String(list.emoji) : "linear-gradient(135deg,#a855f7,#ec4899)" }}>
          <ListChecks className="h-6 w-6" />
        </span>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-bold">{list.name}</h1>
          <p className="text-sm text-muted">
            {rows.length} items · about <b className="text-fg">{inr(total)}</b> left to buy {list.source === "ai" && "· AI-curated"}
          </p>
        </div>
        <button
          className="btn btn-primary"
          disabled={pending || !buyable.length}
          onClick={() =>
            start(async () => {
              for (const r of buyable) await addToCart(r.productId!, (r.store as StoreId) ?? undefined);
              toast(`Added ${buyable.length} items to cart`, "🛒");
              router.refresh();
            })
          }
        >
          <ShoppingCart className="h-4 w-4" /> Add all to cart
        </button>
        <button
          className="btn btn-ghost text-bad"
          aria-label="Delete list"
          onClick={() => {
            if (!confirm(`Delete “${list.name}”?`)) return;
            start(async () => {
              await deleteList(list.id);
              router.push("/lists");
            });
          }}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <form
        className="card flex gap-2 p-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          start(async () => {
            await addListItem(list.id, text.trim());
            setText("");
            router.refresh();
          });
        }}
      >
        <input className="input border-0 focus:shadow-none" placeholder="Add an item… e.g. “face wash” or “AA batteries”" value={text} onChange={(e) => setText(e.target.value)} />
        <button className="btn btn-primary" disabled={pending || !text.trim()}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add
        </button>
      </form>

      <ul className="card divide-y divide-line">
        {rows.map((r) => (
          <li key={r.id} className={cn("flex flex-wrap items-center gap-3 p-4 transition", r.done && "opacity-50")}>
            <input
              type="checkbox"
              className="h-5 w-5 accent-[var(--accent)]"
              checked={r.done}
              onChange={(e) => start(async () => void (await toggleListItem(r.id, e.target.checked, list.id)))}
            />
            <ProductArt photo={r.photo} fit={r.photoFit} category={r.category} alt={r.title} size="sm" />
            <div className="min-w-0 flex-1">
              <p className={cn("font-medium", r.done && "line-through")}>{r.title}</p>
              {r.suggestion && r.productId && (
                <Link href={`/product/${r.productId}`} className="text-xs text-accent hover:underline">
                  Best match: {r.suggestionName}
                </Link>
              )}
            </div>
            {r.price != null && (
              <div className="text-right">
                <p className="font-bold">{inr(r.price)}</p>
                {r.store && (
                  <p className="text-xs" style={{ color: STORES[r.store as StoreId]?.color }}>
                    {STORES[r.store as StoreId]?.name}
                  </p>
                )}
              </div>
            )}
            <div className="flex gap-1">
              {r.productId ? (
                <button
                  className="rounded-full p-2 hover:bg-surface-2"
                  aria-label="Add to cart"
                  onClick={() =>
                    start(async () => {
                      const res = await addToCart(r.productId!, (r.store as StoreId) ?? undefined);
                      toast(res.ok ? "Added to cart" : res.error, res.ok ? "🛒" : "⚠️");
                    })
                  }
                >
                  <ShoppingCart className="h-4 w-4" />
                </button>
              ) : (
                <Link href={`/search?q=${encodeURIComponent(r.title)}`} className="rounded-full p-2 hover:bg-surface-2" aria-label="Search">
                  <Search className="h-4 w-4" />
                </Link>
              )}
              <button className="rounded-full p-2 text-muted hover:bg-red-500/10 hover:text-bad" aria-label="Remove" onClick={() => start(async () => void (await deleteListItem(r.id, list.id)))}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
        {!rows.length && <li className="p-8 text-center text-sm text-muted">This list is empty — add your first item above.</li>}
      </ul>
    </div>
  );
}
