import { Activity, Bell, Shield } from "lucide-react";

export const Navbar = () => (
  <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
    <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 glow-primary">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-sm font-bold text-foreground">OpsGuard</h1>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Incident Response</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-full border border-success/30 bg-success/10 px-3 py-1.5">
          <Activity className="h-3.5 w-3.5 text-success" />
          <span className="font-display text-xs text-success">All Systems Operational</span>
        </div>
        <button className="relative rounded-lg bg-secondary p-2 transition-colors hover:bg-secondary/80">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-background bg-destructive" />
        </button>
      </div>
    </div>
  </nav>
);
