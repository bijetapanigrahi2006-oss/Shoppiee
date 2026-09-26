"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { clearHistory } from "@/app/actions";
import { toast } from "@/components/ui/toast";

export function ClearHistoryButton() {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button
      className="btn btn-outline"
      disabled={pending}
      onClick={() => {
        if (!confirm("Clear all search and viewing history?")) return;
        start(async () => {
          await clearHistory();
          toast("History cleared", "🧹");
          router.refresh();
        });
      }}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Clear history
    </button>
  );
}
