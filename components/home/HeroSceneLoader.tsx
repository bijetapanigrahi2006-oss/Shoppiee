"use client";

import dynamic from "next/dynamic";
import type { HeroProduct } from "./HeroScene";

const HeroScene = dynamic(() => import("./HeroScene"), {
  ssr: false,
  loading: () => (
    <div className="grid h-full place-items-center">
      <div className="h-40 w-40 animate-pulse rounded-full bg-gradient-to-tr from-fuchsia-500/30 via-violet-500/30 to-cyan-400/30 blur-2xl" />
    </div>
  ),
});

export function HeroSceneLoader({ products }: { products: HeroProduct[] }) {
  return <HeroScene products={products} />;
}
