import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getProvider } from "@/lib/providers";
import { themeFor } from "@/lib/theme/categories";

/** Type-ahead suggestions for the header search: the top matching products. */
export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Sign in first" }, { status: 401 });

  const q = (req.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 80);
  if (q.length < 2) return NextResponse.json({ products: [] });

  const results = await getProvider().search(q);
  const products = results.slice(0, 6).map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    photo: p.photo,
    photoFit: p.photoFit,
    category: p.category,
    accent: themeFor(p.category).accent,
    price: p.bestOffer.price,
    stores: p.offers.length,
  }));
  return NextResponse.json({ products });
}
