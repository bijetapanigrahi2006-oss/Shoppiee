import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * Shoppiee mark: a glossy gradient tile holding a shopping bag whose
 * front carries a four-point "spark" — the app that shops with you.
 */
export function LogoMark({ size = 36, className }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={cn("shrink-0", className)} aria-hidden>
      <defs>
        <linearGradient id={`g${id}`} x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ff4d8d" />
          <stop offset="0.45" stopColor="#a855f7" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id={`s${id}`} x1="22" y1="30" x2="42" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ff4d8d" />
          <stop offset="0.5" stopColor="#ffb347" />
          <stop offset="1" stopColor="#a855f7" />
        </linearGradient>
        <radialGradient id={`h${id}`} cx="0.3" cy="0.15" r="0.8">
          <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="2" y="2" width="60" height="60" rx="18" fill={`url(#g${id})`} />
      <rect x="2" y="2" width="60" height="60" rx="18" fill={`url(#h${id})`} />
      <rect x="2.75" y="2.75" width="58.5" height="58.5" rx="17.25" fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1.5" />
      <path d="M24.5 25v-3.2a7.5 7.5 0 0 1 15 0V25" fill="none" stroke="#fff" strokeWidth="3.6" strokeLinecap="round" />
      <path d="M17.5 27.5a3 3 0 0 1 3-2.9h23a3 3 0 0 1 3 2.9l1.6 20.3a5 5 0 0 1-5 5.4H20.9a5 5 0 0 1-5-5.4z" fill="#fff" />
      <path d="M32 31.5c.8 4.6 2.4 6.2 7 7-4.6.8-6.2 2.4-7 7-.8-4.6-2.4-6.2-7-7 4.6-.8 6.2-2.4 7-7z" fill={`url(#s${id})`} />
      <circle cx="40.5" cy="32.5" r="1.6" fill={`url(#s${id})`} />
    </svg>
  );
}

export function Logo({ size = 36, className, wordmark = true }: { size?: number; className?: string; wordmark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={size} />
      {wordmark && (
        <span className="font-display font-bold tracking-tight" style={{ fontSize: size * 0.62 }}>
          <span className="text-fg">Shopp</span>
          <span className="brand-text">iee</span>
        </span>
      )}
    </span>
  );
}
