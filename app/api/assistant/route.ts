import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { runAssistant } from "@/lib/ai/assistant";
import { logSearch } from "@/lib/history";
import { createClient } from "@/lib/supabase/server";
import type { ProductInsight } from "@/lib/analysis/insights";

export const maxDuration = 120;

const Body = z.object({ text: z.string().min(2).max(2000), context: z.string().max(4000).optional() });

function dto(i: ProductInsight) {
  const p = i.product;
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    photo: p.photo,
    photoFit: p.photoFit,
    category: p.category,
    rating: p.rating,
    reviewCount: p.reviewCount,
    specs: p.specs,
    price: p.bestOffer.price,
    mrp: p.bestOffer.mrp,
    store: p.bestOffer.store,
    url: p.bestOffer.url,
    storeCount: p.offers.length,
    realPrice: i.real.effective,
    coupon: i.real.coupon?.code ?? null,
    avg30: i.stats.avg30,
    lowest: i.stats.lowest,
    reality: i.reality.level,
    complaints: i.complaints,
    pros: i.pros,
    score: i.score?.total ?? 0,
  };
}

export type AssistantProduct = ReturnType<typeof dto>;

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please log in" }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Tell me a bit more about what you need." }, { status: 400 });

  const { text, context } = parsed.data;
  const fullText = context ? `${context}\nFollow-up: ${text}` : text;
  await logSearch(text, "assistant");
  const result = await runAssistant(fullText);

  const byId = new Map(result.ranked.map((r) => [r.product.id, r]));
  const picks = result.rec.picks
    .map((p) => {
      const ins = byId.get(p.productId);
      return ins ? { ...p, product: dto(ins) } : null;
    })
    .filter(Boolean);
  const pickIds = new Set(result.rec.picks.map((p) => p.productId));

  return NextResponse.json({
    need: result.need,
    intro: result.rec.intro,
    tradeoffs: result.rec.tradeoffs,
    tip: result.rec.tip,
    picks,
    others: result.ranked.filter((r) => !pickIds.has(r.product.id)).slice(0, 6).map(dto),
    compared: result.ranked.length,
    ai: result.ai,
    budgetRelaxed: result.budgetRelaxed,
  });
}
