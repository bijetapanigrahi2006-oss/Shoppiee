"use client";

import { useState, useTransition } from "react";
import { ExternalLink, Heart, Loader2, ShoppingCart, Check } from "lucide-react";
import { addToCart, toggleWishlist } from "@/app/actions";
import { STORES } from "@/lib/stores";
import type { StoreId } from "@/lib/types";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export function AddToCartButton({ productId, store, small, className, iconOnly }: { productId: string; store?: StoreId; small?: boolean; className?: string; iconOnly?: boolean }) {
  const [pending, start] = useTransition();
  const [added, setAdded] = useState(false);
  return (
    <button
      className={cn("btn btn-primary", small && "btn-sm", iconOnly && "h-9 w-9 !p-0", className)}
      aria-label="Add to cart"
      disabled={pending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        start(async () => {
          const r = await addToCart(productId, store);
          if (r.ok) {
            setAdded(true);
            toast(`Added to cart${store ? ` from ${STORES[store].name}` : ""}`, "🛒");
            setTimeout(() => setAdded(false), 1600);
          } else toast(r.error, "⚠️");
        });
      }}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : added ? <Check className="h-4 w-4" /> : <ShoppingCart className="h-4 w-4" />}
      {!iconOnly && (added ? "Added" : "Add to cart")}
    </button>
  );
}

export function WishButton({ productId, initial = false, className }: { productId: string; initial?: boolean; className?: string }) {
  const [wished, setWished] = useState(initial);
  const [pending, start] = useTransition();
  return (
    <button
      aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
      className={cn("grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow transition hover:scale-110 dark:bg-black/50", className)}
      disabled={pending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setWished((w) => !w);
        start(async () => {
          const r = await toggleWishlist(productId);
          setWished(r.wished);
          toast(r.wished ? "Saved to wishlist" : "Removed from wishlist", r.wished ? "💖" : "💔");
        });
      }}
    >
      <Heart className={cn("h-4 w-4 transition", wished ? "fill-rose-500 text-rose-500" : "text-gray-500")} />
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
