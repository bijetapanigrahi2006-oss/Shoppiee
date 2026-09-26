import { notFound } from "next/navigation";
import { Sparkles } from "lucide-react";
import { requireUser } from "@/lib/supabase/server";
import { CURATED_LISTS, resolveCurated } from "@/lib/curated";
import { themeFor } from "@/lib/theme/categories";
import { cardFrom } from "@/lib/snapshot";
import { inr } from "@/lib/utils";
import { ProductCard } from "@/components/product/ProductCard";
import { AddAllToCartButton } from "@/components/product/ActionButtons";
import { SaveListButton } from "@/components/lists/ListButtons";
import { PhotoTile } from "@/components/ui/PhotoTile";
import { Section } from "@/components/ui/Section";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

export default async function CuratedListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const list = CURATED_LISTS.find((l) => l.id === id);
  if (!list) notFound();

  const { supabase, user } = await requireUser();
  const [products, { data: wish }, others] = await Promise.all([
    resolveCurated(list),
    supabase.from("wishlist").select("product_id").eq("user_id", user.id),
    Promise.all(CURATED_LISTS.filter((l) => l.id !== id).map(async (l) => ({ ...l, cover: (await resolveCurated(l))[0] }))),
  ]);
  const wished = new Set((wish ?? []).map((w) => w.product_id as string));
  const t = themeFor(list.category);
  const total = products.reduce((s, p) => s + p.bestOffer.price, 0);
  const mrp = products.reduce((s, p) => s + p.bestOffer.mrp, 0);
  const stores = new Set(products.map((p) => p.bestOffer.store)).size;

  return (
    <div className="space-y-10">
      {/* Hero in the photo-tile style: collage under the list's colour */}
      <section className="tile min-h-[320px] hover:transform-none sm:min-h-[360px]" style={{ background: t.gradient, ["--tile-accent" as string]: t.accent }}>
        <div className="absolute inset-0 z-0 grid grid-cols-3 grid-rows-2 gap-1 opacity-85 mix-blend-luminosity sm:grid-cols-5">
          {products.slice(0, 5).map((p, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={p.id} src={p.photo} alt="" className={`h-full w-full object-cover ${i === 0 ? "col-span-2 row-span-2" : ""}`} />
          ))}
        </div>
        <div className="tile-shade" style={{ background: `linear-gradient(to top, ${t.accent}f7 0%, ${t.accent}c0 35%, ${t.accent}40 70%, transparent 100%), linear-gradient(to top, rgb(0 0 0 / 0.3), transparent 50%)` }} />
        <div className="relative z-[3] space-y-4 p-6 sm:p-8">
          <span className="tile-icon">
            <CategoryIcon category={list.category} />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/85">
              <Sparkles className="mr-1 inline h-3.5 w-3.5" /> Curated by Shoppiee
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight [text-shadow:0_2px_16px_rgb(0_0_0/0.3)] sm:text-5xl">{list.name}</h1>
            <p className="mt-1 text-white/90">{list.blurb}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-2xl bg-white/20 px-4 py-2 backdrop-blur">
              <b className="font-display text-xl">{inr(total)}</b>
              {mrp > total && <span className="ml-2 text-sm text-white/80 line-through">{inr(mrp)}</span>}
              <span className="block text-xs text-white/85">
                {products.length} items · cheapest across {stores} {stores === 1 ? "store" : "stores"}
              </span>
            </span>
            <AddAllToCartButton items={products.map((p) => ({ productId: p.id, store: p.bestOffer.store }))} className="h-12 px-6" />
            <SaveListButton name={list.name} emoji={t.accent} items={products.map((p) => ({ title: p.name, productId: p.id }))} className="tile-btn h-12 px-5" />
          </div>
        </div>
      </section>

      <Section title="In this list" subtitle="Each item already points at its cheapest store">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
          {products.map((p) => (
            <ProductCard key={p.id} p={cardFrom(p)} wished={wished.has(p.id)} />
          ))}
        </div>
      </Section>

      <Section title="More curated lists">
        <div className="scroll-row">
          {others.map((l) => {
            const lt = themeFor(l.category);
            return <PhotoTile key={l.id} href={`/lists/curated/${l.id}`} title={l.name} subtitle={l.blurb} photo={l.cover?.photo} fit={l.cover?.photoFit} gradient={lt.gradient} accent={lt.accent} duotone icon={<CategoryIcon category={l.category} />} className="h-64 w-60" />;
          })}
        </div>
      </Section>
    </div>
  );
}
