import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck, Brain, Clock, History as HistoryIcon, Link2, ListChecks, ScanSearch, Search, Sparkles, Store, Wallet } from "lucide-react";
import { requireUser } from "@/lib/supabase/server";
import { getProvider } from "@/lib/providers";
import { CATEGORY_LIST, themeFor } from "@/lib/theme/categories";
import { CURATED_LISTS, resolveCurated } from "@/lib/curated";
import { STORE_LIST } from "@/lib/stores";
import { categoryCover, photoOf } from "@/lib/providers/mock/catalog";
import { cardFromSnapshot, type ProductSnapshot } from "@/lib/snapshot";
import { inr } from "@/lib/utils";
import { OmniInput } from "@/components/home/OmniInput";
import { HeroSceneLoader } from "@/components/home/HeroSceneLoader";
import { AddToCartButton } from "@/components/product/ActionButtons";
import { NewListButton, SaveListButton } from "@/components/lists/ListButtons";
import { PhotoTile, ProductTile } from "@/components/ui/PhotoTile";
import { Section } from "@/components/ui/Section";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

function greeting() {
  const h = Number(new Date().toLocaleString("en-IN", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }));
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

const LIST_TINTS = ["#a855f7", "#ec4899", "#f59e0b", "#22c55e", "#06b6d4"];

