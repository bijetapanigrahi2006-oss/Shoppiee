"use client";

import { useRouter } from "next/navigation";
import { useMemo, useRef, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { Check, Loader2, Shuffle, Upload } from "lucide-react";
import { updateProfile } from "@/app/actions";
import { AVATAR_STYLES, avatarUrl } from "@/lib/avatar";
import { createClient } from "@/lib/supabase/client";
import { cn, formatDate } from "@/lib/utils";
import { toast } from "@/components/ui/toast";
import { fireConfetti } from "@/components/celebrate/Celebration";

interface Props {
  userId: string;
  email: string;
  memberSince: string;
  profile: { full_name: string; avatar_style: string; avatar_seed: string; avatar_url: string | null };
  stats: { orders: number; wishes: number; lists: number };
}

const SEED_WORDS = ["Mango", "Pixel", "Chai", "Masala", "Sunny", "Bubbles", "Kiwi", "Ziggy", "Luna", "Coco", "Tofu", "Biscuit", "Nova", "Peach", "Rio", "Momo", "Jalebi", "Ladoo"];

function seedSet(offset: number) {
  return Array.from({ length: 12 }, (_, i) => `${SEED_WORDS[(i + offset) % SEED_WORDS.length]}${offset + i}`);
}

export function ProfileEditor({ userId, email, memberSince, profile, stats }: Props) {
  const router = useRouter();
  const [name, setName] = useState(profile.full_name);
  const [style, setStyle] = useState(profile.avatar_style);
  const [seed, setSeed] = useState(profile.avatar_seed);
  const [upload, setUpload] = useState<string | null>(profile.avatar_url);
  const [offset, setOffset] = useState(0);
  const [pending, start] = useTransition();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const seeds = useMemo(() => [profile.avatar_seed, ...seedSet(offset)].slice(0, 12), [offset, profile.avatar_seed]);
  const current = upload ?? avatarUrl(style, seed);

  async function onUpload(file: File | undefined) {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast("Please pick an image under 2 MB", "⚠️");
    setUploading(true);
    const supabase = createClient();
    const path = `${userId}/avatar-${Date.now()}.${file.name.split(".").pop() || "png"}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
    setUploading(false);
    if (error) return toast(error.message, "⚠️");
    setUpload(supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl);
  }

  function save() {
    start(async () => {
      const r = await updateProfile({ full_name: name.trim(), avatar_style: style, avatar_seed: seed, avatar_url: upload });
      if (r.ok) {
        fireConfetti();
        toast("Profile updated", "✨");
        router.refresh();
      } else toast(r.error, "⚠️");
    });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="relative overflow-hidden rounded-[28px] p-6 text-white sm:p-8" style={{ background: "var(--brand-gradient)" }}>
        <div className="flex flex-wrap items-center gap-5">
          <motion.img key={current} src={current} alt="Your avatar" initial={{ scale: 0.7, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} className="h-28 w-28 rounded-full border-4 border-white/70 bg-white shadow-xl" />
          <div className="flex-1">
            <p className="font-display text-3xl font-bold">{name || "Shopper"}</p>
            <p className="text-sm opacity-90">{email}</p>
            <p className="text-xs opacity-80">Member since {formatDate(memberSince, { month: "long", year: "numeric" })}</p>
          </div>
          <div className="flex gap-3 text-center">
            {[
              ["Orders", stats.orders],
              ["Wishlist", stats.wishes],
              ["Lists", stats.lists],
            ].map(([l, v]) => (
              <div key={l} className="rounded-2xl bg-white/20 px-4 py-2">
                <p className="text-xl font-bold">{v}</p>
                <p className="text-xs">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card space-y-3 p-5">
        <label className="block text-sm font-semibold">Display name</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
      </div>

      <div className="card space-y-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-display text-lg font-semibold">Pick your avatar</p>
          <div className="flex gap-2">
            <button className="btn btn-ghost btn-sm" onClick={() => setOffset((o) => o + 12)}>
              <Shuffle className="h-4 w-4" /> Shuffle
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload photo
            </button>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => onUpload(e.target.files?.[0])} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {AVATAR_STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setStyle(s.id);
                setUpload(null);
              }}
              className={cn("chip border py-1.5 text-sm", style === s.id && !upload ? "border-accent bg-accent text-white" : "border-line bg-surface")}
            >
              {s.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-6">
          {seeds.map((sd) => {
            const selected = !upload && sd === seed;
            return (
              <motion.button
                key={`${style}-${sd}`}
                whileHover={{ scale: 1.08, rotate: 3 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSeed(sd);
                  setUpload(null);
                }}
                className={cn("relative rounded-full p-1 transition", selected ? "ring-4 ring-accent" : "ring-1 ring-line")}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={avatarUrl(style, sd)} alt="" className="aspect-square w-full rounded-full bg-white" loading="lazy" />
                {selected && (
                  <span className="absolute -right-1 -top-1 grid h-6 w-6 place-items-center rounded-full bg-accent text-white">
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <button className="btn btn-brand px-8 py-3 text-base" onClick={save} disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />} Save profile
        </button>
      </div>
    </div>
  );
}
