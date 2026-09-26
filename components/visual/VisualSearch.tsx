"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ImagePlus, Loader2, ScanSearch, Sparkles, X } from "lucide-react";
import type { VisualMatch } from "@/app/api/vision/route";
import { PENDING_IMAGE_KEY } from "@/components/home/OmniInput";
import { STORES } from "@/lib/stores";
import type { StoreId } from "@/lib/types";
import { themeFor } from "@/lib/theme/categories";
import { cn, inr } from "@/lib/utils";
import { ProductArt } from "@/components/product/ProductArt";
import { AddToCartButton, BuyOnStoreButton } from "@/components/product/ActionButtons";
import { PageHeader } from "@/components/ui/Section";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

interface ItemResult {
  item: { label: string; type: string; category: string; color: string | null; style: string | null; brandGuess: string | null; visiblePrice: number | null };
  exact: VisualMatch[];
  similar: VisualMatch[];
  forLess: VisualMatch[];
  reference: number;
}

function dataUrlToFile(dataUrl: string): File {
  const [head, b64] = dataUrl.split(",");
  const mime = head.match(/data:(.*?);/)?.[1] ?? "image/png";
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new File([arr], `screenshot.${mime.split("/")[1]}`, { type: mime });
}

export function VisualSearch() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [hint, setHint] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<ItemResult[] | null>(null);
  const [ai, setAi] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  function pick(f: File | undefined | null) {
    if (!f || !f.type.startsWith("image/")) return;
    setFile(f);
    setResults(null);
    setError(null);
    const r = new FileReader();
    r.onload = () => setPreview(r.result as string);
    r.readAsDataURL(f);
  }

  async function run(f = file) {
    if (!f) return;
    setLoading(true);
    setError(null);
    const fd = new FormData();
    fd.append("image", f);
    fd.append("hint", hint);
    try {
      const res = await fetch("/api/vision", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResults(data.results);
      setAi(data.ai);
      setActive(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Image handed over from the Home omni-input.
  useEffect(() => {
    try {
      const pending = sessionStorage.getItem(PENDING_IMAGE_KEY);
      if (pending) {
        sessionStorage.removeItem(PENDING_IMAGE_KEY);
        const f = dataUrlToFile(pending);
        setFile(f);
        setPreview(pending);
        run(f);
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const r = results?.[active];

  return (
    <div className="space-y-6" onPaste={(e) => pick(Array.from(e.clipboardData.files)[0])}>
      <PageHeader icon={<ScanSearch />} title="Screenshot → product" subtitle="Saw it on Instagram, Pinterest, YouTube or WhatsApp? Upload it — I'll find it, or something like it for less." gradient="linear-gradient(135deg,#f59e0b,#f43f5e 60%,#a855f7)" />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div
          className="card flex min-h-72 cursor-pointer flex-col items-center justify-center gap-3 border-2 border-dashed p-4 text-center"
          onClick={() => !preview && inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            pick(e.dataTransfer.files[0]);
          }}
        >
          {preview ? (
            <div className="relative w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt="Your screenshot" className="mx-auto max-h-80 rounded-2xl object-contain" />
              <button
                className="absolute right-2 top-2 rounded-full bg-black/60 p-1.5 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  setPreview(null);
                  setResults(null);
                }}
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
              {loading && (
                <motion.div className="absolute inset-x-0 h-1 rounded-full bg-accent shadow-[0_0_20px_var(--accent)]" initial={{ top: "0%" }} animate={{ top: ["0%", "100%", "0%"] }} transition={{ duration: 2.2, repeat: Infinity }} />
              )}
            </div>
          ) : (
            <>
              <span className="grid h-16 w-16 place-items-center rounded-2xl bg-accent/15 text-accent">
                <ImagePlus className="h-8 w-8" />
              </span>
              <p className="font-semibold">Drop, paste or click to upload</p>
              <p className="text-sm text-muted">PNG, JPG or WEBP up to 5 MB</p>
            </>
          )}
          <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => pick(e.target.files?.[0])} />
        </div>

        <div className="card flex flex-col gap-3 p-5">
          <p className="font-semibold">Anything I should know? (optional)</p>
          <input className="input" placeholder="e.g. “the white sneakers”, “the lamp on the left”" value={hint} onChange={(e) => setHint(e.target.value)} />
          <button className="btn btn-brand py-3" disabled={!file || loading} onClick={() => run()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanSearch className="h-4 w-4" />}
            {loading ? "Looking closely…" : "Find this / similar"}
          </button>
          {error && <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-bad">{error}</p>}
          <ul className="mt-2 space-y-1 text-sm text-muted">
            <li>Exact match — same product across stores</li>
            <li>Similar — same look, different brand</li>
            <li>Find me this for less — a price ladder of cheaper lookalikes</li>
          </ul>
        </div>
      </div>

      {results && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted">I spotted:</span>
            {results.map((x, i) => (
              <button key={i} onClick={() => setActive(i)} className={cn("chip border py-1.5 text-sm", i === active ? "border-accent bg-accent text-white" : "border-line bg-surface")}>
                <CategoryIcon category={x.item.category} className="h-3.5 w-3.5" /> {x.item.label}
              </button>
            ))}
            {ai && (
              <span className="chip ml-auto bg-accent/15 text-accent">
                <Sparkles className="h-3 w-3" /> AI vision
              </span>
            )}
          </div>

          {r && (
            <>
              <Block title="Exact match" empty="No exact match in the stores I track — but check the lookalikes below.">
                {r.exact.map((m) => (
                  <ExactCard key={m.id} m={m} />
                ))}
              </Block>

              {r.forLess.length > 0 && (
                <div className="card p-5">
                  <p className="font-display text-lg font-semibold">Find me this for less</p>
                  <p className="text-sm text-muted">These aren&apos;t the exact product, but they look very similar.</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {r.reference > 0 && <span className="chip bg-surface-2 py-1.5 text-sm line-through">{inr(r.reference)}</span>}
                    {r.forLess.map((m) => (
                      <span key={m.id} className="flex items-center gap-2">
                        <span className="text-muted">→</span>
                        <Link href={`/product/${m.id}`} className="chip bg-green-500/15 py-1.5 text-sm text-good hover:underline">
                          {inr(m.price)} · {m.similarity}% match
                        </Link>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <Block title="Similar styles" empty="Nothing similar yet.">
                {r.similar.map((m) => (
                  <SimilarCard key={m.id} m={m} />
                ))}
              </Block>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Block({ title, empty, children }: { title: string; empty: string; children: React.ReactNode[] }) {
  return (
    <section>
      <h2 className="mb-3 font-display text-xl font-semibold">{title}</h2>
      {children.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{children}</div> : <p className="card p-4 text-sm text-muted">{empty}</p>}
    </section>
  );
}

function ExactCard({ m }: { m: VisualMatch }) {
  return (
    <div className="card p-4">
      <div className="flex gap-3">
        <ProductArt photo={m.photo} fit={m.photoFit} category={m.category} alt={m.name} className="h-20 w-20 text-4xl" />
        <div className="min-w-0">
          <Link href={`/product/${m.id}`} className="line-clamp-2 font-semibold hover:underline">
            {m.brand} {m.name}
          </Link>
          <p className="text-xs text-muted">{m.similarity}% match · {m.rating}★</p>
        </div>
      </div>
      <ul className="mt-3 divide-y divide-line text-sm">
        {m.offers.slice(0, 4).map((o) => (
          <li key={o.store} className="flex items-center justify-between py-1.5">
            <span style={{ color: STORES[o.store as StoreId].color }} className="font-semibold">
              {STORES[o.store as StoreId].name}
            </span>
            <a href={o.url} target="_blank" rel="noopener noreferrer" className="font-bold hover:underline">
              {inr(o.price)}
            </a>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex gap-2">
        <BuyOnStoreButton store={m.store as StoreId} url={m.url} small />
        <AddToCartButton productId={m.id} store={m.store as StoreId} small className="!bg-surface-2 !text-fg !shadow-none" />
      </div>
    </div>
  );
}

function SimilarCard({ m }: { m: VisualMatch }) {
  return (
    <Link href={`/product/${m.id}`} className="card flex items-center gap-3 p-3 transition hover:-translate-y-0.5">
      <ProductArt photo={m.photo} fit={m.photoFit} category={m.category} alt={m.name} className="h-16 w-16 text-3xl" />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-semibold">{m.name}</p>
        <p className="text-xs text-muted">
          {m.brand} · {m.rating}★
        </p>
        <p className="font-bold">{inr(m.price)}</p>
      </div>
      <span className="chip bg-accent/15 text-accent">{m.similarity}%</span>
    </Link>
  );
}
