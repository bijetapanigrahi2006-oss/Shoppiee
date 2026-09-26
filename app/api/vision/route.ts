import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { identifyProducts, heuristicNeed, type VisionResult } from "@/lib/ai/tasks";
import { aiEnabled } from "@/lib/ai/claude";
import { getProvider } from "@/lib/providers";
import { logSearch } from "@/lib/history";
import type { ProductWithOffers } from "@/lib/types";

export const maxDuration = 60;

const TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"] as const;
type ImgType = (typeof TYPES)[number];

function dto(p: ProductWithOffers, similarity: number) {
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    photo: p.photo,
    photoFit: p.photoFit,
    category: p.category,
    rating: p.rating,
    price: p.bestOffer.price,
    mrp: p.bestOffer.mrp,
    store: p.bestOffer.store,
    url: p.bestOffer.url,
    offers: p.offers.filter((o) => o.inStock).map((o) => ({ store: o.store, price: o.price, url: o.url })).sort((a, b) => a.price - b.price),
    similarity,
  };
}
export type VisualMatch = ReturnType<typeof dto>;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please log in" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("image");
  const hint = String(form.get("hint") ?? "").slice(0, 300);
  if (!(file instanceof File)) return NextResponse.json({ error: "Please upload an image" }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Image is too large (max 5 MB)" }, { status: 400 });
  const mediaType = (TYPES as readonly string[]).includes(file.type) ? (file.type as ImgType) : null;
  if (!mediaType) return NextResponse.json({ error: "Use a PNG, JPG, WEBP or GIF image" }, { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());
  // Keep a copy in the user's private screenshots folder (best-effort).
  await supabase.storage.from("screenshots").upload(`${user.id}/${Date.now()}.${mediaType.split("/")[1]}`, bytes, { contentType: mediaType }).catch(() => null);

  let vision: VisionResult | null = await identifyProducts(bytes.toString("base64"), mediaType, hint || undefined);
  let aiUsed = !!vision;
  if (!vision || !vision.items.length) {
    aiUsed = false;
    if (!hint) {
      return NextResponse.json(
        {
          error: aiEnabled()
            ? "I couldn't spot a product in that image. Add a short hint like “white sneakers” and try again."
            : "AI image recognition isn't configured (ANTHROPIC_API_KEY). Add a short hint like “white sneakers” and I'll match by description.",
          needHint: true,
        },
        { status: 422 },
      );
    }
    const need = heuristicNeed(hint);
    const color = hint.toLowerCase().match(/white|black|pink|blue|red|green|grey|gray|beige|gold|silver|lavender|purple|brown|navy/)?.[0] ?? null;
    vision = {
      items: [{ label: hint, type: need.productType, category: need.category, color, style: null, material: null, brandGuess: null, keywords: hint.toLowerCase().split(/\s+/), visiblePrice: null }],
    };
  }
  await logSearch(vision.items[0].label, "image");

  const provider = getProvider();
  const results = await Promise.all(
    vision.items.slice(0, 3).map(async (item) => {
      const sims = await provider.findSimilar(
        { type: item.type, category: item.category, color: item.color ?? undefined, style: item.style ?? undefined, material: item.material ?? undefined, brand: item.brandGuess ?? undefined, keywords: item.keywords },
        16,
      );
      const matches = sims.map((s) => dto(s.product, s.similarity));
      const exact = matches.filter((m) => m.similarity >= 85 && (!item.brandGuess || m.brand.toLowerCase() === item.brandGuess.toLowerCase())).slice(0, 3);
      const exactIds = new Set(exact.map((e) => e.id));
      const similar = matches.filter((m) => !exactIds.has(m.id));
      const reference = item.visiblePrice ?? exact[0]?.price ?? Math.max(...matches.map((m) => m.price), 0);
      const forLess = matches
        .filter((m) => m.price < reference * 0.95)
        .sort((a, b) => b.price - a.price)
        .slice(0, 5);
      return { item, exact, similar: similar.slice(0, 8), forLess, reference };
    }),
  );

  return NextResponse.json({ ai: aiUsed, results });
}
