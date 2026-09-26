import { requireUser } from "@/lib/supabase/server";
import { ProfileEditor } from "@/components/profile/ProfileEditor";

export default async function ProfilePage() {
  const { supabase, user } = await requireUser();
  const [{ data: profile }, { count: orders }, { count: wishes }, { count: lists }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("wishlist").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("shopping_lists").select("id", { count: "exact", head: true }).eq("user_id", user.id),
  ]);

  return (
    <ProfileEditor
      userId={user.id}
      email={user.email ?? ""}
      memberSince={user.created_at}
      profile={{
        full_name: (profile?.full_name as string) ?? "",
        avatar_style: (profile?.avatar_style as string) ?? "adventurer",
        avatar_seed: (profile?.avatar_seed as string) ?? user.id,
        avatar_url: (profile?.avatar_url as string) ?? null,
      }}
      stats={{ orders: orders ?? 0, wishes: wishes ?? 0, lists: lists ?? 0 }}
    />
  );
}
