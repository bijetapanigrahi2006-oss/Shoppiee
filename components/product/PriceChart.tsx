"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PricePoint } from "@/lib/types";
import { STORES } from "@/lib/stores";
import type { StoreId } from "@/lib/types";
import { cn, inr } from "@/lib/utils";

interface Props {
  series: { store: StoreId; history: PricePoint[] }[];
  accent: string;
  initialStore: StoreId;
}

const RANGES = [
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
  { label: "6M", days: 180 },
];

export function PriceChart({ series, accent, initialStore }: Props) {
  const [store, setStore] = useState<StoreId>(initialStore);
  const [days, setDays] = useState(90);
  const data = useMemo(() => (series.find((s) => s.store === store)?.history ?? []).slice(-days), [series, store, days]);
  const prices = data.map((d) => d.price);
  const low = Math.min(...prices);
  const high = Math.max(...prices);
  const avg = Math.round(prices.reduce((a, b) => a + b, 0) / (prices.length || 1));
  const current = prices[prices.length - 1];

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-lg font-semibold">Price history</h3>
        <div className="flex rounded-full bg-surface-2 p-1 text-xs font-semibold">
          {RANGES.map((r) => (
            <button key={r.days} className={cn("rounded-full px-3 py-1", days === r.days && "bg-surface shadow")} onClick={() => setDays(r.days)}>
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {series.map((s) => {
          const on = s.store === store;
          const c = STORES[s.store].color;
          return (
            <button key={s.store} onClick={() => setStore(s.store)} className="chip border" style={on ? { background: c, color: "white", borderColor: c } : { color: c, borderColor: `${c}55` }}>
              {STORES[s.store].name}
            </button>
          );
        })}
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
        {[
          ["Current", current],
          ["Average", avg],
          ["Lowest", low],
          ["Highest", high],
        ].map(([l, v]) => (
          <div key={l as string} className="rounded-xl bg-surface-2 p-2">
            <p className="text-muted">{l}</p>
            <p className={cn("text-sm font-bold", l === "Lowest" && "text-good", l === "Highest" && "text-bad")}>{inr(v as number)}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 h-60">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 4, right: 8, top: 8, bottom: 0 }}>
            <defs>
              <linearGradient id="pc" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accent} stopOpacity={0.35} />
                <stop offset="100%" stopColor={accent} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis dataKey="date" tickFormatter={(d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} tick={{ fontSize: 11, fill: "var(--muted)" }} minTickGap={40} />
            <YAxis domain={["dataMin - 100", "dataMax + 100"]} tickFormatter={(v: number) => `₹${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`} tick={{ fontSize: 11, fill: "var(--muted)" }} width={48} />
            <Tooltip
              contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
              labelFormatter={(d) => new Date(String(d)).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              formatter={(v) => [inr(Number(v)), "Price"]}
            />
            <ReferenceLine y={avg} stroke="var(--muted)" strokeDasharray="4 4" />
            <Area type="monotone" dataKey="price" stroke={accent} strokeWidth={2.5} fill="url(#pc)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
