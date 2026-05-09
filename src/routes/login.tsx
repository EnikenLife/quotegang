import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ignToEmail, isValidIgn, isValidPasscode } from "@/lib/auth-helpers";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in — The Quote Gang" }] }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const { session } = useAuth();
  const [ign, setIgn] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (session) {
    nav({ to: "/" });
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!isValidIgn(ign)) return setErr("Enter a valid Minecraft username.");
    if (!isValidPasscode(pass)) return setErr("Passcode must be at least 8 characters.");
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: ignToEmail(ign), password: pass,
    });
    setBusy(false);
    if (error) return setErr("Wrong username or passcode.");
    nav({ to: "/" });
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-16">
      <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary">// Welcome back</span>
      <h1 className="mt-2 text-4xl font-bold">Sign in</h1>
      <p className="mt-2 text-sm text-muted-foreground">Use your Minecraft username and passcode.</p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <Field label="Minecraft Username" value={ign} onChange={setIgn} placeholder="e.g. Notch" />
        <Field label="Passcode" type="password" value={pass} onChange={setPass} placeholder="••••••••" />
        {err && <p className="text-sm text-destructive">{err}</p>}
        <button type="submit" disabled={busy} className="w-full rounded-lg bg-aurora py-3 font-medium text-primary-foreground shadow-glow disabled:opacity-50">
          {busy ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here? <Link to="/signup" className="text-primary hover:underline">Create an account</Link>
      </p>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <input
        type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="mt-1 w-full rounded-md border border-border bg-card/40 px-3 py-2.5 text-foreground outline-none focus:border-primary"
      />
    </label>
  );
}
