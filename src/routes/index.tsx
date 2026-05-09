import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, MessageCircle } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import bannerLogo from "@/assets/banner.png";
import { fetchGuild, formatXp, skinHead } from "@/lib/wynncraft";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Quote Gang [Next] — Wynncraft Guild" },
      { name: "description", content: "Home of [Next] — The Quote Gang. A Wynncraft guild built on raids, lootruns, and unhinged quotes." },
      { property: "og:title", content: "The Quote Gang [Next]" },
      { property: "og:description", content: "Wynncraft guild. Raids, wars, vibes." },
    ],
  }),
  component: Home,
});

function Home() {
  const { data } = useQuery({ queryKey: ["guild"], queryFn: fetchGuild, staleTime: 60_000 });
  const top = data?.members.slice(0, 6) ?? [];

  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImg}
          alt=""
          width={1920}
          height={1080}
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/40 via-background/70 to-background" />

        <div className="mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-center px-6 py-24">
          <span className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card/40 px-3 py-1 font-mono text-xs uppercase tracking-[0.3em] text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-glow" />
            Wynncraft Guild · [Next]
          </span>
          <img src={bannerLogo} alt="The Quote Gang" className="mb-2 w-full max-w-2xl drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]" />
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            A Wynncraft guild forged in late-night raids, questionable strategies,
            and even more questionable quotes. Built different. Tagged <span className="font-mono text-foreground">[Next]</span>.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              to="/join"
              className="inline-flex items-center gap-2 rounded-lg bg-aurora px-6 py-3 font-medium text-primary-foreground shadow-glow transition-transform hover:scale-[1.03]"
            >
              Join the gang <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/members"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/40 px-6 py-3 font-medium text-foreground transition-colors hover:border-primary/60 hover:bg-card/70"
            >
              See the roster
            </Link>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-background" />
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-7xl px-6 -mt-10">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard label="Members" value={data?.totalMembers ?? "—"} />
          <StatCard label="Online Now" value={data?.online ?? "—"} accent />
          <StatCard label="Guild Level" value={data?.level ?? "—"} />
          <StatCard label="Raids" value={data?.raids ?? "—"} />
        </div>
      </section>

      {/* TOP CONTRIBUTORS */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary">// Top contributors</span>
            <h2 className="mt-2 text-4xl font-bold md:text-5xl">The Council</h2>
          </div>
          <Link to="/members" className="hidden text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground md:inline-flex">
            All members →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {top.map((m, i) => (
            <a
              key={m.uuid}
              href={`https://wynncraft.com/stats/player/${m.username}`}
              target="_blank"
              rel="noreferrer"
              className="group relative overflow-hidden rounded-xl border border-border bg-card/40 p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:ring-aurora"
            >
              <span className="absolute right-4 top-4 font-mono text-xs text-muted-foreground">#{i + 1}</span>
              <div className="flex items-center gap-4">
                <img
                  src={skinHead(m.uuid, 96)}
                  alt={m.username}
                  width={64}
                  height={64}
                  loading="lazy"
                  className="h-16 w-16 rounded-md border border-border"
                  style={{ imageRendering: "pixelated" }}
                />
                <div>
                  <p className="font-mono text-base font-semibold">{m.username}</p>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-primary">{m.rank}</p>
                  <p className="mt-1 font-mono text-sm text-aurora">{formatXp(m.contributed)} XP</p>
                </div>
              </div>
            </a>
          ))}
          {top.length === 0 && Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[112px] animate-pulse rounded-xl border border-border bg-card/30" />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card/50 p-10 shadow-card md:p-16">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-aurora opacity-20 blur-3xl" />
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h2 className="text-3xl font-bold md:text-5xl">Think you've got <span className="text-aurora">[Next]</span> in you?</h2>
              <p className="mt-3 max-w-xl text-muted-foreground">Hop into Discord. We don't bite. Often.</p>
            </div>
            <a
              href="https://discord.gg/hvewPAyW6"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-aurora px-6 py-4 font-medium text-primary-foreground shadow-glow transition-transform hover:scale-[1.03]"
            >
              <MessageCircle className="h-5 w-5" /> Join Discord
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-5 shadow-card backdrop-blur">
      <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{label}</p>
      <p className={`mt-2 font-display text-3xl font-bold ${accent ? "text-aurora" : "text-foreground"}`}>{value}</p>
    </div>
  );
}
