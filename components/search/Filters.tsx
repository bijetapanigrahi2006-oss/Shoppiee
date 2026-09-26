"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, List } from "lucide-react";
import { STORE_LIST } from "@/lib/stores";
import { cn } from "@/lib/utils";

export function SearchFilters({ availableStores }: { availableStores: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function set(key: string, value: string | null) {
    const next = new URLSearchParams(params.toString());
    if (value == null || value === "") next.delete(key);
    else next.set(key, value);
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  }

  const stores = params.get("stores")?.split(",").filter(Boolean) ?? [];
  const view = params.get("view") ?? "grid";

  return (
    <div className="card flex flex-wrap items-center gap-3 p-3">
      <select className="input w-auto py-2 text-sm" value={params.get("sort") ?? "score"} onChange={(e) => set("sort", e.target.value)}>
        <option value="score">Sort: Best match (Shoppiee score)</option>
        <option value="price_asc">Price: low to high</option>
        <option value="price_desc">Price: high to low</option>
        <option value="rating">Rating</option>
      </select>
      <select className="input w-auto py-2 text-sm" value={params.get("rating") ?? ""} onChange={(e) => set("rating", e.target.value)}>
        <option value="">Any rating</option>
        <option value="4">4★ & up</option>
        <option value="4.3">4.3★ & up</option>
      </select>
      <input
        className="input w-32 py-2 text-sm"
        placeholder="Max ₹"
        inputMode="numeric"
        defaultValue={params.get("max") ?? ""}
        onKeyDown={(e) => e.key === "Enter" && set("max", (e.target as HTMLInputElement).value.replace(/\D/g, ""))}
        onBlur={(e) => set("max", e.target.value.replace(/\D/g, ""))}
      />
      <div className="flex flex-wrap gap-1.5">
        {STORE_LIST.filter((s) => availableStores.includes(s.id)).map((s) => {
          const on = stores.includes(s.id);
          return (
            <button
              key={s.id}
              className={cn("chip border transition", on ? "text-white" : "border-line bg-surface")}
              style={on ? { background: s.color, borderColor: s.color } : { color: s.color }}
              onClick={() => set("stores", (on ? stores.filter((x) => x !== s.id) : [...stores, s.id]).join(","))}
            >
              {s.name}
            </button>
          );
        })}
      </div>
      <div className="ml-auto flex rounded-full bg-surface-2 p-1">
        {(["grid", "list"] as const).map((v) => (
          <button key={v} aria-label={`${v} view`} className={cn("rounded-full p-1.5", view === v && "bg-surface shadow")} onClick={() => set("view", v)}>
            {v === "grid" ? <LayoutGrid className="h-4 w-4" /> : <List className="h-4 w-4" />}
          </button>
        ))}
      </div>
    </div>
  );
}
