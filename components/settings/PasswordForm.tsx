"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "@/components/ui/toast";

export function PasswordForm() {
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  return (
    <form
      className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
      onSubmit={async (e) => {
        e.preventDefault();
        if (pw !== confirm) return toast("Passwords don't match", "⚠️");
        setLoading(true);
        const { error } = await createClient().auth.updateUser({ password: pw });
        setLoading(false);
        if (error) return toast(error.message, "⚠️");
        setPw("");
        setConfirm("");
        toast("Password updated", "🔒");
      }}
    >
      <input className="input" type="password" placeholder="New password" minLength={6} value={pw} onChange={(e) => setPw(e.target.value)} required autoComplete="new-password" />
      <input className="input" type="password" placeholder="Confirm password" minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" />
      <button className="btn btn-primary" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />} Update
      </button>
    </form>
  );
}
