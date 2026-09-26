export const AVATAR_STYLES = [
  { id: "adventurer", label: "Adventurer" },
  { id: "avataaars", label: "Avataaars" },
  { id: "lorelei", label: "Lorelei" },
  { id: "notionists", label: "Notionists" },
  { id: "fun-emoji", label: "Fun Emoji" },
  { id: "bottts", label: "Robots" },
  { id: "big-smile", label: "Big Smile" },
  { id: "micah", label: "Micah" },
] as const;

export type AvatarStyle = (typeof AVATAR_STYLES)[number]["id"];

const BGS = "ffd5dc,ffdfbf,d1d4f9,c0aede,b6e3f4,c1f4c5,fef3c7";

export function avatarUrl(style: string | null | undefined, seed: string | null | undefined): string {
  return `https://api.dicebear.com/9.x/${style || "adventurer"}/svg?seed=${encodeURIComponent(seed || "shoppiee")}&backgroundColor=${BGS}&radius=50`;
}

export function profileAvatar(p: { avatar_url?: string | null; avatar_style?: string | null; avatar_seed?: string | null } | null) {
  if (p?.avatar_url) return p.avatar_url;
  return avatarUrl(p?.avatar_style, p?.avatar_seed);
}
