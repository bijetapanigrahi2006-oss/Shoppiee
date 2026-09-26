"use client";

import { create } from "zustand";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface Toast {
  id: number;
  text: string;
  error: boolean;
}

const useToasts = create<{ toasts: Toast[]; push: (t: Omit<Toast, "id">) => void; remove: (id: number) => void }>((set) => ({
  toasts: [],
  push: (t) => set((s) => ({ toasts: [...s.toasts, { ...t, id: Date.now() + Math.random() }] })),
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

/** Shows a toast. Pass "error" (or the legacy "⚠️") as the second argument for errors. */
export function toast(text: string, tone?: string) {
  useToasts.getState().push({ text, error: tone === "error" || tone === "⚠️" });
}

function ToastItem({ t }: { t: Toast }) {
  const remove = useToasts((s) => s.remove);
  useEffect(() => {
    const timer = setTimeout(() => remove(t.id), 2600);
    return () => clearTimeout(timer);
  }, [t.id, remove]);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="glass-strong flex items-center gap-2.5 rounded-full border border-line px-4 py-2.5 text-sm font-medium shadow-2xl"
    >
      {t.error ? <AlertTriangle className="h-4 w-4 text-bad" /> : <CheckCircle2 className="h-4 w-4 text-good" />}
      {t.text}
    </motion.div>
  );
}

export function Toaster() {
  const toasts = useToasts((s) => s.toasts);
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 flex-col items-center gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastItem key={t.id} t={t} />
        ))}
      </AnimatePresence>
    </div>
  );
}
