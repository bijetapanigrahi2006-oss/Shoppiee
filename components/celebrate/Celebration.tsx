"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";
import { PartyPopper, ShoppingBag } from "lucide-react";

export function fireConfetti(big = false) {
  if (typeof window === "undefined") return;
  if (document.documentElement.dataset.motion === "reduced") return;
  const colors = ["#f43f5e", "#f59e0b", "#22c55e", "#06b6d4", "#a855f7", "#ec4899"];
  confetti({ particleCount: big ? 160 : 90, spread: big ? 100 : 75, origin: { y: 0.6 }, colors, scalar: 1.1 });
  if (big) {
    const end = Date.now() + 1400;
    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0 }, colors });
      confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }
}

/** Full-screen "order placed" moment: animated check, confetti and a happy message. */
export function Celebration({ show, title, subtitle, emoji = "bag", big, onDone }: { show: boolean; title: string; subtitle?: string; emoji?: string; big?: boolean; onDone?: () => void }) {
  useEffect(() => {
    if (!show) return;
    fireConfetti(big);
    if (!onDone) return;
    const t = setTimeout(onDone, big ? 3200 : 2400);
    return () => clearTimeout(t);
  }, [show, big, onDone]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div className="fixed inset-0 z-[90] grid place-items-center bg-black/35 p-6 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onDone}>
          <motion.div
            initial={{ scale: 0.6, y: 40, rotate: -4 }}
            animate={{ scale: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 14, stiffness: 200 }}
            className="card relative w-full max-w-sm overflow-hidden p-8 text-center"
          >
            <div className="absolute inset-x-0 top-0 h-1.5 brand-bg" />
            <div className="pointer-events-none absolute left-1/2 top-10 h-40 w-40 -translate-x-1/2 rounded-full bg-emerald-400/30 blur-3xl" />
            <svg viewBox="0 0 120 120" className="relative mx-auto h-28 w-28">
              <defs>
                <linearGradient id="celebrate-g" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#34d399" />
                  <stop offset="1" stopColor="#22d3ee" />
                </linearGradient>
              </defs>
              <motion.circle cx="60" cy="60" r="52" fill="none" stroke="url(#celebrate-g)" strokeWidth="8" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, ease: "easeOut" }} />
              <motion.path d="M36 62 L54 80 L86 44" fill="none" stroke="url(#celebrate-g)" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.45, duration: 0.45, ease: "easeOut" }} />
            </svg>
            <motion.span
              className="relative mx-auto mt-3 grid h-12 w-12 place-items-center rounded-2xl text-white shadow-lg brand-bg"
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: [0, 1.25, 1], rotate: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
            >
              {emoji === "big" ? <PartyPopper className="h-6 w-6" /> : <ShoppingBag className="h-6 w-6" />}
            </motion.span>
            <h2 className="mt-3 font-display text-2xl font-bold">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
