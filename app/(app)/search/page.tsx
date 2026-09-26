import { SearchX, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Suspense } from "react";
import Link from "next/link";
import { getProvider } from "@/lib/providers";
import { rankProducts } from "@/lib/analysis/insights";
import { logSearch } from "@/lib/history";
import { cardFrom } from "@/lib/snapshot";
import { themeFor } from "@/lib/theme/categories";
import type { CategoryId, SearchFilters as Filters, StoreId } from "@/lib/types";
import { ProductCard } from "@/components/product/ProductCard";
import { SearchFilters } from "@/components/search/Filters";
import { TopPicks, TopPicksSkeleton } from "@/components/search/TopPicks";
import { CompareTable } from "@/components/search/CompareTable";
import { Section } from "@/components/ui/Section";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { requireUser } from "@/lib/supabase/server";

type SP = Promise<Record<string, string | undefined>>;

export default async function SearchPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const category = sp.category as CategoryId | undefined;
  const filters: Filters = {
    category,
    minRating: sp.rating ? Number(sp.rating) : undefined,
    maxPrice: sp.max ? Number(sp.max) : undefined,
    stores: sp.stores ? (sp.stores.split(",") as StoreId[]) : undefined,
    sort: (sp.sort as Filters["sort"]) ?? "score",
  };
  const provider = getProvider();
  const { supabase, user } = await requireUser();

  const [results, { data: wish }] = await Promise.all([
    q ? provider.search(q, filters) : provider.listProducts(filters),
    supabase.from("wishlist").select("product_id").eq("user_id", user.id),
    q ? logSearch(q) : Promise.resolve(),
  ]);
  const wished = new Set((wish ?? []).map((w) => w.product_id as string));

  let ranked = await rankProducts(results);
  if (filters.sort && filters.sort !== "score") {
    const order = new Map(results.map((r, i) => [r.id, i]));
    ranked = [...ranked].sort((a, b) => order.get(a.product.id)! - order.get(b.product.id)!);
  }
  const theme = themeFor(category ?? ranked[0]?.product.category);
  const title = q ? `Results for “${q}”` : category ? theme.label : "All products";
  const availableStores = [...new Set(results.flatMap((r) => r.offers.map((o) => o.store)))];
  const view = sp.view === "list" ? "list" : "grid";

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[28px] p-6 text-white shadow-2xl sm:p-8" style={{ background: theme.gradient }}>
        <div className="pointer-events-none absolute -right-10 -top-20 h-72 w-72 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute inset-y-0 right-0 hidden w-2/5 sm:flex">
          {ranked.slice(0, 3).map((r, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={r.product.id}
              src={r.product.photo}
              alt=""
              className="absolute top-1/2 h-36 w-28 -translate-y-1/2 rounded-2xl object-cover shadow-2xl ring-2 ring-white/40"
              style={{ right: `${8 + i * 22}%`, transform: `translateY(-50%) rotate(${(i - 1) * 8}deg)`, zIndex: 3 - i, background: "#fff" }}
            />
          ))}
        </div>
        <div className="relative flex items-center gap-4 sm:max-w-[60%]">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/20 ring-1 ring-white/30 backdrop-blur">
            <CategoryIcon category={category ?? ranked[0]?.product.category ?? "fashion"} className="h-7 w-7" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold tracking-tight sm:text-4xl">{title}</h1>
            <p className="mt-1 text-sm text-white/85">
              {ranked.length} products compared across {availableStores.length} stores
            </p>
          </div>
        </div>
      </div>

      <SearchFilters availableStores={availableStores} />

      {ranked.length === 0 ? (
        <EmptyState icon={SearchX} title="No matches yet" body={"Try different words, or describe what you need and I'll figure it out."}>
          <Link href={`/assistant?q=${encodeURIComponent(q)}`} className="btn btn-brand">
            <Sparkles className="h-4 w-4" /> Ask the assistant
          </Link>
        </EmptyState>
      ) : (
        <>
          {q && ranked.length >= 3 && (
            <Suspense fallback={<TopPicksSkeleton />}>
              <TopPicks query={q} ranked={ranked} />
            </Suspense>
          )}

          {ranked.length >= 2 && (
            <Section title="Price comparison" subtitle="Cheapest store highlighted in green · click a price to open that store">
              <CompareTable items={ranked.slice(0, 8)} />
            </Section>
          )}

          <Section title="All results">
            <div className={view === "grid" ? "grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4" : "flex flex-col gap-3"}>
              {ranked.map((i) => (
                <ProductCard key={i.product.id} p={cardFrom(i.product)} score={i.score?.total} realPrice={i.real.effective} wished={wished.has(i.product.id)} layout={view} />
              ))}
            </div>
          </Section>
        </>
      )}
    </div>
  );
}
