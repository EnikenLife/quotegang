import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { fetchGuild, formatJoined, formatXp, RANK_ORDER, skinHead, type Rank } from "@/lib/wynncraft";
import { PlayerDialog } from "@/components/PlayerDialog";

export const Route = createFileRoute("/members")({
  head: () => ({
    meta: [
      { title: "Members — The Quote Gang [Next]" },
      { name: "description", content: "All members of The Quote Gang Wynncraft guild, ranked by role and total guild XP contribution." },
      { property: "og:title", content: "Members — The Quote Gang" },
      { property: "og:description", content: "Browse every member of [Next] with skin, join date, and XP contribution." },
    ],
  }),
  component: MembersPage,
});

const RANK_LABEL: Record<Rank, string> = {
  owner: "Owner",
  chief: "Chief",
  strategist: "Strategist",
  captain: "Captain",
  recruiter: "Recruiter",
  recruit: "Recruit",
};

function MembersPage() {
  const { data, isLoading, error } = useQuery({ queryKey: ["guild"], queryFn: fetchGuild, staleTime: 60_000 });
  const [q, setQ] = useState("");
  const [rankFilter, setRankFilter] = useState<Rank | "all">("all");
  const [selected, setSelected] = useState<{ username: string; uuid: string } | null>(null);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.members.filter((m) => {
      if (rankFilter !== "all" && m.rank !== rankFilter) return false;
      if (q && !m.username.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [data, q, rankFilter]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="mb-10 flex flex-col gap-2">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary">// Roster</span>
        <h1 className="text-4xl font-bold md:text-6xl">The <span className="text-aurora">Gang</span></h1>
        <p className="max-w-2xl text-muted-foreground">
          Live data from the Wynncraft API. Sorted by rank, then by total guild XP contribution.
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search username…"
          className="w-full max-w-xs rounded-md border border-border bg-card/40 px-4 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="flex flex-wrap gap-2">
          <FilterChip active={rankFilter === "all"} onClick={() => setRankFilter("all")}>All</FilterChip>
          {RANK_ORDER.map((r) => (
            <FilterChip key={r} active={rankFilter === r} onClick={() => setRankFilter(r)}>
              {RANK_LABEL[r]}
            </FilterChip>
          ))}
        </div>
      </div>

      {isLoading && <SkeletonGrid />}
      {error && <p className="text-destructive">Failed to load guild data.</p>}

      {data && (
        <>
          <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
            <Stat label="Members" value={data.totalMembers} />
            <Stat label="Online" value={data.online} accent />
            <Stat label="Guild Level" value={data.level} />
            <Stat label="Raids" value={data.raids} />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((m) => (
              <button
                key={m.uuid}
                type="button"
                onClick={() => setSelected({ username: m.username, uuid: m.uuid })}
                className="group relative flex items-center gap-4 rounded-xl border border-border bg-card/40 p-4 text-left shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:bg-card/70 hover:ring-aurora"
              >
                <div className="relative">
                  <img
                    src={skinHead(m.uuid, 96)}
                    alt={m.username}
                    width={56}
                    height={56}
                    loading="lazy"
                    className="h-14 w-14 rounded-md border border-border bg-background pixelated"
                    style={{ imageRendering: "pixelated" }}
                  />
                  {m.online && (
                    <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-primary shadow-glow ring-2 ring-background" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-sm font-semibold text-foreground">{m.username}</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-primary">{RANK_LABEL[m.rank]}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Joined {formatJoined(m.joined)}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-bold text-aurora">{formatXp(m.contributed)}</p>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">XP</p>
                </div>
              </button>
            ))}
          </div>
          {filtered.length === 0 && <p className="mt-12 text-center text-muted-foreground">No members match.</p>}
        </>
      )}
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs uppercase tracking-widest transition-colors ${active ? "border-primary bg-primary/15 text-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}
    >
      {children}
    </button>
  );
}

function Stat({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card/40 p-4 shadow-card">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className={`mt-1 font-display text-2xl font-bold ${accent ? "text-aurora" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="h-[88px] animate-pulse rounded-xl border border-border bg-card/30" />
      ))}
    </div>
  );
}
