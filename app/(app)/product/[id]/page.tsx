import { Suspense } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Star, ThumbsUp, ThumbsDown, Truck, Tag, Wallet } from "lucide-react";
import { getProvider } from "@/lib/providers";
import { alternativesFor, insightFor } from "@/lib/analysis/insights";
import { logView } from "@/lib/history";
import { requireUser } from "@/lib/supabase/server";
import { themeFor } from "@/lib/theme/categories";
import { STORES } from "@/lib/stores";
import { cardFrom } from "@/lib/snapshot";
import { formatDate, inr } from "@/lib/utils";
import { ProductArt } from "@/components/product/ProductArt";
import { CategoryChip, StoreBadge } from "@/components/product/StoreBadge";
import { AddToCartButton, BuyOnStoreButton, WishButton } from "@/components/product/ActionButtons";
import { PriceChart } from "@/components/product/PriceChart";
import { RealityCheckCard } from "@/components/product/RealityCheck";
import { VerdictPanel, VerdictSkeleton } from "@/components/product/VerdictPanel";
import { PriceAlertButton } from "@/components/product/PriceAlertButton";
import { ProductCard } from "@/components/product/ProductCard";
import { Section } from "@/components/ui/Section";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const provider = getProvider();
  const product = await provider.getProduct(id);
  if (!product) notFound();

  const { supabase, user } = await requireUser();
  const [insight, reviews, coupons, alternatives, { data: wish }] = await Promise.all([
    insightFor(product),
    provider.getReviews(id),
    provider.getCoupons(),
    alternativesFor(product, 8),
    supabase.from("wishlist").select("id").eq("user_id", user.id).eq("product_id", id).maybeSingle(),
    logView(product),
  ]);
  const series = await Promise.all(product.offers.map(async (o) => ({ store: o.store, history: await provider.getPriceHistory(o.id) })));
  const theme = themeFor(product.category);
  const best = insight.product.bestOffer;
  const offerReal = new Map(insight.offerPrices.map((x) => [x.offerId, x.real]));
  const offers = [...product.offers].sort((a, b) => (offerReal.get(a.id)?.effective ?? a.price + 1e9) - (offerReal.get(b.id)?.effective ?? b.price + 1e9));
  const storeCoupons = coupons.filter((c) => product.offers.some((o) => o.store === c.store) && (!c.categories || c.categories.includes(product.category)));
  const cheaper = alternatives.filter((a) => a.bestOffer.price < best.price);

  return (
    <div className="space-y-8">
      <nav className="text-sm text-muted">
        <Link href="/" className="hover:underline">Home</Link> / <Link href={`/search?category=${product.category}`} className="hover:underline">{theme.label}</Link> / <span>{product.subcategory}</span>
      </nav>

      {/* Hero */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="relative">
          <ProductArt photo={product.photo} fit={product.photoFit} category={product.category} alt={product.name} size="xl" />
          <WishButton productId={product.id} initial={!!wish} className="absolute right-4 top-4 h-11 w-11" />
          {product.photoCredit && <p className="mt-2 text-[11px] text-muted">Representative photo · {product.photoCredit}</p>}
        </div>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryChip category={product.category} />
            <span className="chip bg-surface-2 text-muted">{product.subcategory}</span>
          </div>
          <div>
            <p className="font-semibold uppercase tracking-wide" style={{ color: theme.accent }}>
              {product.brand}
            </p>
            <h1 className="font-display text-2xl font-bold sm:text-3xl">{product.name}</h1>
            <div className="mt-2 flex items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-2 py-0.5 font-bold text-white">
                {product.rating} <Star className="h-3.5 w-3.5 fill-white" />
              </span>
              <span className="text-muted">{product.reviewCount.toLocaleString("en-IN")} ratings</span>
            </div>
          </div>
          <div className="card p-4">
            <p className="text-xs font-semibold text-muted">Best price across {product.offers.length} stores</p>
            <div className="flex flex-wrap items-baseline gap-x-3">
              <span className="text-3xl font-bold">{inr(best.price)}</span>
              {best.mrp > best.price && <span className="text-muted line-through">{inr(best.mrp)}</span>}
              <StoreBadge store={best.store} />
            </div>
            {insight.real.effective < best.price && (
              <p className="mt-1 text-sm">
                <Wallet className="mr-1 inline h-4 w-4 text-accent" /> Real price after {insight.real.coupon ? `coupon ${insight.real.coupon.code}` : "cashback"}: <b className="text-accent">{inr(insight.real.effective)}</b>
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <BuyOnStoreButton store={best.store} url={best.url} />
              <AddToCartButton productId={product.id} store={best.store} />
              <PriceAlertButton productId={product.id} suggested={Math.round(insight.stats.lowest / 10) * 10} />
            </div>
          </div>
          {Object.keys(product.specs).length > 0 && (
            <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
              {Object.entries(product.specs).map(([k, v]) => (
                <div key={k} className="rounded-xl bg-surface-2 px-3 py-2">
                  <dt className="text-xs text-muted">{k}</dt>
                  <dd className="font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      {/* Offers */}
      <Section title="Compare stores" subtitle="Sorted by real price after best coupon, shipping and cashback">
        <div className="card divide-y divide-line">
          {offers.map((o, idx) => {
            const real = offerReal.get(o.id);
            const s = STORES[o.store];
            return (
              <div key={o.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="flex w-40 items-center gap-2">
                  <span className="grid h-10 w-10 place-items-center rounded-xl font-display text-lg font-bold text-white" style={{ background: s.color }}>
                    {s.name[0]}
                  </span>
                  <div>
                    <p className="font-semibold">{s.name}</p>
                    {idx === 0 && o.inStock && <span className="chip bg-green-500/15 text-good">Cheapest</span>}
                  </div>
                </div>
                <div className="min-w-32 flex-1">
                  <p className="text-lg font-bold">{inr(o.price)}</p>
                  {o.mrp > o.price && <p className="text-xs text-muted line-through">{inr(o.mrp)}</p>}
                </div>
                <div className="min-w-40 flex-1 text-xs text-muted">
                  <p>
                    <Truck className="mr-1 inline h-3.5 w-3.5" />
                    {o.shipping ? `₹${o.shipping} delivery` : "Free delivery"} · {s.deliveryDays[0] === 0 && s.deliveryDays[1] === 0 ? "in minutes" : `${s.deliveryDays[0]}–${s.deliveryDays[1]} days`}
                  </p>
                  {real?.coupon && (
                    <p>
                      <Tag className="mr-1 inline h-3.5 w-3.5" />
                      {real.coupon.code}: −{inr(real.couponSaving)}
                    </p>
                  )}
                  {o.cashbackPct > 0 && <p>{o.cashbackPct}% cashback</p>}
                </div>
                <div className="min-w-28 text-right">
                  {o.inStock ? (
                    <>
                      <p className="text-xs text-muted">Real price</p>
                      <p className="font-bold text-accent">{inr(real?.effective ?? o.price)}</p>
                    </>
                  ) : (
                    <p className="text-sm font-semibold text-bad">Out of stock</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {o.inStock && <AddToCartButton productId={product.id} store={o.store} small className="!bg-surface-2 !text-fg !shadow-none" />}
                  <BuyOnStoreButton store={o.store} url={o.url} small />
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      <section className="grid gap-6 lg:grid-cols-2">
        <PriceChart series={series} accent={theme.accent} initialStore={best.store} />
        <RealityCheckCard reality={insight.reality} stats={insight.stats} price={best.price} />
      </section>

      <Suspense fallback={<VerdictSkeleton />}>
        <VerdictPanel insight={insight} />
      </Suspense>

      {/* Reviews */}
      <Section title="What buyers say" subtitle={`Insights from ${product.reviewCount.toLocaleString("en-IN")} ratings`}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card p-5">
            <p className="mb-2 flex items-center gap-2 font-semibold text-good">
              <ThumbsUp className="h-4 w-4" /> Loved for
            </p>
            <ul className="space-y-1 text-sm">
              {reviews.pros.map((p) => (
                <li key={p}>✓ {p}</li>
              ))}
            </ul>
            <p className="mb-2 mt-4 flex items-center gap-2 font-semibold text-bad">
              <ThumbsDown className="h-4 w-4" /> Common complaints
            </p>
            <div className="flex flex-wrap gap-2">
              {reviews.complaints.map((c) => (
                <span key={c} className="chip bg-red-500/10 py-1 text-bad">
                  {c}
                </span>
              ))}
            </div>
          </div>
          <div className="card max-h-80 space-y-3 overflow-y-auto p-5">
            {reviews.reviews.map((r) => (
              <div key={r.id} className="border-b border-line pb-3 last:border-0">
                <div className="flex items-center gap-2 text-sm">
                  <span className={`rounded px-1.5 text-xs font-bold text-white ${r.rating >= 4 ? "bg-green-600" : r.rating === 3 ? "bg-amber-500" : "bg-red-500"}`}>{r.rating}★</span>
                  <span className="font-semibold">{r.title}</span>
                </div>
                <p className="mt-1 text-sm text-muted">{r.body}</p>
                <p className="mt-1 text-xs text-muted">
                  {r.author} · {formatDate(r.date)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {storeCoupons.length > 0 && (
        <Section title="Coupons & bank offers">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {storeCoupons.map((c) => (
              <div key={c.id} className="card flex items-center gap-3 border-dashed p-4">
                <span className="rounded-lg border-2 border-dashed border-accent px-2 py-1 font-mono text-sm font-bold text-accent">{c.code}</span>
                <div className="text-sm">
                  <p className="font-medium">{c.description}</p>
                  <StoreBadge store={c.store} className="mt-1" />
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {cheaper.length > 0 && (
        <Section title="Lookalikes for less" subtitle="Similar style & type at a lower price">
          <div className="scroll-row">
            {cheaper.map((a) => (
              <div key={a.id} className="w-56">
                <ProductCard p={cardFrom(a)} badge={`Save ${inr(best.price - a.bestOffer.price)}`} />
              </div>
            ))}
          </div>
        </Section>
      )}

      {alternatives.length > 0 && (
        <Section title="Alternatives to consider">
          <div className="scroll-row">
            {alternatives.map((a) => (
              <div key={a.id} className="w-56">
                <ProductCard p={cardFrom(a)} />
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}
