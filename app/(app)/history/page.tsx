import { History } from "lucide-react";
import Link from "next/link";
import { requireUser } from "@/lib/supabase/server";
import { cardFromSnapshot, type ProductSnapshot } from "@/lib/snapshot";
import { formatDate } from "@/lib/utils";
import { ProductCard } from "@/components/product/ProductCard";
import { PageHeader, Section } from "@/components/ui/Section";
import { ClearHistoryButton } from "@/components/settings/ClearHistoryButton";

const KIND = { search: "Search", assistant: "Assistant", link: "Link check", image: "Screenshot" } as const;

export default async function HistoryPage() {
  const { supabase, user } = await requireUser();
  const [{ data: searches }, { data: viewed }] = await Promise.all([
    supabase.from("search_history").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(60),
    supabase.from("viewed_products").select("*").eq("user_id", user.id).order("viewed_at", { ascending: false }).limit(24),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader icon={<History />} gradient="linear-gradient(135deg,#4f46e5,#9333ea 55%,#db2777)" title="Your history" subtitle="Searches, questions and products you've looked at." action={<ClearHistoryButton />} />
      <Section title="Recently viewed">
        {viewed?.length ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {viewed.map((v) => (
              <ProductCard key={v.product_id} p={cardFromSnapshot(v.product_id, v.snapshot as ProductSnapshot)} />
            ))}
          </div>
        ) : (
          <p className="card p-5 text-sm text-muted">Nothing viewed yet.</p>
        )}
      </Section>
      <Section title="Searches & questions">
        <ul className="card divide-y divide-line">
          {(searches ?? []).map((s) => {
            const href = s.kind === "assistant" ? `/assistant?q=${encodeURIComponent(s.query)}` : s.kind === "link" ? `/should-i-buy?url=${encodeURIComponent(s.query)}` : `/search?q=${encodeURIComponent(s.query)}`;
            return (
              <li key={s.id}>
                <Link href={href} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-2">
                  <span className="w-28 shrink-0 text-xs font-semibold text-muted">{KIND[s.kind as keyof typeof KIND]}</span>
                  <span className="line-clamp-1 flex-1 text-sm">{s.query}</span>
                  <span className="text-xs text-muted">{formatDate(s.created_at, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</span>
                </Link>
              </li>
            );
          })}
          {!searches?.length && <li className="p-5 text-sm text-muted">No searches yet.</li>}
        </ul>
      </Section>
    </div>
  );
}
