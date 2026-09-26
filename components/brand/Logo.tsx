import { useId } from "react";
import { cn } from "@/lib/utils";

const SQUIRCLE = "M32 2c19.2 0 30 10.8 30 30S51.2 62 32 62 2 51.2 2 32 12.8 2 32 2z";

/**
 * Shoppiee mark: a jewel-toned squircle (pink → magenta → violet, lit by warm
 * and cool glows) holding a glossy shopping bag whose front carries a
 * four-point spark: the app that shops with you.
 */
export function LogoMark({ size = 36, className }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  const u = (n: string) => `url(#${n}${id})`;
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={cn("shrink-0 drop-shadow-[0_6px_16px_rgb(168_85_247/0.45)]", className)} aria-hidden>
      <defs>
        <linearGradient id={`bg${id}`} x1="6" y1="4" x2="58" y2="62" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ff2e7e" />
          <stop offset="0.36" stopColor="#d63ae6" />
          <stop offset="0.7" stopColor="#6d3cf5" />
          <stop offset="1" stopColor="#3b1fa8" />
        </linearGradient>
        <radialGradient id={`warm${id}`} cx="0.88" cy="0.08" r="0.62">
          <stop offset="0" stopColor="#ffb547" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ffb547" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`cool${id}`} cx="0.06" cy="0.98" r="0.6">
          <stop offset="0" stopColor="#22d3ee" stopOpacity="0.8" />
          <stop offset="1" stopColor="#22d3ee" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`gloss${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={`rim${id}`} x1="4" y1="2" x2="60" y2="62" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity="0.85" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.08" />
          <stop offset="1" stopColor="#fff" stopOpacity="0.4" />
        </linearGradient>
        <linearGradient id={`bag${id}`} x1="0" y1="24" x2="0" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#efe4ff" />
        </linearGradient>
        <linearGradient id={`spark${id}`} x1="25" y1="31" x2="39" y2="46" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ff2e7e" />
          <stop offset="0.5" stopColor="#ff8a3d" />
          <stop offset="1" stopColor="#8b3cf7" />
        </linearGradient>
        <filter id={`sh${id}`} x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="1.6" stdDeviation="1.5" floodColor="#2a0b52" floodOpacity="0.5" />
        </filter>
      </defs>
      {/* jewel-toned body with warm + cool glows */}
      <path d={SQUIRCLE} fill={u("bg")} />
      <path d={SQUIRCLE} fill={u("warm")} />
      <path d={SQUIRCLE} fill={u("cool")} />
      {/* glass gloss across the top, and a light-catching rim */}
      <path d="M7.5 25C9.5 11 18.5 5 32 5s22.5 6 24.5 20c-6.5-4.2-14.6-6.2-24.5-6.2S14 20.8 7.5 25z" fill={u("gloss")} opacity="0.55" />
      <path d={SQUIRCLE} fill="none" stroke={u("rim")} strokeWidth="1.2" />
      {/* bag */}
      <g filter={u("sh")}>
        <path d="M24.5 25v-3.2a7.5 7.5 0 0 1 15 0V25" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" />
        <path d="M17.5 27.5a3 3 0 0 1 3-2.9h23a3 3 0 0 1 3 2.9l1.6 20.3a5 5 0 0 1-5 5.4H20.9a5 5 0 0 1-5-5.4z" fill={u("bag")} />
      </g>
      <path d="M18.4 29.6h27.2" stroke="#e2d0ff" strokeWidth="1" strokeLinecap="round" />
      {/* spark on the bag */}
      <path d="M32 32c.8 4.4 2.3 5.9 6.7 6.7-4.4.8-5.9 2.3-6.7 6.7-.8-4.4-2.3-5.9-6.7-6.7 4.4-.8 5.9-2.3 6.7-6.7z" fill={u("spark")} />
      <circle cx="40.2" cy="33.2" r="1.4" fill={u("spark")} />
      {/* tiny glint in the corner */}
      <path d="M49 11.5c.35 1.9 1 2.55 2.9 2.9-1.9.35-2.55 1-2.9 2.9-.35-1.9-1-2.55-2.9-2.9 1.9-.35 2.55-1 2.9-2.9z" fill="#fff" opacity="0.9" />
    </svg>
  );
}

export function Logo({ size = 36, className, wordmark = true }: { size?: number; className?: string; wordmark?: boolean }) {
  return (
    <span className={cn("group/logo inline-flex items-center gap-2.5", className)}>
      <LogoMark size={size} className="transition duration-500 group-hover/logo:-rotate-6 group-hover/logo:scale-105" />
      {wordmark && (
        <span className="font-display font-bold tracking-[-0.03em]" style={{ fontSize: size * 0.64 }}>
          <span className="bg-gradient-to-b from-fg to-fg/70 bg-clip-text text-transparent">Shopp</span>
          <span className="brand-text">iee</span>
        </span>
      )}
    </span>
  );
}