export default async function HomePage() {
  const { supabase, user } = await requireUser();
  const provider = getProvider();
  const [{ data: profile }, { data: lists }, { data: viewed }, { data: wishlist }, { data: searches }, all, curated] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    supabase.from("shopping_lists").select("id, name, emoji, source, list_items(product_id)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(8),
    supabase.from("viewed_products").select("product_id, snapshot").eq("user_id", user.id).order("viewed_at", { ascending: false }).limit(10),
    supabase.from("wishlist").select("product_id, snapshot").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
    supabase.from("search_history").select("query, kind, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(8),
    provider.listProducts(),
    Promise.all(CURATED_LISTS.map(async (l) => ({ ...l, products: await resolveCurated(l) }))),
  ]);

  // Hand-picked hero shots: bold studio photos across colourful categories.
  const HERO_PICKS = ["Bloom Eau de Parfum", "Bridal Velvet Lehenga", "AirPods Pro", "Kurkure Masala Munch", "iPhone 15", "Air Force 1", "Raga Viva", "Tote Handbag", "Dairy Milk Silk", "J'adore", "Gold-Plated Kundan Jhumkas", "MacBook Air"];
  const hero = HERO_PICKS.map((n) => all.find((p) => p.name.startsWith(n) && p.photo))
    .filter((p): p is NonNullable<typeof p> => !!p)
    .map((p) => ({ id: p.id, photo: p.photo, name: p.name, fit: p.photoFit, price: p.bestOffer.price, brand: p.brand }));
  const heroPhoto = (name: string) => hero.find((h) => h.name.startsWith(name))?.photo;

  const firstName = ((profile?.full_name as string) || user.email?.split("@")[0] || "there").split(" ")[0];

  return (
    <div className="space-y-16">
      {/* ───────────── Hero ───────────── */}
      <section className="relative -mt-4 grid items-center gap-6 lg:grid-cols-[1.05fr_1fr]">
        <div className="relative z-10 space-y-6 pt-4">
          <Link href="#stores" className="chip border border-line bg-surface py-1.5 text-muted backdrop-blur transition hover:border-accent/50 hover:text-fg">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Comparing {STORE_LIST.length} stores · {all.length} products
          </Link>
          <div>
            <p className="text-lg font-medium text-muted">
              {greeting()}, {firstName}
            </p>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-6xl">
              The app that <span className="brand-text">shops with you.</span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-muted sm:text-lg">
              Real prices across Amazon, Flipkart, Myntra, Nykaa, Blinkit and more, with price history, fake-discount detection and honest AI advice.
            </p>
          </div>
          <OmniInput />
          <div className="grid max-w-lg grid-cols-3 gap-3">
            {[
              { k: `${STORE_LIST.length}`, v: "stores compared", c: "#f472b6", href: "#stores" },
              { k: "180d", v: "price history", c: "#22d3ee", href: "/should-i-buy" },
              { k: `${all.length}`, v: "products tracked", c: "#a3e635", href: "/search" },
            ].map((s) => (
              <Link key={s.v} href={s.href} className="card card-glow group relative px-4 py-3">
                <ArrowUpRight className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-muted opacity-0 transition group-hover:opacity-100" />
                <p className="font-display text-2xl font-bold" style={{ color: s.c, textShadow: `0 0 24px ${s.c}66` }}>
                  {s.k}
                </p>
                <p className="text-xs text-muted">{s.v}</p>
              </Link>
            ))}
          </div>
        </div>
        <div className="relative h-[400px] sm:h-[540px]">
          <div className="pointer-events-none absolute inset-6 rounded-full bg-[conic-gradient(from_200deg,#ec489955,#8b5cf655,#06b6d455,#f59e0b44,#ec489955)] blur-3xl" />
          <HeroSceneLoader products={hero} />
          <p className="pointer-events-none absolute bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-muted">Drag to spin · tap a product to open it</p>
        </div>
      </section>

      {/* ───────────── Store marquee ───────────── */}
      <section id="stores" className="relative -mx-4 scroll-mt-24 overflow-hidden py-2 sm:-mx-6" aria-label="Stores we compare">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[var(--bg)] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[var(--bg)] to-transparent" />
        <div className="marquee gap-3">
          {[...STORE_LIST, ...STORE_LIST].map((s, i) => (
            <Link
              key={i}
              href={`/search?stores=${s.id}`}
              title={`Browse everything on ${s.name}`}
              className="chip shrink-0 border px-4 py-2 text-sm transition hover:scale-105"
              style={{ color: s.color, borderColor: `${s.color}66`, background: `${s.color}1a`, boxShadow: `0 0 18px -6px ${s.color}` }}
              tabIndex={i >= STORE_LIST.length ? -1 : undefined}
            >
              <Store className="h-4 w-4" /> {s.name}
            </Link>
          ))}
        </div>
      </section>

      {/* ───────────── Superpowers ───────────── */}
      <Section title="Your shopping superpowers" subtitle="Three ways Shoppiee does the hard work for you">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { href: "/assistant", icon: <Sparkles />, title: "What should I buy?", body: "Describe your needs in plain words. I research specs, reviews, history and coupons, then explain the tradeoffs.", gradient: "linear-gradient(135deg,#f472b6 0%,#db2777 35%,#7c3aed 75%,#3b0764 100%)", accent: "#c026d3", photo: heroPhoto("MacBook Air") },
            { href: "/should-i-buy", icon: <BadgeCheck />, title: "Should I buy this?", body: "Paste any Amazon, Flipkart or Myntra link for an honest BUY, WAIT or AVOID, with the reasons.", gradient: "linear-gradient(135deg,#6ee7b7 0%,#059669 35%,#0e7490 75%,#083344 100%)", accent: "#0d9488", photo: heroPhoto("iPhone 15") },
            { href: "/visual-search", icon: <ScanSearch />, title: "Find this for less", body: "Upload a screenshot from Instagram or Pinterest and get the exact product, or look-alikes for less.", gradient: "linear-gradient(135deg,#fdba74 0%,#f97316 35%,#e11d48 75%,#4c0519 100%)", accent: "#e11d48", photo: heroPhoto("Bridal Velvet Lehenga") },
          ].map((f) => (
            <PhotoTile
              key={f.href}
              href={f.href}
              title={f.title}
              subtitle={f.body}
              photo={f.photo}
              gradient={f.gradient}
              accent={f.accent}
              duotone
              icon={f.icon}
              meta={
                <span className="inline-flex items-center gap-1 font-semibold">
                  Try it <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              }
              className="min-h-[280px]"
            />
          ))}
        </div>
      </Section>

      {/* ───────────── Categories ───────────── */}
      <Section title="Shop by category" subtitle="Every category has its own colour, so you can spot things at a glance">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {CATEGORY_LIST.map((c, i) => {
            const big = i === 0 || i === 2;
            return (
              <PhotoTile
                key={c.id}
                href={`/search?category=${c.id}`}
                title={c.label}
                subtitle={c.blurb}
                photo={categoryCover(c.id, 0)}
                gradient={c.gradient}
                accent={c.accent}
                duotone
                icon={<CategoryIcon category={c.id} />}
                className={big ? "row-span-2 min-h-[300px]" : "min-h-[144px]"}
              />
            );
          })}
        </div>
      </Section>

      {/* ───────────── Curated lists ───────────── */}
      <Section title="Curated for you" subtitle="Ready-made lists with the cheapest store already picked">
        <div className="grid grid-flow-dense grid-cols-2 gap-3 lg:grid-cols-4">
          {curated.map((l, i) => {
            const t = themeFor(l.category);
            const total = l.products.reduce((s, p) => s + p.bestOffer.price, 0);
            const size = i === 0 ? "col-span-2 row-span-2 min-h-[380px]" : i === 5 ? "col-span-2 min-h-[210px]" : "min-h-[210px]";
            return (
              <PhotoTile
                key={l.id}
                href={`/lists/curated/${l.id}`}
                title={l.name}
                subtitle={l.blurb}
                photo={l.products[0]?.photo}
                fit={l.products[0]?.photoFit}
                gradient={t.gradient}
                accent={t.accent}
                duotone
                icon={<CategoryIcon category={l.category} />}
                className={size}
                meta={
                  <span className="flex items-center gap-2">
                    <span className="flex -space-x-2">
                      {l.products.slice(1, 4).map((p) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={p.id} src={p.photo} alt="" className="h-7 w-7 rounded-full bg-white object-cover ring-2 ring-white/70" />
                      ))}
                    </span>
                    <span className="text-xs">
                      <b className="text-sm">{inr(total)}</b> · {l.products.length} items
                    </span>
                  </span>
                }
                action={<SaveListButton name={l.name} emoji={t.accent} items={l.products.map((p) => ({ title: p.name, productId: p.id }))} className="tile-btn" />}
              />
            );
          })}
        </div>
      </Section>

      {/* ───────────── Your lists ───────────── */}
      <Section title="Your lists" subtitle="Your own shopping lists, and the ones you saved" action={<Link href="/lists" className="text-sm font-semibold text-accent">See all</Link>}>
        <div className="scroll-row">
          <div className="flex h-64 w-56 rounded-[28px] border-2 border-dashed border-line bg-surface transition hover:border-accent/60">
            <NewListButton className="!h-full !w-full !flex-col !gap-3 !rounded-[26px] !border-0 !bg-transparent text-base [&>svg]:h-11 [&>svg]:w-11 [&>svg]:rounded-2xl [&>svg]:bg-accent/20 [&>svg]:p-2.5 [&>svg]:text-accent" label="New list" />
          </div>
          {(lists ?? []).map((l, i) => {
            const tint = String(l.emoji).startsWith("#") ? String(l.emoji) : LIST_TINTS[i % LIST_TINTS.length];
            const items = (l.list_items ?? []) as { product_id: string | null }[];
            const first = items.find((it) => it.product_id)?.product_id;
            const cover = first ? photoOf(first) : undefined;
            return (
              <PhotoTile
                key={l.id}
                href={`/lists/${l.id}`}
                title={l.name}
                photo={cover?.photo || undefined}
                fit={cover?.photoFit}
                gradient={`linear-gradient(135deg, ${tint} 0%, ${tint}cc 45%, #1a1030 100%)`}
                accent={tint}
                duotone
                icon={<ListChecks />}
                subtitle={`${items.length} ${items.length === 1 ? "item" : "items"}${l.source === "ai" ? " · AI-curated" : ""}`}
                className="h-64 w-56"
              />
            );
          })}
        </div>
      </Section>

      {!!viewed?.length && (
        <Section title="Recently viewed" subtitle="Jump back in, or add to cart straight from here" action={<Link href="/history" className="text-sm font-semibold text-accent">See history</Link>}>
          <div className="scroll-row">
            {viewed.map((v) => (
              <ProductTile key={v.product_id} p={cardFromSnapshot(v.product_id, v.snapshot as ProductSnapshot)} className="w-52" action={<AddToCartButton productId={v.product_id} small iconOnly className="tile-btn" />} />
            ))}
          </div>
        </Section>
      )}

      {!!wishlist?.length && (
        <Section title="Your wishlist" subtitle="Saved for later, with today's best price" action={<Link href="/wishlist" className="text-sm font-semibold text-accent">View all</Link>}>
          <div className="scroll-row">
            {wishlist.map((w) => (
              <ProductTile key={w.product_id} p={cardFromSnapshot(w.product_id, w.snapshot as ProductSnapshot)} className="w-52" action={<AddToCartButton productId={w.product_id} small iconOnly className="tile-btn" />} />
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
                  className="chip max-w-xs border border-line bg-surface py-2 text-sm text-fg backdrop-blur transition hover:-translate-y-0.5 hover:border-accent/50"
                  data-ripple
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-accent" /> <span className="truncate">{s.query}</span>
                </Link>
              );
            })}
          </div>
        </Section>
      )}

      {/* ───────────── How it works ───────────── */}
      <Section title="How Shoppiee shops with you" subtitle="Four steps, from what you need to the best place to buy it">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { icon: <Search />, t: "Understand", d: "Tell me what you need: words, a link or a screenshot.", href: "/assistant", cat: "beauty", g: "linear-gradient(135deg,#f9a8d4 0%,#ec4899 40%,#9d174d 100%)", a: "#db2777" },
            { icon: <Brain />, t: "Research", d: "Specs, reviews, complaints and 6 months of prices across 14 stores.", href: "/search", cat: "electronics", g: "linear-gradient(135deg,#c4b5fd 0%,#8b5cf6 40%,#4c1d95 100%)", a: "#7c3aed" },
            { icon: <Wallet />, t: "Real price", d: "Coupons, bank offers and cashback applied: the price you actually pay.", href: "/search?sort=price", cat: "snacks", g: "linear-gradient(135deg,#a5f3fc 0%,#06b6d4 40%,#164e63 100%)", a: "#0891b2" },
            { icon: <Clock />, t: "Buy or wait", d: "An honest BUY, WAIT or AVOID, then checkout on each store, one by one.", href: "/should-i-buy", cat: "fashion", g: "linear-gradient(135deg,#d9f99d 0%,#84cc16 40%,#365314 100%)", a: "#65a30d" },
          ].map((s, i) => (
            <PhotoTile key={s.t} href={s.href} title={s.t} subtitle={s.d} eyebrow={`Step 0${i + 1}`} photo={categoryCover(s.cat, 1)} gradient={s.g} accent={s.a} duotone icon={s.icon} className="min-h-[250px]" />
          ))}
        </div>
      </Section>
    </div>
  );
}
