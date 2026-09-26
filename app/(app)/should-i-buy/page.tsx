import { Suspense } from "react";
import Link from "next/link";
import { BadgeCheck, Info, Link2 } from "lucide-react";
import { getProvider } from "@/lib/providers";
import { insightFor } from "@/lib/analysis/insights";
import { logSearch } from "@/lib/history";
import { themeFor } from "@/lib/theme/categories";
import { STORES } from "@/lib/stores";
import { inr } from "@/lib/utils";
import { VerdictPanel, VerdictSkeleton } from "@/components/product/VerdictPanel";
import { RealityCheckCard } from "@/components/product/RealityCheck";
import { PriceChart } from "@/components/product/PriceChart";
import { ProductArt } from "@/components/product/ProductArt";
import { StoreBadge } from "@/components/product/StoreBadge";
import { AddToCartButton, BuyOnStoreButton } from "@/components/product/ActionButtons";
import { PageHeader } from "@/components/ui/Section";
import { EmptyState } from "@/components/ui/EmptyState";

const EXAMPLES = [
  "https://www.amazon.in/Sony-WH-1000XM5-Wireless-Cancelling-Headphones/dp/B09XS7JWHH",
  "https://www.flipkart.com/lenovo-loq-15-i5-12450hx-rtx-4050-gaming-laptop/p/itm123",
  "https://www.myntra.com/sneakers/nike/nike-air-force-1-07-sneakers/12345/buy",
  "https://www.nykaa.com/minimalist-sunscreen-aqua-gel-spf-50/p/456",
];

export default async function ShouldIBuyPage({ searchParams }: { searchParams: Promise<{ url?: string }> }) {
  const { url } = await searchParams;
  const provider = getProvider();
  const resolved = url ? await provider.resolveUrl(url) : null;
  if (url) await logSearch(url, "link");
  const product = resolved?.product;
  const insight = product ? await insightFor(product) : null;
  const series = product ? await Promise.all(product.offers.map(async (o) => ({ store: o.store, history: await provider.getPriceHistory(o.id) }))) : [];
  const pastedOffer = product && resolved?.store ? product.offers.find((o) => o.store === resolved.store) : undefined;

  return (
    <div className="space-y-6">
      <PageHeader icon={<BadgeCheck />} title="Should I buy this?" subtitle="Paste a link from Amazon, Flipkart, Myntra, Nykaa, Ajio, Croma… and get an honest BUY / WAIT / AVOID." gradient="linear-gradient(135deg,#22c55e,#0ea5e9)" />

      <form className="card flex flex-col gap-2 p-2 sm:flex-row" action="/should-i-buy">
        <div className="input-icon flex-1">
          <Link2 />
          <input name="url" type="url" required defaultValue={url} placeholder="https://www.amazon.in/…" className="input border-0 py-3 focus:shadow-none" />
        </div>
        <button className="btn btn-primary px-6 py-3">
          <BadgeCheck className="h-4 w-4" /> Check it
        </button>
      </form>

      {!url && (
        <div className="card p-5">
          <p className="mb-3 text-sm font-semibold">Try an example:</p>
          <div className="flex flex-col gap-2">
            {EXAMPLES.map((e) => (
              <Link key={e} href={`/should-i-buy?url=${encodeURIComponent(e)}`} className="truncate rounded-xl bg-surface-2 px-3 py-2 text-sm text-muted hover:text-fg">
                <Link2 className="mr-2 inline h-3.5 w-3.5 text-accent" />{e}
              </Link>
            ))}
          </div>
        </div>
      )}

      {url && !product && (
        <EmptyState icon={Link2} title={"I couldn't read that link"} body={"Make sure it's a full product URL starting with https://"} gradient="linear-gradient(135deg,#f59e0b,#ef4444)" />
      )}

      {product && insight && (
        <>
          {resolved!.confidence < 0.5 && (
            <p className="flex gap-2 rounded-2xl bg-amber-500/10 p-4 text-sm text-warn">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              I couldn&apos;t find an exact match for this link in the stores I track, so this is the closest product I found. Double-check it&apos;s the same item.
            </p>
          )}
          <div className="card flex flex-wrap items-center gap-4 p-4">
            <ProductArt photo={product.photo} fit={product.photoFit} category={product.category} alt={product.name} className="h-24 w-24 text-5xl" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold" style={{ color: themeFor(product.category).accent }}>
                {product.brand}
              </p>
              <Link href={`/product/${product.id}`} className="font-display text-xl font-semibold hover:underline">
                {product.name}
              </Link>
              {pastedOffer && (
                <p className="text-sm text-muted">
                  On {STORES[pastedOffer.store].name}: <b className="text-fg">{inr(pastedOffer.price)}</b>
                  {pastedOffer.id !== insight.product.bestOffer.id && (
                    <>
                      {" "}
                      · cheaper on {STORES[insight.product.bestOffer.store].name} at <b className="text-good">{inr(insight.product.bestOffer.price)}</b>
                    </>
                  )}
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StoreBadge store={insight.product.bestOffer.store} />
              <BuyOnStoreButton store={insight.product.bestOffer.store} url={insight.product.bestOffer.url} small />
              <AddToCartButton productId={product.id} store={insight.product.bestOffer.store} small />
            </div>
          </div>

          <Suspense fallback={<VerdictSkeleton />}>
            <VerdictPanel insight={insight} />
          </Suspense>

          <section className="grid gap-6 lg:grid-cols-2">
            <RealityCheckCard reality={insight.reality} stats={insight.stats} price={insight.product.bestOffer.price} />
            <PriceChart series={series} accent={themeFor(product.category).accent} initialStore={insight.product.bestOffer.store} />
          </section>
        </>
      )}
    </div>
  );
}
