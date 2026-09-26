export default function SetupPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-display text-4xl font-bold brand-text">Almost ready</h1>
      <p className="mt-3 text-muted">Shoppiee needs your Supabase project details before you can sign up.</p>
      <ol className="card mt-6 list-decimal space-y-3 p-6 pl-10 text-sm leading-relaxed">
        <li>
          Open your project at supabase.com → <b>Project Settings → API</b>.
        </li>
        <li>
          Copy the <b>Project URL</b> into <code>NEXT_PUBLIC_SUPABASE_URL</code> in <code>.env.local</code>.
        </li>
        <li>
          Copy the <b>publishable (anon) key</b> into <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>.
        </li>
        <li>
          Run <code>supabase/migrations/0001_init.sql</code> in the Supabase <b>SQL Editor</b>.
        </li>
        <li>
          Restart <code>npm run dev</code> and refresh this page.
        </li>
      </ol>
      <p className="mt-4 text-sm text-muted">Full guide: SETUP.md in the project folder.</p>
    </main>
  );
}
