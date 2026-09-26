import Link from "next/link";
import { getCatalog } from "@/lib/providers/mock/catalog";
import { Logo } from "@/components/brand/Logo";

const SPOTS = [
  { left: "6%", top: "10%", rot: -10, size: 132 },
  { left: "78%", top: "8%", rot: 8, size: 120 },
  { left: "3%", top: "62%", rot: 6, size: 150 },
  { left: "82%", top: "58%", rot: -8, size: 140 },
  { left: "20%", top: "80%", rot: -4, size: 104 },
  { left: "66%", top: "82%", rot: 10, size: 110 },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  // A few real product photos floating around the form.
  const picks = ["fashion", "beauty", "jewellery", "snacks", "footwear", "electronics"]
    .map((c) => getCatalog().products.find((p) => p.category === c && p.photo && p.rating >= 4.3))
    .filter(Boolean);

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-10">
      <div className="pointer-events-none absolute inset-0 hidden sm:block">
        {picks.map((p, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={p!.id}
            src={p!.photo}
            alt=""
            className="animate-float absolute rounded-3xl bg-white object-cover opacity-80 shadow-2xl ring-1 ring-white/20"
            style={{ left: SPOTS[i].left, top: SPOTS[i].top, width: SPOTS[i].size, height: SPOTS[i].size * 1.2, rotate: `${SPOTS[i].rot}deg`, animationDelay: `${i * 0.6}s` }}
          />
        ))}
      </div>
      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-8 flex justify-center">
          <Logo size={48} />
        </Link>
        {children}
        <p className="mt-6 text-center text-xs text-muted">Compare prices across 14 stores · Price history · Honest AI advice</p>
      </div>
    </div>
  );
}
