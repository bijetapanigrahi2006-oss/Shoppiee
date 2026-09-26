import { ShieldCheck, ShieldAlert, Shield } from "lucide-react";
import type { RealityCheck as RC } from "@/lib/analysis/fakeDiscount";
import type { PriceStats } from "@/lib/analysis/priceStats";
import { inr } from "@/lib/utils";

/** "Sale Reality Check" — advertised discount vs. what price history says. */
export function RealityCheckCard({ reality, stats, price }: { reality: RC; stats: PriceStats; price: number }) {
  const tone = reality.level === "genuine" ? { c: "var(--good)", bg: "#22c55e1a", Icon: ShieldCheck } : reality.level === "inflated" ? { c: "var(--bad)", bg: "#ef44441a", Icon: ShieldAlert } : { c: "var(--warn)", bg: "#eab3081a", Icon: Shield };
  const real = Math.max(0, reality.realDiscountPct);
  const max = Math.max(reality.advertisedDiscountPct, real, 10);
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-3 p-4" style={{ background: tone.bg }}>
        <tone.Icon className="h-7 w-7" style={{ color: tone.c }} />
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Sale reality check</p>
          <p className="font-display text-lg font-semibold" style={{ color: tone.c }}>
            {reality.headline}
          </p>
        </div>
      </div>
      <div className="space-y-4 p-4">
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-xl bg-surface-2 p-2">
            <p className="text-muted">Today</p>
            <p className="text-sm font-bold">{inr(price)}</p>
          </div>
          <div className="rounded-xl bg-surface-2 p-2">
            <p className="text-muted">30-day avg</p>
            <p className="text-sm font-bold">{inr(stats.avg30)}</p>
          </div>
          <div className="rounded-xl bg-surface-2 p-2">
            <p className="text-muted">Lowest (6M)</p>
            <p className="text-sm font-bold text-good">{inr(stats.lowest)}</p>
          </div>
        </div>
        <div className="space-y-2 text-sm">
          <Bar label="Advertised discount" value={reality.advertisedDiscountPct} max={max} color="#a855f7" />
          <Bar label="Real discount (vs 30-day avg)" value={real} max={max} color={tone.c} suffix={reality.realDiscountPct < 0 ? " (pricier than usual)" : ""} />
        </div>
        <p className="text-sm text-muted">{reality.explanation}</p>
      </div>
    </div>
  );
}

function Bar({ label, value, max, color, suffix = "" }: { label: string; value: number; max: number; color: string; suffix?: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-muted">{label}</span>
        <span className="font-bold" style={{ color }}>
          {Math.round(value)}%{suffix}
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full" style={{ width: `${Math.max(2, (value / max) * 100)}%`, background: color }} />
      </div>
    </div>
  );
}
