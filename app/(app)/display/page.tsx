import { cookies } from "next/headers";
import { requireUser } from "@/lib/supabase/server";
import { DISPLAY_COOKIE, parseDisplay, type DisplayPrefs } from "@/lib/display";
import { DisplaySettings } from "@/components/settings/DisplaySettings";

export default async function DisplayPage() {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase.from("profiles").select("display_prefs").eq("id", user.id).maybeSingle();
  const fromCookie = parseDisplay((await cookies()).get(DISPLAY_COOKIE)?.value);
  const saved = profile?.display_prefs && Object.keys(profile.display_prefs).length ? { ...fromCookie, ...(profile.display_prefs as Partial<DisplayPrefs>) } : fromCookie;
  return <DisplaySettings initial={saved} />;
}
