"use client";

import { useEffect } from "react";

export type Signal = "cart" | "wish";

function reducedMotion() {
  return document.documentElement.dataset.motion === "reduced" || matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Tells the header that the cart or wishlist changed, so its icon can bump. */
export function signal(kind: Signal) {
  window.dispatchEvent(new CustomEvent(`shoppiee:${kind}`));
}

/** Runs `cb` whenever `signal(kind)` fires. */
export function useSignal(kind: Signal, cb: () => void) {
  useEffect(() => {
    window.addEventListener(`shoppiee:${kind}`, cb);
    return () => window.removeEventListener(`shoppiee:${kind}`, cb);
  }, [kind, cb]);
}

/** Flies a glowing dot from the pressed button to the header cart icon, then bumps the icon. */
export function flyToCart(from: Element | null) {
  const target = document.getElementById("cart-icon");
  if (!from || !target || reducedMotion()) return signal("cart");
  const a = from.getBoundingClientRect();
  const b = target.getBoundingClientRect();
  const dx = b.left + b.width / 2 - (a.left + a.width / 2);
  const dy = b.top + b.height / 2 - (a.top + a.height / 2);
  const dot = document.createElement("div");
  dot.className = "fly-dot";
  dot.style.left = `${a.left + a.width / 2 - 11}px`;
  dot.style.top = `${a.top + a.height / 2 - 11}px`;
  document.body.appendChild(dot);
  const anim = dot.animate(
    [
      { transform: "translate(0, 0) scale(1)", opacity: 1 },
      { transform: `translate(${dx * 0.45}px, ${Math.min(dy, 0) * 0.5 - 90}px) scale(1.3)`, opacity: 1, offset: 0.45 },
      { transform: `translate(${dx}px, ${dy}px) scale(0.35)`, opacity: 0.6 },
    ],
    { duration: 750, easing: "cubic-bezier(0.45, 0, 0.2, 1)" },
  );
  anim.onfinish = () => {
    dot.remove();
    signal("cart");
  };
}

/** Spawns a ripple wherever a `.btn` or `[data-ripple]` element is pressed. Mounted once in the root layout. */
export function PressEffects() {
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>(".btn, [data-ripple]");
      if (!el || el.matches(":disabled") || reducedMotion()) return;
      const r = el.getBoundingClientRect();
      const size = Math.max(r.width, r.height) * 2.2;
      const s = document.createElement("span");
      s.className = "ripple";
      s.style.width = s.style.height = `${size}px`;
      s.style.left = `${e.clientX - r.left - size / 2}px`;
      s.style.top = `${e.clientY - r.top - size / 2}px`;
      el.appendChild(s);
      s.addEventListener("animationend", () => s.remove());
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);
  return null;
}
