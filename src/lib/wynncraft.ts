export type Member = {
  username: string;
  uuid: string;
  rank: Rank;
  contributed: number;
  joined: string;
  online: boolean;
  server: string | null;
  contributionRank: number;
};

export type Rank = "owner" | "chief" | "strategist" | "captain" | "recruiter" | "recruit";

export const RANK_ORDER: Rank[] = ["owner", "chief", "strategist", "captain", "recruiter", "recruit"];

export type GuildData = {
  name: string;
  prefix: string;
  level: number;
  xpPercent: number;
  territories: number;
  wars: number;
  raids: number;
  created: string;
  totalMembers: number;
  online: number;
  members: Member[];
};

export async function fetchGuild(): Promise<GuildData> {
  const res = await fetch("https://api.wynncraft.com/v3/guild/prefix/Next");
  if (!res.ok) throw new Error("Failed to load guild");
  const data = await res.json();

  const members: Member[] = [];
  let online = 0;
  for (const rank of RANK_ORDER) {
    const group = data.members?.[rank] ?? {};
    for (const [username, m] of Object.entries<any>(group)) {
      if (m.online) online++;
      members.push({
        username,
        uuid: m.uuid,
        rank,
        contributed: m.contributed ?? 0,
        joined: m.joined,
        online: !!m.online,
        server: m.server ?? null,
        contributionRank: m.contributionRank ?? 9999,
      });
    }
  }

  // Sort: by rank order, then by contributed desc within rank
  members.sort((a, b) => {
    const ra = RANK_ORDER.indexOf(a.rank);
    const rb = RANK_ORDER.indexOf(b.rank);
    if (ra !== rb) return ra - rb;
    return b.contributed - a.contributed;
  });

  return {
    name: data.name,
    prefix: data.prefix,
    level: data.level,
    xpPercent: data.xpPercent,
    territories: data.territories,
    wars: data.wars,
    raids: data.raids,
    created: data.created,
    totalMembers: data.members?.total ?? members.length,
    online,
    members,
  };
}

export function formatXp(n: number): string {
  if (n >= 1e12) return (n / 1e12).toFixed(2) + "T";
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return String(n);
}

export function formatJoined(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

export function skinHead(uuid: string, size = 96): string {
  return `https://mc-heads.net/avatar/${uuid}/${size}`;
}
