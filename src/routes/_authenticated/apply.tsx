import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/apply")({
  head: () => ({ meta: [{ title: "Apply — The Quote Gang" }] }),
  component: ApplyPage,
});

function ApplyPage() {
  const { profile } = useAuth();
  const nav = useNavigate();
  const [discord, setDiscord] = useState("");
  const [activity, setActivity] = useState("");
  const [willing, setWilling] = useState<boolean | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!discord.trim()) return setErr("Discord username is required.");
    if (activity.trim().length < 3) return setErr("Tell us a bit about your activity.");
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("submit-application", {
      body: { discord_username: discord.trim(), activity: activity.trim(), willing_events: willing },
    });
    setBusy(false);
    if (error || (data as any)?.error) {
      return setErr((data as any)?.error ?? error?.message ?? "Submit failed.");
    }
    nav({ to: "/my-application" });
  };

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary">// Apply</span>
      <h1 className="mt-2 text-4xl font-bold">Apply to <span className="text-aurora">[Next]</span></h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Applying as <span className="text-foreground font-mono">{profile?.ign}</span>. Need to use a different IGN?{" "}
        <Link to="/login" className="text-primary hover:underline">Sign in</Link> with that account.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-5 rounded-2xl border border-border bg-card/40 p-6">
        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">What's your IGN?</span>
          <input value={profile?.ign ?? ""} disabled className="mt-1 w-full rounded-md border border-border bg-card/60 px-3 py-2.5 text-muted-foreground" />
        </label>

        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Discord username</span>
          <input
            value={discord} onChange={(e) => setDiscord(e.target.value)} placeholder="e.g. notch"
            className="mt-1 w-full rounded-md border border-border bg-card/40 px-3 py-2.5 text-foreground outline-none focus:border-primary"
          />
        </label>

        <label className="block">
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">How active are you?</span>
          <textarea
            value={activity} onChange={(e) => setActivity(e.target.value)} rows={4}
            placeholder="e.g. Daily, ~3 hours per evening. Online weekends a lot."
            className="mt-1 w-full rounded-md border border-border bg-card/40 px-3 py-2.5 text-foreground outline-none focus:border-primary"
          />
        </label>

        <fieldset>
          <legend className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Willing to participate in guild raids and events? <span className="text-muted-foreground/60 normal-case">(optional)</span>
          </legend>
          <div className="mt-2 flex gap-2">
            {[
              { v: true as const, l: "Yes" },
              { v: false as const, l: "No" },
              { v: null, l: "Skip" },
            ].map((o) => (
              <button
                key={String(o.v)} type="button" onClick={() => setWilling(o.v)}
                className={`rounded-md border px-4 py-2 text-sm transition-colors ${
                  willing === o.v ? "border-primary bg-primary/15 text-primary" : "border-border bg-card/40 text-muted-foreground hover:text-foreground"
                }`}
              >{o.l}</button>
            ))}
          </div>
        </fieldset>

        {err && <p className="text-sm text-destructive">{err}</p>}

        <button type="submit" disabled={busy} className="w-full rounded-lg bg-aurora py-3 font-medium text-primary-foreground shadow-glow disabled:opacity-50">
          {busy ? "Submitting…" : "Submit application"}
        </button>
      </form>
    </div>
  );
}
