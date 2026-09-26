"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Loader2, Mail, Lock, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(params.get("error"));
  const [info, setInfo] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);
    const supabase = createClient();
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name }, emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      setLoading(false);
      if (error) return setError(error.message);
      if (!data.session) return setInfo("Almost there! Check your inbox and click the confirmation link to start shopping.");
      router.replace("/");
      router.refresh();
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) return setError(error.message);
      router.replace(params.get("next") || "/");
      router.refresh();
    }
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-7">
      <div>
        <h1 className="font-display text-2xl font-semibold">{mode === "login" ? "Welcome back" : "Let's go shopping together"}</h1>
        <p className="mt-1 text-sm text-muted">
          {mode === "login" ? "Log in to see your lists, cart and price alerts." : "Create your free Shoppiee account."}
        </p>
      </div>
      {mode === "signup" && (
        <label className="input-icon">
          <User />
          <input className="input" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
      )}
      <label className="input-icon">
        <Mail />
        <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
      </label>
      <label className="input-icon">
        <Lock />
        <input
          className="input"
          type="password"
          placeholder="Password (min 6 characters)"
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
      </label>
      {error && <p className="rounded-xl bg-red-500/10 px-3 py-2 text-sm text-bad">{error}</p>}
      {info && <p className="rounded-xl bg-green-500/10 px-3 py-2 text-sm text-good">{info}</p>}
      <button className="btn btn-brand w-full py-3 text-base" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {mode === "login" ? "Log in" : "Create account"}
      </button>
      <p className="text-center text-sm text-muted">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link href="/signup" className="font-semibold text-accent">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-accent">
              Log in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
