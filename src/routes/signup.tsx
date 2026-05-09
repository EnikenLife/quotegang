import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ignToEmail, isValidIgn, isValidPasscode } from "@/lib/auth-helpers";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Sign up — The Quote Gang" }] }),
  component: SignupPage,
});

function SignupPage() {
  const nav = useNavigate();
  const [ign, setIgn] = useState("");
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!isValidIgn(ign)) return setErr("Enter a valid Minecraft username (3–16 letters, digits, underscore).");
    if (!isValidPasscode(pass)) return setErr("Passcode must be at least 8 characters.");
    if (pass !== pass2) return setErr("Passcodes don't match.");
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("signup", {
      body: { ign, passcode: pass },
    });
    if (error || (data as any)?.error) {
      setBusy(false);
      return setErr((data as any)?.error ?? error?.message ?? "Signup failed.");
    }
    // Now log in
    const { error: loginErr } = await supabase.auth.signInWithPassword({
      email: ignToEmail(ign), password: pass,
    });
    setBusy(false);
    if (loginErr) return setErr("Account created, but sign-in failed. Try logging in.");
    nav({ to: "/" });
  };

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-6 py-16">
      <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary">// Join us</span>
      <h1 className="mt-2 text-4xl font-bold">Create account</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        We verify your Minecraft username with Mojang. Only real accounts.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        <Field label="Minecraft Username" value={ign} onChange={setIgn} placeholder="e.g. Notch" />
        <Field label="Passcode" type="password" value={pass} onChange={setPass} placeholder="At least 8 characters" />
        <Field label="Confirm passcode" type="password" value={pass2} onChange={setPass2} placeholder="Repeat passcode" />
        {err && <p className="text-sm text-destructive">{err}</p>}
        <button type="submit" disabled={busy} className="w-full rounded-lg bg-aurora py-3 font-medium text-primary-foreground shadow-glow disabled:opacity-50">
          {busy ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have one? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
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
