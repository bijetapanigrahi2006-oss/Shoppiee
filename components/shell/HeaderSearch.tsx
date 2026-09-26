"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, Loader2, Search } from "lucide-react";
import { cn, inr } from "@/lib/utils";

interface Suggestion {
  id: string;
  name: string;
  brand: string;
  photo: string;
  photoFit: "cover" | "contain";
  accent: string;
  price: number;
  stores: number;
}

/** Header search with live product suggestions. Press "/" anywhere to jump here. */
export function HeaderSearch({ className }: { className?: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLFormElement>(null);

  // "/" focuses the search, like on most shopping sites.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName) && !t.isContentEditable) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    const onClick = (e: MouseEvent) => !boxRef.current?.contains(e.target as Node) && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) {
      setItems([]);
      return;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/suggest?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        const data = (await res.json()) as { products?: Suggestion[] };
        setItems(data.products ?? []);
        setActive(-1);
      } catch {
        /* superseded by a newer keystroke */
      } finally {
        setLoading(false);
      }
    }, 160);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [q]);

  function submit() {
    const term = q.trim();
    setOpen(false);
    inputRef.current?.blur();
    if (active >= 0 && items[active]) router.push(`/product/${items[active].id}`);
    else if (term) router.push(`/search?q=${encodeURIComponent(term)}`);
  }

  const show = open && q.trim().length >= 2;

  return (
    <form
      ref={boxRef}
      className={cn("relative", className)}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <label className="input-icon">
        <Search />
        <input
          ref={inputRef}
          className="input rounded-full py-2.5 pr-12"
          placeholder="Search any product across all stores…"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(a + 1, items.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(a - 1, -1));
            } else if (e.key === "Escape") {
              setOpen(false);
              inputRef.current?.blur();
            }
          }}
          aria-label="Search products"
          aria-expanded={show}
          aria-controls="header-suggestions"
          role="combobox"
          autoComplete="off"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          {loading ? <Loader2 className="h-4 w-4 animate-spin text-muted" /> : <kbd className="kbd">/</kbd>}
        </span>
      </label>

      {show && (
        <div id="header-suggestions" role="listbox" className="glass-strong absolute inset-x-0 top-[calc(100%+0.5rem)] z-40 overflow-hidden rounded-3xl border border-line p-2 shadow-2xl">
          {items.map((s, i) => (
            <Link
              key={s.id}
              href={`/product/${s.id}`}
              role="option"
              aria-selected={i === active}
              onClick={() => setOpen(false)}
              onMouseEnter={() => setActive(i)}
              className={cn("flex items-center gap-3 rounded-2xl p-2 transition", i === active ? "bg-surface-2" : "hover:bg-surface-2")}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={s.photo} alt="" className={cn("h-12 w-12 shrink-0 rounded-xl bg-white", s.photoFit === "contain" ? "object-contain p-1" : "object-cover")} />
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] font-bold uppercase tracking-wider" style={{ color: s.accent }}>
                  {s.brand}
                </span>
                <span className="block truncate text-sm font-semibold">{s.name}</span>
                <span className="block text-xs text-muted">
                  from <b className="text-fg">{inr(s.price)}</b> · {s.stores} {s.stores === 1 ? "store" : "stores"}
                </span>
              </span>
            </Link>
          ))}
          {!loading && !items.length && <p className="px-3 py-2 text-sm text-muted">No quick matches. Press Enter to search every store.</p>}
          <button type="submit" className="mt-1 flex w-full items-center justify-between rounded-2xl bg-surface-2 px-3 py-2.5 text-sm font-semibold transition hover:bg-accent/20">
            <span className="truncate">
              Compare all results for “{q.trim()}”
            </span>
            <ArrowRight className="h-4 w-4 shrink-0" />
          </button>
        </div>
      )}
    </form>
  );
}
