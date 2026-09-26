"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Plus, BookmarkPlus } from "lucide-react";
import { createList } from "@/app/actions";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

const TINTS = ["#a855f7", "#ec4899", "#f43f5e", "#f97316", "#f59e0b", "#84cc16", "#22c55e", "#14b8a6", "#06b6d4", "#3b82f6", "#6366f1", "#eab308"];

export function NewListButton({ className, label = "New list" }: { className?: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState<string>(TINTS[0]);
  const [items, setItems] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <>
      <button className={cn("btn btn-outline", className)} onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> {label}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
            <motion.form
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="card w-full max-w-md space-y-4 p-6"
              onClick={(e) => e.stopPropagation()}
              onSubmit={(e) => {
                e.preventDefault();
                start(async () => {
                  const list = items
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean)
                    .map((title) => ({ title }));
                  const r = await createList(name.trim() || "My list", emoji, list);
                  if (r.ok) {
                    toast("List created", emoji);
                    setOpen(false);
                    router.push(`/lists/${r.id}`);
                  } else toast(r.error, "⚠️");
                });
              }}
            >
              <h2 className="font-display text-xl font-semibold">Create a shopping list</h2>
              <div className="flex flex-wrap gap-2">
                {TINTS.map((e) => (
                  <button type="button" key={e} aria-label={`Colour ${e}`} onClick={() => setEmoji(e)} className={cn("h-9 w-9 rounded-full transition hover:scale-110", emoji === e && "ring-2 ring-white ring-offset-2 ring-offset-transparent")} style={{ background: e }}>
                    <span className="sr-only">{e}</span>
                  </button>
                ))}
              </div>
              <input className="input" placeholder="List name, e.g. Diwali shopping" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
              <textarea className="input min-h-28" placeholder={"What do you need? One per line\nsunscreen\nwhite sneakers\nbananas"} value={items} onChange={(e) => setItems(e.target.value)} />
              <div className="flex justify-end gap-2">
                <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" disabled={pending}>
                  {pending && <Loader2 className="h-4 w-4 animate-spin" />} Create list
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function SaveListButton({
  name,
  emoji,
  items,
  source = "ai",
  className,
}: {
  name: string;
  emoji: string;
  items: { title: string; productId?: string }[];
  source?: "ai" | "user";
  className?: string;
}) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <button
      className={cn("btn btn-ghost btn-sm", className)}
      disabled={pending}
      onClick={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await createList(name, emoji, items, source);
          if (r.ok) {
            toast(`Saved “${name}” to your lists`, emoji);
            router.push(`/lists/${r.id}`);
          } else toast(r.error, "⚠️");
        });
      }}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookmarkPlus className="h-4 w-4" />} Save list
    </button>
  );
}
