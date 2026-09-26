"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Home,
  Sparkles,
  ShoppingCart,
  Heart,
  History,
  CreditCard,
  Package,
  User,
  Settings,
  Palette,
  LogOut,
  X,
  Search,
  ScanSearch,
  BadgeCheck,
  ListChecks,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/toast";
import { Logo, LogoMark } from "@/components/brand/Logo";

interface ShellProps {
  user: { name: string; email: string; avatar: string };
  cartCount: number;
  wishCount: number;
  children: React.ReactNode;
}

const NAV = [
  {
    section: "Shop",
    items: [
      { href: "/", label: "Home", icon: Home, color: "#a78bfa" },
      { href: "/assistant", label: "What should I buy?", icon: Sparkles, color: "#f472b6" },
      { href: "/should-i-buy", label: "Should I buy this?", icon: BadgeCheck, color: "#4ade80" },
      { href: "/visual-search", label: "Screenshot search", icon: ScanSearch, color: "#22d3ee" },
      { href: "/lists", label: "My lists", icon: ListChecks, color: "#fbbf24" },
    ],
  },
  {
    section: "You",
    items: [
      { href: "/cart", label: "Cart", icon: ShoppingCart, color: "#fb923c", badge: "cart" },
      { href: "/wishlist", label: "Wishlist", icon: Heart, color: "#fb7185", badge: "wish" },
      { href: "/orders", label: "Buying history", icon: Package, color: "#38bdf8" },
      { href: "/payments", label: "Payment history", icon: CreditCard, color: "#2dd4bf" },
      { href: "/history", label: "Search history", icon: History, color: "#818cf8" },
    ],
  },
  {
    section: "Account",
    items: [
      { href: "/profile", label: "Profile", icon: User, color: "#c084fc" },
      { href: "/settings", label: "Settings", icon: Settings, color: "#94a3b8" },
      { href: "/display", label: "Display", icon: Palette, color: "#facc15" },
    ],
  },
] as const;

/** Four-line menu glyph that morphs slightly on hover. */
function MenuGlyph() {
  return (
    <span className="flex w-5 flex-col gap-[5px]">
      <span className="h-[2px] w-5 rounded-full bg-current" />
      <span className="h-[2px] w-3.5 rounded-full bg-current transition-all group-hover:w-5" />
      <span className="h-[2px] w-5 rounded-full bg-current" />
    </span>
  );
}

export function Shell({ user, cartCount, wishCount, children }: ShellProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [q, setQ] = useState("");

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const badges = { cart: cartCount, wish: wishCount } as const;

  return (
    <div className="flex min-h-screen flex-col">
      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside
              className="glass-strong fixed inset-y-3 left-3 z-50 w-[19rem] overflow-hidden rounded-[28px] border border-line shadow-2xl"
              initial={{ x: -340, opacity: 0.6 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -340, opacity: 0.6 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              aria-label="Main menu"
            >
              <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-cyan-400/15 blur-3xl" />
              <nav className="relative flex h-full flex-col gap-5 overflow-y-auto p-5">
                <div className="flex items-center justify-between">
                  <Logo size={34} />
                  <button className="rounded-full p-2 text-muted hover:bg-surface-2 hover:text-fg" onClick={() => setOpen(false)} aria-label="Close menu">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <Link href="/profile" className="relative flex items-center gap-3 overflow-hidden rounded-2xl border border-line bg-surface-2 p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={user.avatar} alt="" className="h-12 w-12 rounded-full bg-white ring-2 ring-accent/60" />
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{user.name}</p>
                    <p className="truncate text-xs text-muted">{user.email}</p>
                  </div>
                </Link>
                {NAV.map((group, gi) => (
                  <div key={group.section}>
                    <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted">{group.section}</p>
                    <ul className="space-y-0.5">
                      {group.items.map((item, ii) => {
                        const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                        const Icon = item.icon;
                        const badge = "badge" in item ? badges[item.badge] : 0;
                        return (
                          <motion.li key={item.href} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * (gi * 5 + ii) }}>
                            <Link
                              href={item.href}
                              className={cn(
                                "group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                                active ? "bg-surface-2 text-fg" : "text-muted hover:bg-surface-2 hover:text-fg",
                              )}
                            >
                              <span className="grid h-8 w-8 place-items-center rounded-lg transition group-hover:scale-110" style={{ background: `${item.color}22`, color: item.color, boxShadow: active ? `0 0 18px ${item.color}55` : undefined }}>
                                <Icon className="h-4 w-4" />
                              </span>
                              <span className="flex-1">{item.label}</span>
                              {badge > 0 && <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-white">{badge}</span>}
                            </Link>
                          </motion.li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
                <form action="/auth/signout" method="post" className="mt-auto">
                  <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-bad hover:bg-red-500/10">
                    <span className="grid h-8 w-8 place-items-center rounded-lg bg-red-500/10">
                      <LogOut className="h-4 w-4" />
                    </span>
                    Log out
                  </button>
                </form>
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <header className="glass-strong sticky top-0 z-30 border-b border-line">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <button className="group grid h-11 w-11 place-items-center rounded-2xl border border-line bg-surface-2 text-fg transition hover:border-accent/60" onClick={() => setOpen(true)} aria-label="Open menu">
            <MenuGlyph />
          </button>
          <Link href="/" className="hidden sm:block" aria-label="Shoppiee home">
            <Logo size={34} />
          </Link>
          <Link href="/" className="sm:hidden" aria-label="Shoppiee home">
            <LogoMark size={34} />
          </Link>
          <form
            className="input-icon mx-auto hidden max-w-xl flex-1 md:block"
            onSubmit={(e) => {
              e.preventDefault();
              if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
            }}
          >
            <Search />
            <input className="input rounded-full py-2.5" placeholder="Search any product across all stores…" value={q} onChange={(e) => setQ(e.target.value)} />
          </form>
          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <Link href="/search" className="rounded-full p-2.5 hover:bg-surface-2 md:hidden" aria-label="Search">
              <Search className="h-5 w-5" />
            </Link>
            <Link href="/wishlist" className="relative rounded-full p-2.5 hover:bg-surface-2" aria-label="Wishlist">
              <Heart className="h-5 w-5" />
              {wishCount > 0 && <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{wishCount}</span>}
            </Link>
            <Link href="/cart" className="relative rounded-full p-2.5 hover:bg-surface-2" aria-label="Cart">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">{cartCount}</span>}
            </Link>
            <Link href="/profile" className="ml-1 rounded-full p-0.5" style={{ background: "var(--brand-gradient)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={user.avatar} alt="Profile" className="h-9 w-9 rounded-full bg-white" />
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6">{children}</main>
      <Toaster />
    </div>
  );
}
