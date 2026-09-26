import { EmptyState } from "@/components/ui/EmptyState";
import { ListChecks } from "lucide-react";
import Link from "next/link";
import { requireUser } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { NewListButton } from "@/components/lists/ListButtons";
import { PageHeader } from "@/components/ui/Section";

const TINTS = ["#8b5cf6", "#f43f5e", "#f59e0b", "#22c55e", "#0ea5e9", "#ec4899", "#14b8a6", "#f97316"];

export default async function ListsPage() {
  const { supabase, user } = await requireUser();
  const { data: lists } = await supabase.from("shopping_lists").select("*, list_items(count)").eq("user_id", user.id).order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader icon={<ListChecks />} gradient="linear-gradient(135deg,#f59e0b,#ef4444 55%,#db2777)" title="My shopping lists" subtitle="Plan what to buy — I'll find the best price for every item." action={<NewListButton />} />
      {!lists?.length ? (
        <EmptyState icon={ListChecks} title="No lists yet" body="Create one, or save a curated list from Home." gradient="linear-gradient(135deg,#f59e0b,#db2777)">
          <NewListButton label="Create your first list" />
        </EmptyState>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((l, i) => {
            const tint = String(l.emoji).startsWith("#") ? String(l.emoji) : TINTS[i % TINTS.length];
            return (
            <Link key={l.id} href={`/lists/${l.id}`} className="card card-glow overflow-hidden">
              <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${tint}, transparent)` }} />
              <div className="flex items-center gap-4 p-5">
                <span className="grid h-14 w-14 place-items-center rounded-2xl text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${tint}, ${tint}88)`, boxShadow: `0 10px 30px -12px ${tint}` }}>
                  <ListChecks className="h-6 w-6" />
                </span>
                <div>
                  <p className="font-display text-lg font-semibold">{l.name}</p>
                  <p className="text-xs text-muted">
                    {(l.list_items as { count: number }[])[0]?.count ?? 0} items · {formatDate(l.created_at)} {l.source === "ai" && "· AI-curated"}
                  </p>
                </div>
              </div>
            </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
