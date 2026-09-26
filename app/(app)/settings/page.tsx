import { Settings } from "lucide-react";
import Link from "next/link";
import { requireUser } from "@/lib/supabase/server";
import { aiEnabled, MODEL } from "@/lib/ai/claude";
import { STORE_LIST } from "@/lib/stores";
import { PageHeader } from "@/components/ui/Section";
import { PasswordForm } from "@/components/settings/PasswordForm";
import { ClearHistoryButton } from "@/components/settings/ClearHistoryButton";

export default async function SettingsPage() {
  const { user } = await requireUser();
  const ai = aiEnabled();
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader icon={<Settings />} gradient="linear-gradient(135deg,#334155,#6d28d9 60%,#0891b2)" title="Settings" subtitle="Account, security, privacy and data sources." />

      <div className="card space-y-2 p-5">
        <p className="font-display text-lg font-semibold">Account</p>
        <p className="text-sm">
          Signed in as <b>{user.email}</b>
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          <Link href="/profile" className="btn btn-ghost btn-sm">
            Edit profile & avatar
          </Link>
          <Link href="/display" className="btn btn-ghost btn-sm">
            Display settings
          </Link>
        </div>
      </div>

      <div className="card p-5">
        <p className="mb-3 font-display text-lg font-semibold">Change password</p>
        <PasswordForm />
      </div>

      <div className="card space-y-3 p-5">
        <p className="font-display text-lg font-semibold">Privacy</p>
        <p className="text-sm text-muted">Shoppiee never handles payments. Checkout always happens on the store&apos;s own website.</p>
        <ClearHistoryButton />
      </div>

      <div className="card space-y-3 p-5">
        <p className="font-display text-lg font-semibold">AI & data</p>
        <p className="text-sm">
          AI assistant:{" "}
          {ai ? (
            <span className="chip bg-green-500/15 text-good">On · {MODEL}</span>
          ) : (
            <span className="chip bg-amber-500/15 text-warn">Off — add ANTHROPIC_API_KEY to enable</span>
          )}
        </p>
        <p className="text-sm text-muted">
          Price data: <b>demo catalog</b> ({process.env.DATA_PROVIDER ?? "mock"}). Prices, histories and reviews are simulated for {STORE_LIST.length} stores until a live data provider is connected. “Buy on …” buttons open real store search pages.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {STORE_LIST.map((s) => (
            <span key={s.id} className="chip" style={{ background: `${s.color}1f`, color: s.color }}>
              {s.name}
            </span>
          ))}
        </div>
      </div>

      <form action="/auth/signout" method="post">
        <button className="btn w-full bg-red-500/10 py-3 text-bad hover:bg-red-500/20">Log out</button>
      </form>
    </div>
  );
}
