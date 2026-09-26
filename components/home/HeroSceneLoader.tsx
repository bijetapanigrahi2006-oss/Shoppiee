"use client";

import { Component, type ReactNode } from "react";
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

/** If WebGL fails at runtime (old GPU, driver bug), show a photo grid instead of breaking the page. */
class SceneBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

export function HeroSceneLoader({ products }: { products: HeroProduct[] }) {
  const fallback = (
    <div className="grid h-full grid-cols-3 content-center gap-3 p-6">
      {products.slice(0, 6).map((p, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={p.id} src={p.photo} alt={p.name} className="animate-float aspect-[4/5] w-full rounded-2xl bg-white object-cover shadow-2xl" style={{ animationDelay: `${i * 0.4}s` }} />
      ))}
    </div>
  );
  return (
    <SceneBoundary fallback={fallback}>
      <HeroScene products={products} />
    </SceneBoundary>
  );
}
