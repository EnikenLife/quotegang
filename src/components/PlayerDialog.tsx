import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { fetchPlayerData } from "@/lib/player.functions";
import { formatXp } from "@/lib/wynncraft";
import { ExternalLink, Copy, Check, Circle, Clock, Calendar, Swords, Skull, Trophy, Map, Crown, Star, Activity } from "lucide-react";
import { useState } from "react";

type Props = {
  username: string | null;
  uuid?: string;
  onOpenChange: (open: boolean) => void;
};

function fmtDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtNum(n?: number) {
  if (n == null) return "—";
  return n.toLocaleString();
}

function relTime(iso?: string) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const d = Math.floor(diff / 86400000);
  if (d < 1) {
    const h = Math.floor(diff / 3600000);
    if (h < 1) return `${Math.floor(diff / 60000)}m ago`;
    return `${h}h ago`;
  }
  if (d < 30) return `${d}d ago`;
  if (d < 365) return `${Math.floor(d / 30)}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
}

export function PlayerDialog({ username, uuid, onOpenChange }: Props) {
  const open = !!username;
  const { data, isLoading, error } = useQuery({
    queryKey: ["player", uuid ?? username],
    queryFn: () => fetchPlayerData({ data: { identifier: uuid ?? username! } }),
    enabled: open,
    staleTime: 60_000,
  });

  const [copied, setCopied] = useState(false);
  const copyIgn = () => {
    if (!username) return;
    navigator.clipboard.writeText(username);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const playerUuid = data?.uuid ?? uuid;
  const characters = data?.characters ? Object.values<any>(data.characters) : [];
  const sortedChars = [...characters].sort((a, b) => (b.level ?? 0) - (a.level ?? 0));
  const global = data?.globalData ?? {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto border-border bg-card/95 p-0 backdrop-blur">
        <DialogTitle className="sr-only">{username ?? "Player"} details</DialogTitle>
        <DialogDescription className="sr-only">Wynncraft player profile</DialogDescription>

        {/* Header */}
        <div className="relative overflow-hidden rounded-t-lg border-b border-border bg-gradient-to-br from-card to-background p-6">
          <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-aurora opacity-20 blur-3xl" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
            {playerUuid && (
              <img
                src={`https://mc-heads.net/body/${playerUuid}/160`}
                alt={username ?? ""}
                className="h-40 w-auto self-center drop-shadow-[0_8px_20px_rgba(0,0,0,0.6)]"
                style={{ imageRendering: "pixelated" }}
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-xl text-foreground sm:text-2xl">{username}</h2>
                <button
                  onClick={copyIgn}
                  className="rounded-md border border-border bg-card/60 p-1.5 text-muted-foreground hover:text-foreground"
                  aria-label="Copy IGN"
                  title="Copy IGN"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>

              {data?.guild && (
                <p className="mt-2 text-sm text-muted-foreground">
                  <span className="text-primary">{data.guild.rank}</span> of{" "}
                  <span className="text-foreground">[{data.guild.prefix}] {data.guild.name}</span>
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${data?.online ? "border-primary/60 bg-primary/10 text-primary" : "border-border bg-card/40 text-muted-foreground"}`}>
                  <Circle className={`h-2 w-2 ${data?.online ? "fill-primary text-primary" : "fill-muted-foreground text-muted-foreground"}`} />
                  {data?.online ? `Online · ${data.server ?? ""}` : "Offline"}
                </span>
                {data?.rank && data.rank !== "Player" && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-xs text-accent">
                    <Crown className="h-3 w-3" /> {data.rank}
                  </span>
                )}
                {data?.supportRank && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-border bg-card/40 px-2.5 py-1 text-xs text-foreground uppercase">
                    <Star className="h-3 w-3" /> {data.supportRank}
                  </span>
                )}
              </div>

              <a
                href={`https://wynncraft.com/stats/player/${username}`}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
              >
                View on Wynncraft <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {isLoading && <div className="p-8 text-center text-sm text-muted-foreground">Loading player data…</div>}
        {error && <div className="p-8 text-center text-sm text-destructive">Failed to load player.</div>}

        {data && (
          <div className="space-y-6 p-6">
            {/* Key stats */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat icon={Calendar} label="First joined" value={fmtDate(data.firstJoin)} sub={relTime(data.firstJoin)} />
              <Stat icon={Activity} label="Last seen" value={fmtDate(data.lastJoin)} sub={data.online ? "online now" : relTime(data.lastJoin)} />
              <Stat icon={Clock} label="Playtime" value={`${fmtNum(Math.round(data.playtime ?? 0))}h`} />
              <Stat icon={Trophy} label="Total level" value={fmtNum(global.totalLevel)} />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Stat icon={Skull} label="Mobs killed" value={fmtNum(global.killedMobs)} />
              <Stat icon={Map} label="Quests" value={fmtNum(global.completedQuests)} />
              <Stat icon={Swords} label="Wars" value={fmtNum(global.wars)} />
              <Stat icon={Trophy} label="Raids" value={fmtNum(global.raids?.total)} />
            </div>

            {data.guild && (
              <div className="rounded-xl border border-border bg-card/40 p-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Guild contribution</p>
                <p className="mt-2 font-display text-2xl text-aurora">{formatXp(data.guild.contributed ?? 0)} XP</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Rank #{fmtNum(data.guild.contributionRank)} · Joined {fmtDate(data.guild.joined)}
                </p>
              </div>
            )}

            {/* Dungeons / raids breakdown */}
            {(global.dungeons?.total || global.raids?.total) ? (
              <div className="grid gap-3 md:grid-cols-2">
                {global.dungeons?.total != null && (
                  <Breakdown title="Dungeons" total={global.dungeons.total} list={global.dungeons.list} />
                )}
                {global.raids?.total != null && (
                  <Breakdown title="Raids" total={global.raids.total} list={global.raids.list} />
                )}
              </div>
            ) : null}

            {/* Characters */}
            {sortedChars.length > 0 && (
              <div>
                <h3 className="mb-3 font-display text-sm text-foreground">Characters ({sortedChars.length})</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {sortedChars.slice(0, 8).map((c, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-border bg-card/40 px-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm text-foreground">
                          {c.nickname ? `${c.nickname} · ` : ""}<span className="text-primary">{c.type ?? c.reskin}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Combat {c.level ?? "?"} · Total {fmtNum(c.totalLevel)}
                        </p>
                      </div>
                      <span className="font-mono text-xs text-muted-foreground">{c.gamemode?.length ? c.gamemode.join(", ") : ""}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Stat({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/40 p-3">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        <Icon className="h-3 w-3" /> {label}
      </div>
      <p className="mt-1.5 font-mono text-sm font-semibold text-foreground">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

function Breakdown({ title, total, list }: { title: string; total: number; list?: Record<string, number> }) {
  const entries = list ? Object.entries(list).sort((a, b) => b[1] - a[1]).slice(0, 6) : [];
  return (
    <div className="rounded-xl border border-border bg-card/40 p-4">
      <div className="flex items-baseline justify-between">
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{title}</p>
        <p className="font-display text-lg text-aurora">{total.toLocaleString()}</p>
      </div>
      {entries.length > 0 && (
        <ul className="mt-2 space-y-1">
          {entries.map(([name, count]) => (
            <li key={name} className="flex justify-between text-xs">
              <span className="truncate text-muted-foreground">{name}</span>
              <span className="font-mono text-foreground">{count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

