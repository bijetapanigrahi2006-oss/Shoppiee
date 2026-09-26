"use client";

import { useRef, useState, useTransition } from "react";
import { Check, ExternalLink, Heart, Loader2, Share2, ShoppingCart } from "lucide-react";
import { addManyToCart, addToCart, toggleWishlist } from "@/app/actions";
import { STORES } from "@/lib/stores";
import type { StoreId } from "@/lib/types";
import { toast } from "@/components/ui/toast";
import { flyToCart, signal } from "@/components/ui/effects";
import { cn } from "@/lib/utils";

const VIEW_CART = { label: "View cart", href: "/cart" };

export function AddToCartButton({ productId, store, small, className, iconOnly }: { productId: string; store?: StoreId; small?: boolean; className?: string; iconOnly?: boolean }) {
  const [pending, start] = useTransition();
  const [added, setAdded] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <button
      ref={ref}
      className={cn("btn btn-primary", small && "btn-sm", iconOnly && "h-9 w-9 !p-0", added && "!bg-none !bg-emerald-500", className)}
      aria-label="Add to cart"
      title="Add to cart"
      disabled={pending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        start(async () => {
          const r = await addToCart(productId, store);
          if (r.ok) {
            setAdded(true);
            flyToCart(ref.current);
            toast(`Added to cart${store ? ` from ${STORES[store].name}` : ""}`, undefined, VIEW_CART);
            setTimeout(() => setAdded(false), 1800);
          } else toast(r.error, "error");
        });
      }}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
      {!iconOnly && (added ? "Added" : "Add to cart")}
    </button>
  );
}

/** Adds several products at once (curated lists, AI picks). */
export function AddAllToCartButton({ items, className }: { items: { productId: string; store?: StoreId }[]; className?: string }) {
  const [pending, start] = useTransition();
  const ref = useRef<HTMLButtonElement>(null);
  return (
    <button
      ref={ref}
      className={cn("btn btn-brand", className)}
      disabled={pending || !items.length}
      onClick={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await addManyToCart(items);
          if (r.ok) {
            flyToCart(ref.current);
            toast(`Added ${items.length} items to your cart`, undefined, VIEW_CART);
          } else toast(r.error, "error");
        });
      }}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />} Add all to cart
    </button>
  );
}

const BURST = ["#fb7185", "#f472b6", "#fbbf24", "#a78bfa", "#22d3ee", "#fb7185", "#f472b6", "#fbbf24"];

export function WishButton({ productId, initial = false, className }: { productId: string; initial?: boolean; className?: string }) {
  const [wished, setWished] = useState(initial);
  const [popKey, setPopKey] = useState(0);
  const [pending, start] = useTransition();

  function toggle(undoable: boolean) {
    const next = !wished;
    setWished(next);
    if (next) setPopKey((k) => k + 1);
    start(async () => {
      const r = await toggleWishlist(productId);
      setWished(r.wished);
      signal("wish");
      if (!undoable) return;
      if (r.wished) toast("Saved to wishlist", undefined, { label: "View wishlist", href: "/wishlist" });
      else toast("Removed from wishlist", undefined, { label: "Undo", onClick: () => toggleBack() });
    });
  }
  // Undo re-adds without offering another undo.
  function toggleBack() {
    setWished(true);
    setPopKey((k) => k + 1);
    start(async () => {
      const r = await toggleWishlist(productId);
      setWished(r.wished);
      signal("wish");
    });
  }

  return (
    <button
      aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={wished}
      title={wished ? "Remove from wishlist" : "Save to wishlist"}
      className={cn("relative grid h-9 w-9 place-items-center rounded-full bg-white/90 text-rose-500 shadow-lg transition hover:scale-110 active:scale-90 dark:bg-black/55", className)}
      disabled={pending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(true);
      }}
    >
      <Heart key={popKey} className={cn("h-4 w-4 transition", wished ? "heart-pop fill-rose-500 text-rose-500" : "text-gray-500 dark:text-white/80")} />
      {popKey > 0 && wished && (
        <span key={`b${popKey}`} className="burst" aria-hidden>
          {BURST.map((c, i) => (
            <i key={i} style={{ ["--a" as string]: `${i * 45}deg`, ["--c" as string]: c }} />
          ))}
        </span>
      )}
    </button>
  );
}

/** Shares the product page with the system share sheet, or copies the link. */
export function ShareButton({ productId, name, className }: { productId: string; name: string; className?: string }) {
  return (
    <button
      data-ripple
      aria-label="Share"
      title="Share or copy link"
      className={cn("grid h-9 w-9 place-items-center rounded-full bg-white/90 text-gray-600 shadow-lg transition hover:scale-110 dark:bg-black/55 dark:text-white/85", className)}
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const url = `${location.origin}/product/${productId}`;
        try {
          if (navigator.share && matchMedia("(pointer: coarse)").matches) {
            await navigator.share({ title: name, text: `${name} on Shoppiee`, url });
            return;
          }
          await navigator.clipboard.writeText(url);
          toast("Link copied");
        } catch {
          /* share sheet dismissed */
        }
      }}
    >
      <Share2 className="h-4 w-4" />
    </button>
  );
}

export function BuyOnStoreButton({ store, url, small, className }: { store: StoreId; url: string; small?: boolean; className?: string }) {
  const s = STORES[store];
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className={cn("btn text-white", small && "btn-sm", className)}
      style={{ background: s.color, color: ["blinkit"].includes(store) ? "#1c1530" : "white" }}
    >
      Buy on {s.name} <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}
