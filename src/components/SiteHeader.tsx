import { Link, useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import bannerLogo from "@/assets/banner.png";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/members", label: "Members" },
  { to: "/join", label: "Join" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-50 glass">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="group flex items-center gap-3">
          <img src={bannerLogo} alt="The Quote Gang" className="h-10 w-auto md:h-12" />
          <span className="hidden text-[10px] uppercase tracking-[0.3em] text-muted-foreground sm:block">[Next] · Wynncraft</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((n) => {
            const active = path === n.to;
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`relative px-4 py-2 text-sm uppercase tracking-widest transition-colors ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {n.label}
                {active && <span className="absolute inset-x-3 -bottom-px h-px bg-aurora" />}
              </Link>
            );
          })}
          <a
            href="https://discord.gg/hvewPAyW6"
            target="_blank"
            rel="noreferrer"
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
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="px-2 py-3 text-sm uppercase tracking-widest text-muted-foreground hover:text-foreground">
                {n.label}
              </Link>
            ))}
            <a href="https://discord.gg/hvewPAyW6" target="_blank" rel="noreferrer" className="mt-2 rounded-md bg-aurora px-4 py-3 text-center text-sm font-medium text-primary-foreground">
              Join Discord
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
