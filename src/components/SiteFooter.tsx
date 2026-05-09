export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-border">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-8 text-xs text-muted-foreground md:flex-row">
        <p className="font-mono">© {new Date().getFullYear()} The Quote Gang · [Next]</p>
        <p>
          Inspired by <a href="https://seqwawa.com" target="_blank" rel="noreferrer" className="text-primary hover:underline">seqwawa.com</a>. Not affiliated with Wynncraft or Mojang.
        </p>
      </div>
    </footer>
  );
}
