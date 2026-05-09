import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ApplicationCard } from "@/components/ApplicationCard";

export const Route = createFileRoute("/_authenticated/my-application")({
  head: () => ({ meta: [{ title: "My Application — The Quote Gang" }] }),
  component: MyApp,
});

function MyApp() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["my-app", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", user!.id)
        .neq("status", "cancelled")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  const cancel = async (id: string) => {
    await supabase.from("applications").update({ status: "cancelled" }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["my-app"] });
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-end justify-between">
        <div>
          <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary">// My applications</span>
          <h1 className="mt-2 text-4xl font-bold">Application status</h1>
        </div>
        <Link to="/apply" className="rounded-md bg-aurora px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow">New application</Link>
      </div>

      <div className="mt-8 space-y-3">
        {isLoading && <p className="text-muted-foreground">Loading…</p>}
        {data && data.length === 0 && (
          <p className="rounded-xl border border-border bg-card/40 p-6 text-muted-foreground">
            You haven't applied yet. <Link to="/apply" className="text-primary hover:underline">Apply now</Link>.
          </p>
        )}
        {data?.map((a) => (
          <ApplicationCard key={a.id} app={a} onCancel={a.status === "pending" ? () => cancel(a.id) : undefined} />
        ))}
      </div>
    </div>
  );
}
