"use client";

import { useState, useTransition } from "react";
import { BellRing, Loader2 } from "lucide-react";
import { setPriceAlert } from "@/app/actions";
import { toast } from "@/components/ui/toast";

export function PriceAlertButton({ productId, suggested }: { productId: string; suggested: number }) {
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState(String(suggested));
  const [pending, start] = useTransition();
  if (!open)
    return (
      <button className="btn btn-outline btn-sm" onClick={() => setOpen(true)}>
        <BellRing className="h-4 w-4" /> Price alert
      </button>
    );
  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await setPriceAlert(productId, Number(target));
          toast(r.ok ? `We'll watch for ₹${Number(target).toLocaleString("en-IN")} or less` : r.error, r.ok ? "🔔" : "⚠️");
          if (r.ok) setOpen(false);
        });
      }}
    >
      <span className="text-sm text-muted">Alert me at ₹</span>
      <input className="input w-28 py-1.5 text-sm" inputMode="numeric" value={target} onChange={(e) => setTarget(e.target.value.replace(/\D/g, ""))} />
      <button className="btn btn-primary btn-sm" disabled={pending || !target}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Set"}
      </button>
    </form>
  );
}
