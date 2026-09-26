"use client";

import Link from "next/link";
import { create } from "zustand";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";

/** A follow-up the toast offers: go somewhere ("View cart") or do something ("Undo"). */
export interface ToastAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface Toast {
  id: number;
  text: string;
  error: boolean;
  action?: ToastAction;
}

const useToasts = create<{ toasts: Toast[]; push: (t: Omit<Toast, "id">) => void; remove: (id: number) => void }>((set) => ({
  toasts: [],
  push: (t) => set((s) => ({ toasts: [...s.toasts.slice(-2), { ...t, id: Date.now() + Math.random() }] })),
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

/** Shows a toast. Pass "error" (or the legacy "⚠️") as the tone for errors, and an optional follow-up action. */
export function toast(text: string, tone?: string, action?: ToastAction) {
  useToasts.getState().push({ text, error: tone === "error" || tone === "⚠️", action });
}

function ToastItem({ t }: { t: Toast }) {
  const remove = useToasts((s) => s.remove);
  useEffect(() => {
    const timer = setTimeout(() => remove(t.id), t.action ? 4200 : 2600);
    return () => clearTimeout(timer);
  }, [t.id, t.action, remove]);
  const actionClass = "ml-1 inline-flex items-center gap-1 rounded-full bg-accent/20 px-3 py-1 text-xs font-bold text-fg transition hover:bg-accent/35";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="glass-strong pointer-events-auto flex items-center gap-2.5 rounded-full border border-line py-2 pl-4 pr-2 text-sm font-medium shadow-2xl"
      role="status"
    >
      {t.error ? <AlertTriangle className="h-4 w-4 shrink-0 text-bad" /> : <CheckCircle2 className="h-4 w-4 shrink-0 text-good" />}
      <span className="pr-2">{t.text}</span>
      {t.action?.href && (
        <Link href={t.action.href} className={actionClass} onClick={() => remove(t.id)}>
          {t.action.label} <ArrowRight className="h-3 w-3" />
        </Link>
      )}
      {t.action && !t.action.href && (
        <button
          className={actionClass}
          onClick={() => {
            t.action?.onClick?.();
            remove(t.id);
          }}
        >
          {t.action.label}
        </button>
      )}
    </motion.div>
  );
}

export function Toaster() {
  const toasts = useToasts((s) => s.toasts);
  return (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[100] flex w-max max-w-[calc(100vw-2rem)] -translate-x-1/2 flex-col items-center gap-2">
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastItem key={t.id} t={t} />
        ))}
      </AnimatePresence>
    </div>
  );
}
