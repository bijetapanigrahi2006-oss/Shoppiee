"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Check, ExternalLink, Loader2, PartyPopper, ShieldCheck, SkipForward, Truck } from "lucide-react";
import { confirmStoreOrder, skipStore } from "@/app/actions";
import type { ProductSnapshot } from "@/lib/snapshot";
import { STORES } from "@/lib/stores";
import type { StoreId } from "@/lib/types";
import { cn, formatDate, inr } from "@/lib/utils";
import { ProductArt } from "@/components/product/ProductArt";
import { Celebration, fireConfetti } from "@/components/celebrate/Celebration";
import { toast } from "@/components/ui/toast";

export interface CheckoutStore {
  store: StoreId;
  status: "pending" | "ordered" | "skipped";
  items: { productId: string; qty: number; price: number; url: string; snapshot: ProductSnapshot }[];
}

interface OrderSummary {
  id: string;
  store: string;
  amount: number;
  expected: string | null;
  items: { productId: string; name: string; photo?: string; category: string; qty: number }[];
  storeOrderId: string | null;
}

/**
 * Guided multi-store checkout: one store at a time → open the store → pay there →
 * come back and confirm → celebrate → next store.
 */
export function CheckoutFlow({ checkoutId, total, stores, orders }: { checkoutId: string; total: number; stores: CheckoutStore[]; orders: OrderSummary[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [opened, setOpened] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [eta, setEta] = useState("");
  const [celebrate, setCelebrate] = useState<{ store: string } | null>(null);
  const current = stores.find((s) => s.status === "pending");
  const doneCount = stores.filter((s) => s.status !== "pending").length;
  const allDone = !current;

  useEffect(() => {
    setOpened(false);
    setOrderId("");
    setEta("");
  }, [current?.store]);

  useEffect(() => {
    if (allDone && orders.length) fireConfetti(true);
  }, [allDone, orders.length]);

  const finishCelebration = useCallback(() => {
    setCelebrate(null);
    router.refresh();
  }, [router]);

  if (allDone) return <Summary orders={orders} total={total} />;

  const s = STORES[current.store];
  const subtotal = current.items.reduce((a, i) => a + i.price * i.qty, 0);
  const defaultEta = new Date(Date.now() + s.deliveryDays[1] * 86400000).toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Celebration show={!!celebrate} title={`Ordered on ${celebrate?.store ?? ""}!`} subtitle={stores.filter((x) => x.status === "pending").length > 1 ? "Nice! Taking you to the next store…" : "That's everything!"} onDone={finishCelebration} />

      {/* Progress */}
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <p className="font-display text-lg font-semibold">
            Store {doneCount + 1} of {stores.length}
          </p>
          <p className="text-sm text-muted">Cart total {inr(total)}</p>
        </div>
        <div className="mt-4 flex items-center">
          {stores.map((x, i) => {
            const st = STORES[x.store];
            const active = x.store === current.store;
            return (
              <div key={x.store} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <motion.span
                    animate={active ? { scale: [1, 1.12, 1] } : {}}
                    transition={{ repeat: Infinity, duration: 1.6 }}
                    className={cn("grid h-10 w-10 place-items-center rounded-full font-bold text-white", x.status === "skipped" && "opacity-40")}
                    style={{ background: x.status === "pending" && !active ? "var(--border)" : st.color }}
                  >
                    {x.status === "ordered" ? <Check className="h-5 w-5" /> : st.name[0]}
                  </motion.span>
                  <span className="text-[11px] font-semibold">{st.name}</span>
                </div>
                {i < stores.length - 1 && <div className="mx-1 mb-5 h-1 flex-1 rounded-full" style={{ background: x.status !== "pending" ? st.color : "var(--border)" }} />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current store */}
      <div className="card overflow-hidden">
        <div className="p-5 text-white" style={{ background: s.color, color: current.store === "blinkit" ? "#1c1530" : "white" }}>
          <p className="text-sm font-semibold opacity-90">Now ordering from</p>
          <p className="font-display text-3xl font-bold">{s.name}</p>
          <p className="text-sm opacity-90">
            {current.items.length} item{current.items.length > 1 ? "s" : ""} · {inr(subtotal)}
          </p>
        </div>
        <ul className="divide-y divide-line">
          {current.items.map((i) => (
            <li key={i.productId} className="flex flex-wrap items-center gap-3 p-4">
              <ProductArt photo={i.snapshot.photo} fit={i.snapshot.photoFit} category={i.snapshot.category} alt={i.snapshot.name} className="h-14 w-14 text-2xl" />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 font-semibold">{i.snapshot.name}</p>
                <p className="text-xs text-muted">
                  Qty {i.qty} · {inr(i.price * i.qty)}
                </p>
              </div>
              <a
                href={i.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpened(true)}
                className="btn btn-sm text-white"
                style={{ background: s.color, color: current.store === "blinkit" ? "#1c1530" : "white" }}
              >
                Buy on {s.name} <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </li>
          ))}
        </ul>
        <div className="space-y-4 border-t border-line bg-surface-2/50 p-5">
          <ol className="space-y-1 text-sm text-muted">
            <li>
              <b className="text-fg">1.</b> Tap <b>Buy on {s.name}</b> — it opens in a new tab.
            </li>
            <li>
              <b className="text-fg">2.</b> Add to cart and pay securely on {s.name}.
            </li>
            <li>
              <b className="text-fg">3.</b> Come back here and confirm your order.
            </li>
          </ol>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block text-muted">{s.name} order ID (optional)</span>
              <input className="input" placeholder="e.g. 403-1234567-7654321" value={orderId} onChange={(e) => setOrderId(e.target.value)} />
            </label>
            <label className="text-sm">
              <span className="mb-1 block text-muted">Expected delivery</span>
              <input className="input" type="date" value={eta || defaultEta} onChange={(e) => setEta(e.target.value)} />
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className={cn("btn btn-brand flex-1 py-3 text-base", !opened && "opacity-90")}
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const r = await confirmStoreOrder({ checkoutId, store: current.store, storeOrderId: orderId.trim() || undefined, expectedDelivery: eta || defaultEta });
                  if (r.ok) setCelebrate({ store: s.name });
                  else toast(r.error, "⚠️");
                })
              }
            >
              {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-5 w-5" />} I placed this order
            </button>
            <button
              className="btn btn-ghost"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  await skipStore(checkoutId, current.store);
                  router.refresh();
                })
              }
            >
              <SkipForward className="h-4 w-4" /> Skip for now
            </button>
          </div>
          <p className="flex items-center gap-1.5 text-xs text-muted">
            <ShieldCheck className="h-4 w-4 text-good" /> Payment happens only on {s.name}. Shoppiee never sees your card details.
          </p>
        </div>
      </div>
    </div>
  );
}

