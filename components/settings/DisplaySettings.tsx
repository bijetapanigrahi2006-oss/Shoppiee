"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Check, Loader2, Monitor, Moon, Palette, Sun } from "lucide-react";
import { saveDisplayPrefs } from "@/app/actions";
import { ACCENTS, DEFAULT_DISPLAY, type DisplayPrefs } from "@/lib/display";
import { CATEGORY_LIST } from "@/lib/theme/categories";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

/** Applies prefs to <html> immediately so changes preview live. */
function apply(p: DisplayPrefs) {
  const d = document.documentElement;
  d.dataset.pref = p.theme;
  d.dataset.theme = p.theme === "system" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : p.theme;
  d.dataset.density = p.density;
  d.dataset.fontsize = p.fontSize;
  d.dataset.motion = p.motion;
  d.style.setProperty("--accent", p.accent);
}

export function DisplaySettings({ initial }: { initial: DisplayPrefs }) {
  const [p, setP] = useState(initial);
  const [pending, start] = useTransition();
  const router = useRouter();
  const set = <K extends keyof DisplayPrefs>(k: K, v: DisplayPrefs[K]) => setP((x) => ({ ...x, [k]: v }));

  useEffect(() => apply(p), [p]);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="rounded-3xl p-6 text-white" style={{ background: `linear-gradient(135deg, ${p.accent}, #f59e0b)` }}>
        <span className="mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-white/20 ring-1 ring-white/30"><Palette className="h-7 w-7" /></span>
        <h1 className="font-display text-3xl font-bold">Display</h1>
        <p className="text-sm opacity-90">Make Shoppiee yours — changes preview instantly.</p>
      </div>

      <Group title="Theme">
        <div className="grid grid-cols-3 gap-3">
          {(
            [
              ["light", "Light", Sun],
              ["dark", "Dark", Moon],
              ["system", "System", Monitor],
            ] as const
          ).map(([v, l, Icon]) => (
            <Choice key={v} on={p.theme === v} onClick={() => set("theme", v)}>
              <Icon className="h-5 w-5" /> {l}
            </Choice>
          ))}
        </div>
      </Group>

      <Group title="Accent colour">
        <div className="flex flex-wrap gap-3">
          {ACCENTS.map((a) => (
            <button key={a.value} onClick={() => set("accent", a.value)} className="flex flex-col items-center gap-1 text-xs" aria-label={a.name}>
              <span className="grid h-12 w-12 place-items-center rounded-full shadow transition hover:scale-110" style={{ background: a.value, outline: p.accent === a.value ? `3px solid ${a.value}` : "none", outlineOffset: 3 }}>
                {p.accent === a.value && <Check className="h-5 w-5 text-white" />}
              </span>
              {a.name}
            </button>
          ))}
        </div>
      </Group>

      <Group title="Text size">
        <div className="grid grid-cols-3 gap-3">
          {(["sm", "md", "lg"] as const).map((v) => (
            <Choice key={v} on={p.fontSize === v} onClick={() => set("fontSize", v)}>
              <span style={{ fontSize: v === "sm" ? 13 : v === "md" ? 16 : 19 }}>Aa</span> {v === "sm" ? "Small" : v === "md" ? "Medium" : "Large"}
            </Choice>
          ))}
        </div>
      </Group>

      <Group title="Layout density">
        <div className="grid grid-cols-2 gap-3">
          <Choice on={p.density === "comfy"} onClick={() => set("density", "comfy")}>
            Comfy
          </Choice>
          <Choice on={p.density === "compact"} onClick={() => set("density", "compact")}>
            Compact
          </Choice>
        </div>
      </Group>

      <Group title="Animations">
        <div className="grid grid-cols-2 gap-3">
          <Choice on={p.motion === "full"} onClick={() => set("motion", "full")}>
            Full (confetti!)
          </Choice>
          <Choice on={p.motion === "reduced"} onClick={() => set("motion", "reduced")}>
            Reduced
          </Choice>
        </div>
      </Group>

      <Group title="Category colours">
        <p className="mb-3 text-sm text-muted">Every category has its own colour so you can spot things at a glance.</p>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_LIST.map((c) => (
            <span key={c.id} className="chip py-1.5 text-white" style={{ background: c.gradient }}>
              <CategoryIcon category={c.id} className="h-3.5 w-3.5" /> {c.label}
            </span>
          ))}
        </div>
      </Group>

      <div className="flex justify-end gap-2">
        <button className="btn btn-ghost" onClick={() => setP(DEFAULT_DISPLAY)}>
          Reset
        </button>
        <button
          className="btn btn-primary px-8"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await saveDisplayPrefs(p);
              toast(r.ok ? "Display settings saved" : r.error, r.ok ? "🎨" : "⚠️");
              router.refresh();
            })
          }
        >
          {pending && <Loader2 className="h-4 w-4 animate-spin" />} Save
        </button>
      </div>
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <p className="mb-3 font-display text-lg font-semibold">{title}</p>
      {children}
    </div>
  );
}

function Choice({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={cn("flex items-center justify-center gap-2 rounded-2xl border-2 p-3 text-sm font-semibold transition", on ? "border-accent bg-accent/10 text-accent" : "border-line hover:border-accent/50")}>
      {children}
    </button>
  );
}
