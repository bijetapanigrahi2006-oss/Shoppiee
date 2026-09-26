import { EmptyState } from "@/components/ui/EmptyState";
import { Heart } from "lucide-react";
import Link from "next/link";
import { requireUser } from "@/lib/supabase/server";
import { getProvider } from "@/lib/providers";
import { cardFrom, cardFromSnapshot, type ProductSnapshot } from "@/lib/snapshot";
import { inr } from "@/lib/utils";
import { ProductCard } from "@/components/product/ProductCard";
import { PageHeader } from "@/components/ui/Section";

export default async function WishlistPage() {
  const { supabase, user } = await requireUser();
  const { data: items } = await supabase.from("wishlist").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  const provider = getProvider();
  // Refresh with today's prices and flag drops since the item was saved.
  const rows = await Promise.all(
    (items ?? []).map(async (w) => {
      const snap = w.snapshot as ProductSnapshot;
      const live = await provider.getProduct(w.product_id);
      return { id: w.product_id, card: live ? cardFrom(live) : cardFromSnapshot(w.product_id, snap), was: snap.price };
    }),
  );

  return (
    <div>
      <PageHeader icon={<Heart />} title="Wishlist" subtitle="Saved for later — with live prices across stores." gradient="linear-gradient(135deg,#f43f5e,#ec4899 60%,#a855f7)" />
      {!rows.length ? (
        <EmptyState icon={Heart} title="Nothing saved yet" body="Tap the heart on any product to save it here." gradient="linear-gradient(135deg,#f43f5e,#a855f7)">
          <Link href="/" className="btn btn-primary">
            Explore
          </Link>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {rows.map((r) => (
            <ProductCard key={r.id} p={r.card} wished badge={r.card.price < r.was ? `↓ ${inr(r.was - r.card.price)} since saved` : undefined} />
          ))}
        </div>
      )}
    </div>
  );
}