function Summary({ orders, total }: { orders: OrderSummary[]; total: number }) {
  const paid = orders.reduce((a, o) => a + o.amount, 0);
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="overflow-hidden rounded-[28px] p-8 text-center text-white" style={{ background: "var(--brand-gradient)" }}>
        <motion.span className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-white/20 ring-1 ring-white/40 backdrop-blur" animate={{ rotate: [0, -12, 12, -6, 0], scale: [1, 1.2, 1] }} transition={{ duration: 1.2 }}>
          <PartyPopper className="h-10 w-10" />
        </motion.span>
        <h1 className="mt-2 font-display text-3xl font-bold">{orders.length ? "All done — happy shopping!" : "Checkout finished"}</h1>
        <p className="mt-1 opacity-95">
          {orders.length} order{orders.length === 1 ? "" : "s"} placed · {inr(paid)} {paid !== total && <span className="opacity-80">(of {inr(total)} in cart)</span>}
        </p>
      </motion.div>
      <div className="space-y-3">
        {orders.map((o) => {
          const s = STORES[o.store as StoreId];
          return (
            <div key={o.id} className="card flex flex-wrap items-center gap-4 p-4">
              <span className="grid h-12 w-12 place-items-center rounded-2xl font-display text-xl font-bold text-white" style={{ background: s.color }}>
                {s.name[0]}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {s.name} {o.storeOrderId && <span className="text-xs text-muted">#{o.storeOrderId}</span>}
                </p>
                <div className="mt-1 flex items-center gap-1.5">
                  {o.items.slice(0, 4).map((i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i.productId} src={i.photo} alt={i.name} className="h-9 w-9 rounded-lg bg-white object-cover ring-1 ring-line" />
                  ))}
                  <p className="line-clamp-1 text-sm text-muted">{o.items.map((i) => i.name).join(", ")}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">{inr(o.amount)}</p>
                {o.expected && (
                  <p className="flex items-center gap-1 text-xs text-good">
                    <Truck className="h-3.5 w-3.5" /> Arrives {formatDate(o.expected, { weekday: "short", day: "numeric", month: "short" })}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/orders" className="btn btn-primary">
          Track my orders
        </Link>
        <Link href="/" className="btn btn-ghost">
          Keep shopping
        </Link>
      </div>
    </div>
  );
}
