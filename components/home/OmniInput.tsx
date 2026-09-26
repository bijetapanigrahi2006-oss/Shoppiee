"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowRight, Camera, Link2, Search, Sparkles } from "lucide-react";
import { isUrl, cn } from "@/lib/utils";

export const PENDING_IMAGE_KEY = "shoppiee_pending_image";

const EXAMPLES: { label: string; value: string; icon: typeof Search }[] = [
  { label: "Sunscreen for oily skin", value: "sunscreen for oily skin", icon: Search },
  { label: "Laptop for AI/ML under ₹70k", value: "I need a laptop for college, AI/ML, coding, occasional gaming, good battery. Budget ₹70k", icon: Sparkles },
  { label: "Lehenga for a sangeet", value: "lehenga", icon: Search },
  { label: "Check an Amazon link", value: "https://www.amazon.in/Sony-WH-1000XM5-Wireless-Cancelling-Headphones/dp/B09XS7JWHH", icon: Link2 },
];

/** One box for everything: type a product, describe a need, paste a link, or drop a screenshot. */
export function OmniInput() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [drag, setDrag] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const mode = isUrl(value) ? "link" : value.trim().split(/\s+/).length > 6 ? "assistant" : "search";
  const ModeIcon = mode === "link" ? Link2 : mode === "assistant" ? Sparkles : Search;

  function go(v = value) {
    const q = v.trim();
    if (!q) return;
    if (isUrl(q)) router.push(`/should-i-buy?url=${encodeURIComponent(q.startsWith("http") ? q : `https://${q}`)}`);
    else if (q.split(/\s+/).length > 6) router.push(`/assistant?q=${encodeURIComponent(q)}`);
    else router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  function handleFile(file: File | undefined) {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        sessionStorage.setItem(PENDING_IMAGE_KEY, reader.result as string);
      } catch {
        /* too large for sessionStorage — visual search page will ask again */
      }
      router.push("/visual-search?from=home");
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-3">
      <div
        className={cn("rounded-[26px] p-[1.5px] shadow-2xl transition", drag ? "scale-[1.01]" : "")}
        style={{ background: "var(--brand-gradient)", boxShadow: "0 20px 60px -25px rgb(168 85 247 / 0.7)" }}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handleFile(e.dataTransfer.files[0]);
        }}
        onPaste={(e) => {
          const f = Array.from(e.clipboardData.files)[0];
          if (f) handleFile(f);
        }}
      >
        <form
          className="glass-strong flex items-center gap-3 rounded-[25px] py-2 pl-4 pr-2"
          onSubmit={(e) => {
            e.preventDefault();
            go();
          }}
        >
          <ModeIcon className="h-5 w-5 shrink-0 text-accent" />
          <input
            className="min-w-0 flex-1 bg-transparent py-3 text-base text-fg outline-none placeholder:text-muted"
            placeholder="Search, describe what you need, or paste a link…"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-label="Search, describe a need, or paste a product link"
          />
          <button type="button" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface-2 text-fg transition hover:bg-accent/20" onClick={() => fileRef.current?.click()} title="Search with a screenshot" aria-label="Search with a screenshot">
            <Camera className="h-5 w-5" />
          </button>
          <button className="btn btn-brand h-11 shrink-0 px-5" disabled={!value.trim()}>
            <span className="hidden sm:inline">Find it</span> <ArrowRight className="h-4 w-4" />
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => handleFile(e.target.files?.[0])} />
        </form>
      </div>
      {value.trim() ? (
        <p className="flex items-center gap-2 px-2 text-xs text-muted">
          <ModeIcon className="h-3.5 w-3.5" />
          {mode === "link" ? "Looks like a link — I'll check if you should buy it." : mode === "assistant" ? "I'll understand your needs and find the best match." : "I'll compare prices across every store."}
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button key={ex.label} type="button" onClick={() => go(ex.value)} className="chip border border-line bg-surface py-1.5 text-muted backdrop-blur transition hover:border-accent/50 hover:text-fg">
              <ex.icon className="h-3.5 w-3.5" /> {ex.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
