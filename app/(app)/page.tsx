import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Brain,
  Clock,
  History as HistoryIcon,
  Link2,
  ScanSearch,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Store,
  TrendingDown,
  Wallet,
} from "lucide-react";
import { requireUser } from "@/lib/supabase/server";
import { getProvider } from "@/lib/providers";
import { scanDeals } from "@/lib/analysis/deals";
import { CATEGORY_LIST, themeFor } from "@/lib/theme/categories";
import { CURATED_LISTS } from "@/lib/curated";
import { STORE_LIST } from "@/lib/stores";
import { categoryCover } from "@/lib/providers/mock/catalog";
import { cardFrom, cardFromSnapshot, type ProductSnapshot } from "@/lib/snapshot";
import { inr } from "@/lib/utils";
import { OmniInput } from "@/components/home/OmniInput";
import { HeroSceneLoader } from "@/components/home/HeroSceneLoader";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductArt } from "@/components/product/ProductArt";
import { NewListButton, SaveListButton } from "@/components/lists/ListButtons";
import { Section } from "@/components/ui/Section";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

function greeting() {
  const h = Number(new Date().toLocaleString("en-IN", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }));
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export default async function HomePage() {
  const { supabase, user } = await requireUser();
  const provider = getProvider();
  const [{ data: profile }, { data: lists }, { data: viewed }, { data: wishlist }, { data: searches }, deals, inflated, all] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    supabase.from("shopping_lists").select("id, name, emoji, source, list_items(count)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(8),
    supabase.from("viewed_products").select("product_id, snapshot").eq("user_id", user.id).order("viewed_at", { ascending: false }).limit(10),
    supabase.from("wishlist").select("product_id, snapshot").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
    supabase.from("search_history").select("query, kind, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(8),
    scanDeals({ limit: 12 }),
    scanDeals({ level: "inflated", limit: 1 }),
    provider.listProducts(),
  ]);

  const curated = await Promise.all(
    CURATED_LISTS.map(async (l) => {
      const items = await Promise.all(l.items.map(async (q) => (await provider.search(q))[0]));
      const seen = new Set<string>();
      return { ...l, products: items.filter((p) => p && !seen.has(p.id) && seen.add(p.id)) };
    }),
  );

  // Hero ring + trending: highly rated products across colourful categories.
  // Hand-picked hero shots: bold studio photos across colourful categories.
  const HERO_PICKS = ["Bloom Eau de Parfum", "Bridal Velvet Lehenga", "AirPods Pro", "Kurkure Masala Munch", "iPhone 15", "Air Force 1", "Raga Viva", "Tote Handbag", "Dairy Milk Silk", "J'adore", "Gold-Plated Kundan Jhumkas", "MacBook Air"];
  const hero = HERO_PICKS.map((n) => all.find((p) => p.name.startsWith(n) && p.photo))
    .filter((p): p is NonNullable<typeof p> => !!p)
    .map((p) => ({ id: p.id, photo: p.photo, name: p.name, fit: p.photoFit }));
  const trending = [...all].filter((p) => p.photo).sort((a, b) => b.rating * Math.log(b.reviewCount) - a.rating * Math.log(a.reviewCount)).slice(0, 12);

  const firstName = ((profile?.full_name as string) || user.email?.split("@")[0] || "there").split(" ")[0];
  const wishedIds = new Set((wishlist ?? []).map((w) => w.product_id as string));
  const spotlight = inflated[0];
  const genuine = deals[0];

  return (
    <div className="space-y-16">
      {/* ───────────── Hero ───────────── */}
      <section className="relative -mt-4 grid items-center gap-6 lg:grid-cols-[1.05fr_1fr]">
        <div className="relative z-10 space-y-6 pt-4">
          <span className="chip border border-line bg-surface py-1.5 text-muted backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Comparing {STORE_LIST.length} stores · {all.length} products
          </span>
          <div>
            <p className="text-lg font-medium text-muted">
              {greeting()}, {firstName}
            </p>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-6xl">
              The app that <span className="brand-text">shops with you.</span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted sm:text-lg">
              Real prices across Amazon, Flipkart, Myntra, Nykaa, Blinkit and more — with price history, fake-discount detection and honest AI advice.
            </p>
          </div>
          <OmniInput />
          <div className="grid max-w-lg grid-cols-3 gap-3">
            {[
              { k: `${STORE_LIST.length}`, v: "stores compared", c: "#f472b6" },
              { k: "180d", v: "price history", c: "#22d3ee" },
              { k: `${deals.length}+`, v: "real deals today", c: "#a3e635" },
            ].map((s) => (
              <div key={s.v} className="card px-4 py-3">
                <p className="font-display text-2xl font-bold" style={{ color: s.c }}>
                  {s.k}
                </p>
                <p className="text-xs text-muted">{s.v}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative h-[380px] sm:h-[520px]">
          <div className="pointer-events-none absolute inset-8 rounded-full bg-gradient-to-tr from-fuchsia-600/30 via-violet-600/20 to-cyan-400/30 blur-3xl" />
          <HeroSceneLoader products={hero} />
          <p className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-muted">Tap a product to open it</p>
        </div>
      </section>

      {/* ───────────── Store marquee ───────────── */}
      <section className="relative -mx-4 overflow-hidden py-2 sm:-mx-6" aria-label="Stores we compare">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[var(--bg)] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[var(--bg)] to-transparent" />
        <div className="marquee gap-3">
          {[...STORE_LIST, ...STORE_LIST].map((s, i) => (
            <span key={i} className="chip shrink-0 border px-4 py-2 text-sm" style={{ color: s.color, borderColor: `${s.color}55`, background: `${s.color}14` }}>
              <Store className="h-4 w-4" /> {s.name}
            </span>
          ))}
        </div>
      </section>

      {/* ───────────── Superpowers ───────────── */}
      <section className="grid gap-4 md:grid-cols-3">
        <Feature href="/assistant" icon={<Sparkles />} title="What should I buy?" body="Describe your needs in plain words. I research specs, reviews, history and coupons, then explain the tradeoffs." gradient="linear-gradient(135deg,#db2777,#7c3aed)" photo={hero[0]?.photo} />
        <Feature href="/should-i-buy" icon={<BadgeCheck />} title="Should I buy this?" body="Paste any Amazon, Flipkart or Myntra link for an honest BUY / WAIT / AVOID with reasons." gradient="linear-gradient(135deg,#059669,#0891b2)" photo={hero[4]?.photo} />
        <Feature href="/visual-search" icon={<ScanSearch />} title="Find this for less" body="Upload a screenshot from Instagram or Pinterest — get the exact product or look-alikes for less." gradient="linear-gradient(135deg,#ea580c,#e11d48)" photo={hero[1]?.photo} />
      </section>

      {/* ───────────── Categories ───────────── */}
      <Section title="Shop by category" subtitle="Every category has its own colour — spot things at a glance">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {CATEGORY_LIST.map((c, i) => {
            const cover = categoryCover(c.id, 0);
            const big = i === 0 || i === 2;
            return (
              <Link
                key={c.id}
                href={`/search?category=${c.id}`}
                className={`card-glow group relative overflow-hidden rounded-3xl ${big ? "row-span-2 min-h-[300px]" : "min-h-[144px]"}`}
                style={{ background: c.gradient }}
              >
                {cover && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80 mix-blend-luminosity transition duration-700 group-hover:scale-110 group-hover:opacity-95 group-hover:mix-blend-normal" loading="lazy" />
                )}
                <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${c.accent}f0 0%, ${c.accent}66 45%, transparent 100%)` }} />
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <span className="mb-2 grid h-9 w-9 place-items-center rounded-xl bg-white/25 backdrop-blur">
                    <CategoryIcon category={c.id} className="h-5 w-5" />
                  </span>
                  <p className="font-display text-lg font-semibold leading-tight drop-shadow">{c.label}</p>
                  <p className="text-xs text-white/85">{c.blurb}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </Section>

      {/* ───────────── Trending ───────────── */}
      <Section title="Trending now" subtitle="Top-rated across every store" action={<Link href="/search" className="text-sm font-semibold text-accent">See all</Link>}>
        <div className="scroll-row">
          {trending.map((p) => (
            <div key={p.id} className="w-60">
              <ProductCard p={cardFrom(p)} wished={wishedIds.has(p.id)} />
            </div>
          ))}
        </div>
      </Section>

      {/* ───────────── Sale reality check spotlight ───────────── */}
      {spotlight && genuine && (
        <Section title="Sale reality check" subtitle="Not every “sale” is a deal. Here's what 180 days of price history says today.">
          <div className="grid gap-4 lg:grid-cols-2">
            <RealityTile product={spotlight.product} reality={spotlight.reality} tone="bad" />
            <RealityTile product={genuine.product} reality={genuine.reality} tone="good" />
          </div>
        </Section>
      )}

      {/* ───────────── Real deals ───────────── */}
      <Section
        title={
          <span className="inline-flex items-center gap-2">
            <TrendingDown className="h-6 w-6 text-good" /> Real deals today
          </span>
        }
        subtitle="Verified against price history — genuinely below their usual price"
      >
        <div className="scroll-row">
          {deals.map((d) => (
            <div key={d.product.id} className="w-60">
              <ProductCard p={cardFrom(d.product)} badge={`${Math.round(d.reality.realDiscountPct)}% below usual`} wished={wishedIds.has(d.product.id)} />
            </div>
          ))}
        </div>
      </Section>

      {/* ───────────── Curated lists ───────────── */}
      <Section title="Curated for you" subtitle="Ready-made lists with the cheapest store already picked">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {curated.map((l) => {
            const t = themeFor(l.category);
            const total = l.products.reduce((s, p) => s + p.bestOffer.price, 0);
            return (
              <div key={l.id} className="card card-glow flex flex-col overflow-hidden">
                <div className="relative grid h-40 grid-cols-2 grid-rows-2 gap-0.5">
                  {l.products.slice(0, 4).map((p) => (
                    <ProductArt key={p.id} photo={p.photo} fit={p.photoFit} category={p.category} alt={p.name} className="h-full w-full rounded-none" />
                  ))}
                  <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${t.accent}ee, transparent 70%)` }} />
                  <div className="absolute bottom-3 left-4 right-4 text-white">
                    <p className="font-display text-lg font-semibold leading-tight drop-shadow">{l.name}</p>
                    <p className="text-xs text-white/85">{l.blurb}</p>
                  </div>
                </div>
                <div className="mt-auto flex items-center justify-between gap-2 px-4 py-3">
                  <span className="text-sm text-muted">
                    <b className="text-fg">{inr(total)}</b> · {l.products.length} items
                  </span>
                  <SaveListButton name={l.name} emoji={t.accent} items={l.products.map((p) => ({ title: p.name, productId: p.id }))} />
                </div>
              </div>
            );
          })}
        </div>
      </Section>

      {/* ───────────── Your lists ───────────── */}
      <Section title="Your lists" action={<NewListButton />}>
        {lists?.length ? (
          <div className="scroll-row">
            {lists.map((l, i) => {
              const tint = String(l.emoji).startsWith("#") ? String(l.emoji) : ["#a855f7", "#ec4899", "#f59e0b", "#22c55e", "#06b6d4"][i % 5];
              return (
                <Link key={l.id} href={`/lists/${l.id}`} className="card card-glow w-56 p-4">
                  <span className="grid h-10 w-10 place-items-center rounded-xl text-white" style={{ background: `linear-gradient(135deg, ${tint}, ${tint}99)` }}>
                    <Sparkles className="h-5 w-5" />
                  </span>
                  <p className="mt-3 font-semibold">{l.name}</p>
                  <p className="text-xs text-muted">
                    {(l.list_items as unknown as { count: number }[])[0]?.count ?? 0} items {l.source === "ai" && "· AI-curated"}
                  </p>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="card p-5 text-sm text-muted">No lists yet — create one, or save a curated list above.</p>
        )}
      </Section>

      {!!viewed?.length && (
        <Section title="Recently viewed" action={<Link href="/history" className="text-sm font-semibold text-accent">See history</Link>}>
          <div className="scroll-row">
            {viewed.map((v) => (
              <div key={v.product_id} className="w-56">
                <ProductCard p={cardFromSnapshot(v.product_id, v.snapshot as ProductSnapshot)} wished={wishedIds.has(v.product_id)} />
              </div>
            ))}
          </div>
        </Section>
      )}

      {!!wishlist?.length && (
        <Section title="Your wishlist" action={<Link href="/wishlist" className="text-sm font-semibold text-accent">View all</Link>}>
          <div className="scroll-row">
            {wishlist.map((w) => (
              <div key={w.product_id} className="w-56">
                <ProductCard p={cardFromSnapshot(w.product_id, w.snapshot as ProductSnapshot)} wished />
              </div>
            ))}
          </div>
        </Section>
      )}

      {!!searches?.length && (
        <Section title="Pick up where you left off">
          <div className="flex flex-wrap gap-2">
            {searches.map((s, i) => {
              const Icon = s.kind === "assistant" ? Sparkles : s.kind === "link" ? Link2 : s.kind === "image" ? ScanSearch : HistoryIcon;
              return (
                <Link
                  key={i}
                  href={s.kind === "assistant" ? `/assistant?q=${encodeURIComponent(s.query)}` : s.kind === "link" ? `/should-i-buy?url=${encodeURIComponent(s.query)}` : `/search?q=${encodeURIComponent(s.query)}`}
                  className="chip max-w-xs border border-line bg-surface py-2 text-sm text-fg backdrop-blur hover:border-accent/50"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-accent" /> <span className="truncate">{s.query}</span>
                </Link>
              );
            })}
          </div>
        </Section>
      )}

      {/* ───────────── How it works ───────────── */}
      <section className="card relative overflow-hidden p-6 sm:p-10">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <h2 className="font-display text-2xl font-semibold sm:text-3xl">How Shoppiee shops with you</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Search, t: "Understand", d: "Tell me what you need — words, a link or a screenshot.", c: "#f472b6" },
            { icon: Brain, t: "Research", d: "Specs, reviews, complaints and 6 months of prices across 14 stores.", c: "#a78bfa" },
            { icon: Wallet, t: "Real price", d: "Coupons, bank offers and cashback applied — the price you actually pay.", c: "#22d3ee" },
            { icon: Clock, t: "Buy or wait", d: "Honest BUY / WAIT / AVOID, then checkout on each store, one by one.", c: "#a3e635" },
          ].map((s, i) => (
            <div key={s.t} className="relative">
              <span className="font-display text-5xl font-bold opacity-15">0{i + 1}</span>
              <span className="mt-2 grid h-11 w-11 place-items-center rounded-2xl" style={{ background: `${s.c}22`, color: s.c, boxShadow: `0 0 24px ${s.c}33` }}>
                <s.icon className="h-5 w-5" />
              </span>
              <p className="mt-3 font-semibold">{s.t}</p>
              <p className="text-sm text-muted">{s.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Feature({ href, icon, title, body, gradient, photo }: { href: string; icon: React.ReactNode; title: string; body: string; gradient: string; photo?: string }) {
  return (
    <Link href={href} className="card-glow group relative min-h-[210px] overflow-hidden rounded-3xl p-6 text-white shadow-xl" style={{ background: gradient }}>
      {photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo} alt="" className="absolute -bottom-6 -right-6 h-40 w-32 rotate-12 rounded-2xl bg-white object-cover opacity-90 shadow-2xl ring-4 ring-white/30 transition duration-500 group-hover:rotate-6 group-hover:scale-110" />
      )}
      <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur [&>svg]:h-6 [&>svg]:w-6">{icon}</span>
      <p className="relative mt-4 max-w-[70%] font-display text-xl font-semibold">{title}</p>
      <p className="relative mt-1 max-w-[70%] text-sm text-white/85">{body}</p>
      <span className="relative mt-4 inline-flex items-center gap-1 text-sm font-semibold">
        Try it <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

function RealityTile({
  product,
  reality,
  tone,
}: {
  product: import("@/lib/types").ProductWithOffers;
  reality: import("@/lib/analysis/fakeDiscount").RealityCheck;
  tone: "good" | "bad";
}) {
  const good = tone === "good";
  const color = good ? "#4ade80" : "#f87171";
  const Icon = good ? ShieldCheck : ShieldAlert;
  const max = Math.max(reality.advertisedDiscountPct, Math.max(0, reality.realDiscountPct), 10);
  return (
    <Link href={`/product/${product.id}`} className="card card-glow flex gap-4 p-4 sm:p-5">
      <ProductArt photo={product.photo} fit={product.photoFit} category={product.category} alt={product.name} className="h-36 w-28 rounded-2xl sm:h-44 sm:w-36" />
      <div className="min-w-0 flex-1 space-y-2">
        <span className="chip" style={{ background: `${color}22`, color }}>
          <Icon className="h-3.5 w-3.5" /> {good ? "Genuine deal" : "Inflated discount"}
        </span>
        <p className="line-clamp-2 font-semibold">
          {product.brand} {product.name}
        </p>
        <p className="font-display text-2xl font-bold">
          {inr(product.bestOffer.price)} <span className="text-sm font-normal text-muted line-through">{inr(product.bestOffer.mrp)}</span>
        </p>
        <div className="space-y-1.5 text-xs">
          <Bar label="Advertised" value={reality.advertisedDiscountPct} max={max} color="#c084fc" />
          <Bar label="Real (vs 30-day avg)" value={Math.max(0, reality.realDiscountPct)} max={max} color={color} />
        </div>
      </div>
    </Link>
  );
}

function Bar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  return (
    <div>
      <div className="mb-0.5 flex justify-between">
        <span className="text-muted">{label}</span>
        <b style={{ color }}>{Math.round(value)}%</b>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full" style={{ width: `${Math.max(3, (value / max) * 100)}%`, background: color, boxShadow: `0 0 12px ${color}` }} />
      </div>
    </div>
  );
}
