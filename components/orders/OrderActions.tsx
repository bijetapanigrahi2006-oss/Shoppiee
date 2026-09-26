"use client";

import { useTransition } from "react";
import { ExternalLink, Loader2, RotateCcw, XCircle, PackageCheck } from "lucide-react";
import { updateOrderStatus } from "@/app/actions";
import { toast } from "@/components/ui/toast";

/**
 * Stores don't expose cancel/return APIs, so these buttons open the store's own
 * orders page and record what the user did.
 */
export function OrderActions({ id, status, storeName, ordersUrl }: { id: string; status: string; storeName: string; ordersUrl: string }) {
  const [pending, start] = useTransition();
  const act = (next: Parameters<typeof updateOrderStatus>[1], msg: string, emoji: string, open = true) => {
    if (open) window.open(ordersUrl, "_blank", "noopener,noreferrer");
    start(async () => {
      const r = await updateOrderStatus(id, next);
      toast(r.ok ? msg : r.error, r.ok ? emoji : "⚠️");
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <a href={ordersUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
        Track on {storeName} <ExternalLink className="h-3.5 w-3.5" />
      </a>
      {pending && <Loader2 className="h-4 w-4 animate-spin self-center" />}
      {(status === "placed" || status === "shipped") && (
        <>
          <button className="btn btn-ghost btn-sm" onClick={() => act("delivered", "Marked as delivered", "📦", false)}>
            <PackageCheck className="h-3.5 w-3.5" /> Got it
          </button>
          <button className="btn btn-ghost btn-sm text-bad" onClick={() => act("cancel_requested", `Finish cancelling on ${storeName}`, "🛑")}>
            <XCircle className="h-3.5 w-3.5" /> Cancel
          </button>
        </>
      )}
      {status === "delivered" && (
        <button className="btn btn-ghost btn-sm" onClick={() => act("return_requested", `Finish your return on ${storeName}`, "↩️")}>
          <RotateCcw className="h-3.5 w-3.5" /> Return
        </button>
      )}
      {status === "cancel_requested" && (
        <button className="btn btn-ghost btn-sm" onClick={() => act("cancelled", "Marked as cancelled", "✅", false)}>
          Mark cancelled
        </button>
      )}
      {status === "return_requested" && (
        <button className="btn btn-ghost btn-sm" onClick={() => act("returned", "Marked as returned", "✅", false)}>
          Mark returned
        </button>
      )}
    </div>
  );
}
