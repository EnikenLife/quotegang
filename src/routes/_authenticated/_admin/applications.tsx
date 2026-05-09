import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ApplicationCard } from "@/components/ApplicationCard";

export const Route = createFileRoute("/_authenticated/_admin/applications")({
  head: () => ({ meta: [{ title: "Applications — Admin" }] }),
  component: AdminApps,
});

type Tab = "pending" | "accepted" | "rejected";

function AdminApps() {
  const [tab, setTab] = useState<Tab>("pending");
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-apps", tab],
    queryFn: async () => {
      let q = supabase.from("applications").select("*").eq("status", tab).order("created_at", { ascending: false });
      // For accepted/rejected only show past 30 days
      if (tab !== "pending") {
        const cutoff = new Date(Date.now() - 30 * 86400000).toISOString();
        q = q.gte("reviewed_at", cutoff);
      }
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const [openId, setOpenId] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const review = async (id: string, status: "accepted" | "rejected") => {
    setBusy(true);
    await supabase.functions.invoke("review-application", { body: { id, status, message: msg || null } });
    setBusy(false);
    setOpenId(null);
    setMsg("");
    qc.invalidateQueries({ queryKey: ["admin-apps"] });
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary">// Admin</span>
      <h1 className="mt-2 text-4xl font-bold">Applications</h1>

      <div className="mt-6 flex gap-2 border-b border-border">
        {(["pending", "accepted", "rejected"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm uppercase tracking-widest transition-colors ${
              tab === t ? "border-b-2 border-primary text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >{t}</button>
        ))}
      </div>

      <div className="mt-6 space-y-3">
        {isLoading && <p className="text-muted-foreground">Loading…</p>}
        {data?.length === 0 && <p className="rounded-xl border border-border bg-card/40 p-6 text-muted-foreground">Nothing here.</p>}
        {data?.map((a) => (
          <div key={a.id}>
            <ApplicationCard app={a} onClick={() => { setOpenId(openId === a.id ? null : a.id); setMsg(""); }} />
            {openId === a.id && (
              <div className="mt-2 rounded-xl border border-border bg-card/60 p-5">
                <p className="text-sm text-muted-foreground"><span className="text-foreground font-mono">Discord:</span> {a.discord_username}</p>
                <p className="mt-2 text-sm"><span className="text-muted-foreground">Activity:</span> {a.activity}</p>
                <p className="mt-2 text-sm"><span className="text-muted-foreground">Willing for events:</span> {a.willing_events == null ? "—" : a.willing_events ? "Yes" : "No"}</p>
                {a.reviewer_message && (
                  <p className="mt-2 text-sm rounded-md border border-border bg-background p-3">
                    <span className="text-muted-foreground">Reviewer:</span> {a.reviewer_message}
                  </p>
                )}
                {a.status === "pending" && (
                  <>
                    <textarea
                      value={msg} onChange={(e) => setMsg(e.target.value)} rows={2}
                      placeholder="Optional message to applicant…"
                      className="mt-3 w-full rounded-md border border-border bg-card/40 px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                    />
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => review(a.id, "accepted")} disabled={busy}
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
                      >Accept</button>
                      <button
                        onClick={() => review(a.id, "rejected")} disabled={busy}
                        className="rounded-md border border-destructive bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive disabled:opacity-50"
                      >Reject</button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
