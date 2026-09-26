import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function inr(n: number | string | null | undefined): string {
  const v = typeof n === "string" ? parseFloat(n) : n ?? 0;
  return `₹${Math.round(v).toLocaleString("en-IN")}`;
}

export function isUrl(s: string): boolean {
  return /^(https?:\/\/|www\.)\S+$/i.test(s.trim());
}

export function formatDate(d: string | Date, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }) {
  return new Date(d).toLocaleDateString("en-IN", opts);
}
