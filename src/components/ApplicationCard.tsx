import { Clock, Check, X } from "lucide-react";

type App = {
  id: string;
  ign: string;
  mc_uuid: string | null;
  status: string;
  created_at: string;
  reviewed_at: string | null;
  reviewer_message: string | null;
};

const STATUS_STYLES: Record<string, string> = {
  pending: "border-yellow-500/40 bg-yellow-500/10 text-yellow-300",
  accepted: "border-primary/40 bg-primary/10 text-primary",
  rejected: "border-destructive/40 bg-destructive/10 text-destructive",
  cancelled: "border-border bg-card/40 text-muted-foreground",
};

export function ApplicationCard({
  app, onClick, onCancel,
}: {
  app: App;
  onClick?: () => void;
  onCancel?: () => void;
}) {
  const head = app.mc_uuid
    ? `https://mc-heads.net/avatar/${app.mc_uuid}/96`
    : `https://mc-heads.net/avatar/${app.ign}/96`;

  const Icon = app.status === "accepted" ? Check : app.status === "rejected" ? X : Clock;

  return (
    <div className="group rounded-xl border border-border bg-card/40 transition-colors hover:border-primary/40">
      <button type="button" onClick={onClick} className="flex w-full items-center gap-4 p-4 text-left">
        <img
          src={head} alt={app.ign} width={56} height={56}
          className="h-14 w-14 rounded-md border border-border"
          style={{ imageRendering: "pixelated" }}
        />
        <div className="min-w-0 flex-1">
          <p className="font-mono text-base font-semibold text-foreground">{app.ign}</p>
          <p className="text-xs text-muted-foreground">
            Applied {new Date(app.created_at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </p>
          {app.reviewer_message && app.status !== "pending" && (
            <p className="mt-1 truncate text-xs text-muted-foreground">"{app.reviewer_message}"</p>
          )}
        </div>
        <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-widest ${STATUS_STYLES[app.status] ?? STATUS_STYLES.pending}`}>
          <Icon className="h-3 w-3" /> {app.status}
        </span>
      </button>
      {onCancel && (
        <div className="border-t border-border px-4 py-2 text-right">
          <button onClick={onCancel} className="text-xs text-muted-foreground hover:text-destructive">
            Cancel application
          </button>
        </div>
      )}
    </div>
  );
}
