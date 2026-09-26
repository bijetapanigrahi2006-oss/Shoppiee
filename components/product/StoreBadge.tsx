import { STORES } from "@/lib/stores";
import { themeFor } from "@/lib/theme/categories";
import type { StoreId } from "@/lib/types";
import { cn } from "@/lib/utils";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

export function StoreBadge({ store, className }: { store: string; className?: string }) {
  const s = STORES[store as StoreId];
  const color = s?.color ?? "#888";
  return (
    <span className={cn("chip border", className)} style={{ background: `${color}1f`, color, borderColor: `${color}40` }}>
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
      {s?.name ?? store}
    </span>
  );
}

export function CategoryChip({ category, label, className }: { category: string; label?: string; className?: string }) {
  const t = themeFor(category);
  return (
    <span className={cn("chip border", className)} style={{ background: `${t.accent}1f`, color: t.accent, borderColor: `${t.accent}40` }}>
      <CategoryIcon category={category} className="h-3.5 w-3.5" /> {label ?? t.label}
    </span>
  );
}
