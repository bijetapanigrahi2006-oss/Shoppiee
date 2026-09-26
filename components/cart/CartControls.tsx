"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Loader2, Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import { startCheckout, updateCartQty } from "@/app/actions";
import { toast } from "@/components/ui/toast";

export function CartQty({ id, qty }: { id: string; qty: number }) {
  const [pending, start] = useTransition();
  const set = (n: number) => start(async () => void (await updateCartQty(id, n)));
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center rounded-full bg-surface-2">
        <button className="p-2" onClick={() => set(qty - 1)} disabled={pending} aria-label="Decrease">
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-6 text-center text-sm font-semibold">{pending ? <Loader2 className="mx-auto h-3.5 w-3.5 animate-spin" /> : qty}</span>
        <button className="p-2" onClick={() => set(qty + 1)} disabled={pending} aria-label="Increase">
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
      <button className="rounded-full p-2 text-muted hover:bg-red-500/10 hover:text-bad" onClick={() => set(0)} disabled={pending} aria-label="Remove">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export function CheckoutButton({ stores }: { stores: number }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      className="btn btn-brand w-full py-3 text-base"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const r = await startCheckout();
          if (r.ok) router.push(`/checkout/${r.id}`);
          else toast(r.error, "⚠️");
        })
      }
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      Checkout {stores > 1 ? `(${stores} stores)` : ""} <ArrowRight className="h-4 w-4" />
    </button>
  );
}
