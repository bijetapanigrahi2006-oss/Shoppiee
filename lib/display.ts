export interface DisplayPrefs {
  theme: "light" | "dark" | "system";
  accent: string;
  fontSize: "sm" | "md" | "lg";
  density: "comfy" | "compact";
  motion: "full" | "reduced";
  view: "grid" | "list";
  categoryColors: boolean;
}

export const DEFAULT_DISPLAY: DisplayPrefs = {
  theme: "dark",
  accent: "#8b5cf6",
  fontSize: "md",
  density: "comfy",
  motion: "full",
  view: "grid",
  categoryColors: true,
};

export const ACCENTS = [
  { name: "Grape", value: "#8b5cf6" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Tangerine", value: "#f97316" },
  { name: "Sunshine", value: "#eab308" },
  { name: "Leaf", value: "#22c55e" },
  { name: "Ocean", value: "#0ea5e9" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Bubblegum", value: "#ec4899" },
];

export const DISPLAY_COOKIE = "shoppiee_display";

export function parseDisplay(raw: string | undefined | null): DisplayPrefs {
  if (!raw) return DEFAULT_DISPLAY;
  try {
    return { ...DEFAULT_DISPLAY, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_DISPLAY;
  }
}
