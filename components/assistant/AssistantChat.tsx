"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowUp, Check, Loader2, Sparkles, Star } from "lucide-react";
import type { AssistantProduct } from "@/app/api/assistant/route";
import { themeFor } from "@/lib/theme/categories";
import { STORES } from "@/lib/stores";
import type { StoreId } from "@/lib/types";
import { inr, cn } from "@/lib/utils";
import { ProductArt } from "@/components/product/ProductArt";
import { AddToCartButton, BuyOnStoreButton } from "@/components/product/ActionButtons";
import { SaveListButton } from "@/components/lists/ListButtons";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

interface AssistantReply {
  need: { summary: string; category: string; budget: number | null; useCases: string[]; mustHaves: string[]; lifespanYears: number | null };
  intro: string;
  tradeoffs: string[];
  tip: string;
  picks: { productId: string; label: string; why: string; watchOut: string; product: AssistantProduct }[];
  others: AssistantProduct[];
  compared: number;
  ai: boolean;
  budgetRelaxed: boolean;
}

type Msg = { role: "user"; text: string } | { role: "assistant"; reply: AssistantReply } | { role: "error"; text: string };

const STEPS = [
  "Understanding your requirements",
  "Searching 14 stores",
  "Comparing specifications",
  "Reading reviews & spotting complaints",
  "Checking 6 months of price history",
  "Applying coupons & cashback for real prices",
  "Finding alternatives",
  "Explaining the tradeoffs",
];

const PROMPTS = [
  "I need a laptop for college, AI/ML, coding, occasional gaming, good battery, and I don't want to replace it for 4 years. Budget ₹70k.",
  "Sunscreen for oily, acne-prone skin that doesn't leave a white cast, under ₹600",
  "A party dress for a friend's wedding sangeet, something floral and not too expensive",
  "Noise-cancelling headphones for flights and office calls, budget ₹30,000",
  "Comfortable white sneakers for daily college wear under ₹4,000",
];

