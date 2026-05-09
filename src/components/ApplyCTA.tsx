import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function ApplyCTA({
  className = "",
  variant = "primary",
  children = "Apply now",
}: {
  className?: string;
  variant?: "primary" | "outline";
  children?: React.ReactNode;
}) {
  const { session } = useAuth();
  const [open, setOpen] = useState(false);

  const cls =
    variant === "primary"
      ? "inline-flex items-center gap-2 rounded-lg bg-aurora px-6 py-3 font-medium text-primary-foreground shadow-glow transition-transform hover:scale-[1.03]"
      : "inline-flex items-center gap-2 rounded-lg border border-border bg-card/40 px-6 py-3 font-medium text-foreground hover:border-primary/60";

  if (session) {
    return <Link to="/apply" className={`${cls} ${className}`}>{children}</Link>;
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`${cls} ${className}`}>{children}</button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="border-border bg-card/95 backdrop-blur">
          <DialogTitle>Apply to [Next]</DialogTitle>
          <DialogDescription>
            You can apply through the website (sign in or sign up first) or just hop into our Discord.
          </DialogDescription>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <Link to="/login" onClick={() => setOpen(false)} className="flex-1 rounded-md bg-aurora px-4 py-3 text-center font-medium text-primary-foreground">
              Sign in
            </Link>
            <Link to="/signup" onClick={() => setOpen(false)} className="flex-1 rounded-md border border-border bg-card/40 px-4 py-3 text-center font-medium text-foreground">
              Create account
            </Link>
            <a href="https://discord.gg/hvewPAyW6" target="_blank" rel="noreferrer" className="flex-1 inline-flex items-center justify-center gap-2 rounded-md border border-border bg-card/40 px-4 py-3 font-medium text-foreground">
              <MessageCircle className="h-4 w-4" /> Discord
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
