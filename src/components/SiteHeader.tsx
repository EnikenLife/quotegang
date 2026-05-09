import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, LogOut, Shield } from "lucide-react";
import bannerLogo from "@/assets/banner.png";
import { useAuth } from "@/hooks/use-auth";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { session, profile, isAdmin, signOut } = useAuth();
  const nav = useNavigate();

  const NAV = [
    { to: "/", label: "Home" },
    { to: "/members", label: "Members" },
    { to: "/join", label: "Join" },
    ...(session ? [{ to: "/my-application", label: "My App" }] : []),
    ...(isAdmin ? [{ to: "/applications", label: "View Applications" }] : []),
  ] as const;

  const head = profile
    ? (profile.mc_uuid
        ? `https://mc-heads.net/avatar/${profile.mc_uuid}/64`
        : `https://mc-heads.net/avatar/${profile.ign}/64`)
    : null;

  return (
    <header className="sticky top-0 z-50 glass">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* LEFT: logo + (when logged in) user pill */}
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3">
            <img src={bannerLogo} alt="The Quote Gang" className="h-10 w-auto md:h-12" />
          </Link>
          {session && profile && (
            <Link to="/my-application" className="hidden items-center gap-2 rounded-full border border-border bg-card/50 px-2 py-1 sm:flex">
              {head && (
                <img src={head} alt={profile.ign} className="h-7 w-7 rounded-sm" style={{ imageRendering: "pixelated" }} />
              )}
              <span className="text-xs font-mono text-foreground">{profile.ign}</span>
              {isAdmin && <Shield className="h-3 w-3 text-aurora" aria-label="admin" />}
            </Link>
          )}
        </div>

        {/* CENTER tag — absolutely centered */}
        <span className="pointer-events-none absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 text-[10px] uppercase tracking-[0.3em] text-muted-foreground md:block">
          The Quote Gang [Next] · Wynncraft
        </span>

        {/* RIGHT: nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => {
            const active = path === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`relative px-3 py-2 text-sm uppercase tracking-widest transition-colors ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {n.label}
                {active && <span className="absolute inset-x-3 -bottom-px h-px bg-aurora" />}
              </Link>
            );
          })}
          {session ? (
            <button
              onClick={async () => { await signOut(); nav({ to: "/" }); }}
              className="ml-2 inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-3 w-3" /> Logout
            </button>
          ) : (
            <Link to="/login" className="ml-2 rounded-md border border-border bg-card/40 px-3 py-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
              Sign in
            </Link>
          )}
          <a
            href="https://discord.gg/hvewPAyW6"
            target="_blank" rel="noreferrer"
            className="ml-2 rounded-md bg-aurora px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow transition-transform hover:scale-[1.02]"
          >
            Discord
          </a>
        </nav>

        <button onClick={() => setOpen(!open)} className="md:hidden text-foreground" aria-label="menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border md:hidden">
          <nav className="flex flex-col p-4">
            {session && profile && (
              <div className="flex items-center gap-2 px-2 pb-3">
                {head && <img src={head} alt={profile.ign} className="h-7 w-7 rounded-sm" style={{ imageRendering: "pixelated" }} />}
                <span className="text-sm font-mono text-foreground">{profile.ign}</span>
                {isAdmin && <Shield className="h-3 w-3 text-aurora" />}
              </div>
            )}
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="px-2 py-3 text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground">
                {n.label}
              </Link>
            ))}
            {session ? (
              <button
                onClick={async () => { setOpen(false); await signOut(); nav({ to: "/" }); }}
                className="mt-2 inline-flex items-center justify-center gap-1 rounded-md border border-border px-3 py-2 text-xs uppercase tracking-widest text-muted-foreground"
              >
                <LogOut className="h-3 w-3" /> Logout
              </button>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="mt-2 rounded-md border border-border bg-card/40 px-3 py-2 text-center text-xs uppercase tracking-widest text-muted-foreground">
                Sign in
              </Link>
            )}
            <a href="https://discord.gg/hvewPAyW6" target="_blank" rel="noreferrer" className="mt-2 rounded-md bg-aurora px-4 py-3 text-center text-sm font-medium text-primary-foreground">
              Join Discord
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
