import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle, Swords, Sparkles, Users } from "lucide-react";

export const Route = createFileRoute("/join")({
  head: () => ({
    meta: [
      { title: "Join — The Quote Gang [Next]" },
      { name: "description", content: "How to join The Quote Gang Wynncraft guild. Hop in our Discord and meet the team." },
      { property: "og:title", content: "Join The Quote Gang" },
      { property: "og:description", content: "Join [Next] — laid back, raid hungry, always grinding." },
    ],
  }),
  component: JoinPage,
});

function JoinPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <span className="font-mono text-xs uppercase tracking-[0.3em] text-primary">// Recruitment</span>
      <h1 className="mt-2 text-5xl font-bold md:text-7xl">Run with <span className="text-aurora">[Next]</span></h1>
      <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
        We're a friendly Wynncraft guild grinding raids, hunting lootruns, and quoting absolutely
        unhinged things in voice chat at 3 AM. Pull up.
      </p>

      <div className="mt-12 grid gap-4 md:grid-cols-2">
        <Step icon={MessageCircle} step="01" title="Join the Discord">
          Tap the button below. Read the rules. Say hi in #introductions.
        </Step>
        <Step icon={Users} step="02" title="Meet the team">
          A chief or recruiter will ping you, ask your IGN and goals.
        </Step>
        <Step icon={Sparkles} step="03" title="Get invited in-game">
          Hop online, we'll send the guild invite. Welcome to [Next].
        </Step>
        <Step icon={Swords} step="04" title="Grind & vibe">
          Raids, wars, lootruns, events. Contribute XP, climb the ranks.
        </Step>
      </div>

      <div className="mt-12 overflow-hidden rounded-2xl border border-border bg-card/50 p-8 shadow-card md:p-12">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="text-3xl font-bold">Jump in the Discord</h2>
            <p className="mt-2 text-muted-foreground">Where everything actually happens.</p>
          </div>
          <a
            href="https://discord.gg/hvewPAyW6"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-aurora px-6 py-4 font-medium text-primary-foreground shadow-glow transition-transform hover:scale-[1.03]"
          >
            <MessageCircle className="h-5 w-5" />
            discord.gg/hvewPAyW6
          </a>
        </div>
      </div>

      <div className="mt-16 grid gap-4 md:grid-cols-3">
        <Pill k="Looking for" v="Active players" />
        <Pill k="Required" v="A pulse + Discord" />
        <Pill k="Vibe" v="Chill, chaotic, competitive" />
      </div>
    </div>
  );
}

function Step({ icon: Icon, step, title, children }: { icon: any; step: string; title: string; children: React.ReactNode }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card/40 p-6 shadow-card transition-all hover:border-primary/60">
      <div className="flex items-start justify-between">
        <Icon className="h-6 w-6 text-primary" />
        <span className="font-mono text-xs text-muted-foreground">{step}</span>
      </div>
      <h3 className="mt-4 text-xl font-bold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{children}</p>
      <div className="absolute inset-x-0 -bottom-px h-px bg-aurora opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}

function Pill({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl border border-border bg-card/40 p-4">
      <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">{k}</p>
      <p className="mt-1 font-display text-lg">{v}</p>
    </div>
  );
}