export function AssistantChat() {
  const params = useSearchParams();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const started = useRef(false);
  const endRef = useRef<HTMLDivElement>(null);

  async function ask(text: string) {
    if (!text.trim() || loading) return;
    const context = messages
      .filter((m) => m.role === "user")
      .map((m) => (m as { text: string }).text)
      .join("\n");
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setLoading(true);
    setStep(0);
    const timer = setInterval(() => setStep((s) => Math.min(s + 1, STEPS.length - 1)), 1100);
    try {
      const res = await fetch("/api/assistant", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text, context: context || undefined }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setMessages((m) => [...m, { role: "assistant", reply: data }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "error", text: e instanceof Error ? e.message : "Something went wrong" }]);
    } finally {
      clearInterval(timer);
      setLoading(false);
    }
  }

  useEffect(() => {
    const q = params.get("q");
    if (q && !started.current) {
      started.current = true;
      ask(q);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), [messages, loading]);

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-5 pb-36">
      <div className="rounded-3xl p-6 text-white" style={{ background: "linear-gradient(135deg,#ec4899,#8b5cf6 60%,#06b6d4)" }}>
        <p className="flex items-center gap-2 text-sm font-semibold opacity-90">
          <Sparkles className="h-4 w-4" /> Shoppiee assistant
        </p>
        <h1 className="font-display text-2xl font-bold sm:text-3xl">Tell me what you need — not what to search.</h1>
        <p className="mt-1 text-sm opacity-90">I&apos;ll research stores, specs, reviews, price history and coupons, then explain the tradeoffs like a friend who knows.</p>
      </div>

      {messages.length === 0 && !loading && (
        <div className="grid gap-3 sm:grid-cols-2">
          {PROMPTS.map((p) => (
            <button key={p} onClick={() => ask(p)} className="card p-4 text-left text-sm transition hover:-translate-y-0.5 hover:border-accent">
              {p}
            </button>
          ))}
        </div>
      )}

      <AnimatePresence initial={false}>
        {messages.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            {m.role === "user" ? (
              <div className="ml-auto max-w-[85%] rounded-3xl rounded-br-md bg-accent px-5 py-3 text-white shadow">{m.text}</div>
            ) : m.role === "error" ? (
              <div className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-bad">{m.text}</div>
            ) : (
              <Reply reply={m.reply} />
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {loading && (
        <div className="card p-5">
          <ul className="space-y-2">
            {STEPS.map((s, i) => (
              <li key={s} className={cn("flex items-center gap-2 text-sm transition", i > step && "opacity-30")}>
                {i < step ? <Check className="h-4 w-4 text-good" /> : i === step ? <Loader2 className="h-4 w-4 animate-spin text-accent" /> : <span className="h-4 w-4" />}
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
      <div ref={endRef} />

      <form
        className="fixed bottom-4 left-4 right-4 z-20 mx-auto max-w-3xl lg:left-72"
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
      >
        <div className="card flex items-end gap-2 p-2 shadow-2xl">
          <textarea
            rows={1}
            className="max-h-40 min-h-12 flex-1 resize-none bg-transparent px-3 py-3 outline-none placeholder:text-muted"
            placeholder={messages.length ? "Refine: 'lighter please', 'more battery', 'under ₹50k'…" : "Describe what you need, your budget and how you'll use it…"}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                ask(input);
              }
            }}
          />
          <button className="btn btn-brand h-12 w-12 !p-0" disabled={loading || !input.trim()} aria-label="Send">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUp className="h-5 w-5" />}
          </button>
        </div>
      </form>
    </div>
  );
}

function Reply({ reply }: { reply: AssistantReply }) {
  const t = themeFor(reply.need.category);
  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="chip text-white" style={{ background: t.accent }}>
            <CategoryIcon category={reply.need.category} className="h-3.5 w-3.5" /> {t.label}
          </span>
          {reply.need.budget && <span className="chip bg-surface-2">Budget {inr(reply.need.budget)}</span>}
          {reply.need.lifespanYears && <span className="chip bg-surface-2">Keep {reply.need.lifespanYears} yrs</span>}
          {[...reply.need.useCases, ...reply.need.mustHaves].slice(0, 6).map((u) => (
            <span key={u} className="chip bg-surface-2">
              {u}
            </span>
          ))}
          {reply.ai && (
            <span className="chip ml-auto bg-accent/15 text-accent">
              <Sparkles className="h-3 w-3" /> AI
            </span>
          )}
        </div>
        <p>{reply.intro}</p>
        <p className="mt-1 text-xs text-muted">Compared {reply.compared} products across stores.</p>
        {reply.budgetRelaxed && <p className="mt-2 text-sm text-warn">Only a few options fit your exact budget, so I&apos;ve included some slightly above it.</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {reply.picks.map((pick, i) => (
          <PickCard key={pick.productId} rank={i} label={pick.label} why={pick.why} watchOut={pick.watchOut} p={pick.product} />
        ))}
      </div>

      {reply.tradeoffs.length > 0 && (
        <div className="card p-5">
          <p className="mb-2 font-display text-lg font-semibold">Tradeoffs</p>
          <ul className="space-y-1.5 text-sm">
            {reply.tradeoffs.map((x) => (
              <li key={x}>• {x}</li>
            ))}
          </ul>
          {reply.tip && <p className="mt-3 rounded-xl bg-surface-2 px-4 py-2 text-sm"><b>Tip:</b> {reply.tip}</p>}
          <div className="mt-3 flex justify-end">
            <SaveListButton name={reply.need.summary.slice(0, 60)} emoji="#a855f7" items={reply.picks.map((p) => ({ title: p.product.name, productId: p.productId }))} />
          </div>
        </div>
      )}

      {reply.others.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-muted">Other options I considered</p>
          <div className="scroll-row">
            {reply.others.map((o) => (
              <Link key={o.id} href={`/product/${o.id}`} className="card flex w-64 items-center gap-3 p-3">
                <ProductArt photo={o.photo} fit={o.photoFit} category={o.category} alt={o.name} size="sm" />
                <div className="min-w-0">
                  <p className="line-clamp-2 text-sm font-medium">{o.name}</p>
                  <p className="text-xs text-muted">
                    {inr(o.price)} · {o.rating}★ · score {o.score}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const MEDALS = ["#1", "#2", "#3"];

function PickCard({ rank, label, why, watchOut, p }: { rank: number; label: string; why: string; watchOut: string; p: AssistantProduct }) {
  const t = themeFor(p.category);
  return (
    <div className="card flex flex-col overflow-hidden" style={{ borderTop: `4px solid ${t.accent}` }}>
      <Link href={`/product/${p.id}`} className="relative block p-3">
        <ProductArt photo={p.photo} fit={p.photoFit} category={p.category} alt={p.name} className="h-36 text-6xl" />
        <span className="chip absolute left-5 top-5 text-white shadow" style={{ background: t.accent }}>
          {MEDALS[rank]} {label}
        </span>
      </Link>
      <div className="flex flex-1 flex-col gap-2 px-4 pb-4">
        <Link href={`/product/${p.id}`} className="line-clamp-2 font-semibold hover:underline">
          {p.brand} {p.name}
        </Link>
        <div className="flex items-center gap-2 text-xs text-muted">
          <span className="inline-flex items-center gap-0.5 rounded bg-green-600 px-1.5 font-bold text-white">
            {p.rating} <Star className="h-3 w-3 fill-white" />
          </span>
          {p.reviewCount.toLocaleString("en-IN")} reviews · {p.storeCount} stores
        </div>
        <p className="text-sm">{why}</p>
        <p className="flex gap-1.5 text-xs text-warn">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {watchOut}
        </p>
        <div className="mt-auto pt-2">
          <p className="text-xl font-bold">
            {inr(p.price)} <span className="text-xs font-normal text-muted">on {STORES[p.store as StoreId].name}</span>
          </p>
          <p className="text-xs text-muted">
            Real price {inr(p.realPrice)}
            {p.coupon && ` with ${p.coupon}`} · 30-day avg {inr(p.avg30)} · lowest {inr(p.lowest)}
          </p>
          {p.reality === "inflated" && <p className="mt-1 text-xs font-semibold text-bad">The “sale” discount here is inflated</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            <BuyOnStoreButton store={p.store as StoreId} url={p.url} small />
            <AddToCartButton productId={p.id} store={p.store as StoreId} small className="!bg-surface-2 !text-fg !shadow-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
