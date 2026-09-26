import { notFound } from "next/navigation";
import { requireUser } from "@/lib/supabase/server";
import { getProvider } from "@/lib/providers";
import type { ProductSnapshot } from "@/lib/snapshot";
import { ListDetail, type ListRow } from "@/components/lists/ListDetail";

export default async function ListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireUser();
  const [{ data: list }, { data: items }] = await Promise.all([
    supabase.from("shopping_lists").select("*").eq("id", id).maybeSingle(),
    supabase.from("list_items").select("*").eq("list_id", id).order("created_at"),
  ]);
  if (!list) notFound();

  const provider = getProvider();
  // Free-text items get a suggested best match so they're one tap from buying.
  const rows: ListRow[] = await Promise.all(
    (items ?? []).map(async (it) => {
      if (it.product_id) {
        const live = await provider.getProduct(it.product_id);
        const snap = it.snapshot as ProductSnapshot;
        return {
          id: it.id,
          title: it.title,
          done: it.done,
          productId: it.product_id,
          photo: live?.photo ?? snap?.photo ?? "",
          photoFit: live?.photoFit ?? snap?.photoFit ?? "cover",
          category: snap?.category ?? live?.category ?? "electronics",
          price: live?.bestOffer.price ?? snap?.price ?? null,
          store: live?.bestOffer.store ?? snap?.store ?? null,
          suggestion: false,
        };
      }
      const match = (await provider.search(it.title))[0];
      return {
        id: it.id,
        title: it.title,
        done: it.done,
        productId: match?.id ?? null,
        photo: match?.photo ?? "",
        photoFit: match?.photoFit ?? "cover",
        category: match?.category ?? "electronics",
        price: match?.bestOffer.price ?? null,
        store: match?.bestOffer.store ?? null,
        suggestion: !!match,
        suggestionName: match?.name,
      };
    }),
  );

  return <ListDetail list={{ id: list.id, name: list.name, emoji: list.emoji, source: list.source }} rows={rows} />;
}
