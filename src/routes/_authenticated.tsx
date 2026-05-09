import { createFileRoute, Navigate, Outlet } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated")({
  component: Gate,
});

function Gate() {
  const { session, loading } = useAuth();
  if (loading) return <div className="p-12 text-center text-muted-foreground">Loading…</div>;
  if (!session) return <Navigate to="/login" />;
  return <Outlet />;
}
