import { requireUser } from "@/lib/supabase/server";
import { profileAvatar } from "@/lib/avatar";
import { Shell } from "@/components/shell/Shell";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { supabase, user } = await requireUser();
  const [{ data: profile }, { data: cart }, { count: wishCount }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("cart_items").select("qty").eq("user_id", user.id),
    supabase.from("wishlist").select("id", { count: "exact", head: true }).eq("user_id", user.id),
  ]);
  const cartCount = (cart ?? []).reduce((s, i) => s + (i.qty as number), 0);
  const name = (profile?.full_name as string) || user.email?.split("@")[0] || "Shopper";

  return (
    <Shell user={{ name, email: user.email ?? "", avatar: profileAvatar(profile) }} cartCount={cartCount} wishCount={wishCount ?? 0}>
      {children}
    </Shell>
  );
}
