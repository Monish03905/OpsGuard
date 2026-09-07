import { useState, useEffect } from "react";
import { Keyboard } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const shortcuts = [
  { category: "Navigation", items: [
    { keys: ["Ctrl", "K"], desc: "Open command palette" },
    { keys: ["/"], desc: "Open global search" },
    { keys: ["?"], desc: "Open this help panel" },
  ]},
  { category: "Quick Actions", items: [
    { keys: ["G", "D"], desc: "Go to Dashboard" },
    { keys: ["G", "L"], desc: "Go to Logs" },
    { keys: ["G", "A"], desc: "Go to Alerts" },
    { keys: ["G", "M"], desc: "Go to Monitoring" },
    { keys: ["G", "T"], desc: "Go to Tickets" },
    { keys: ["G", "S"], desc: "Go to Status" },
    { keys: ["G", "E"], desc: "Go to Teams" },
    { keys: ["G", "U"], desc: "Go to SLA & Uptime" },
    { keys: ["G", "R"], desc: "Go to Runbooks" },
    { keys: ["G", "X"], desc: "Go to Audit Trail" },
  ]},
  { category: "Theme", items: [
    { keys: ["Ctrl", "Shift", "T"], desc: "Toggle theme (Light → Dark → System)" },
  ]},
];

export function KeyboardShortcuts() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "?" && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setOpen(o => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 border border-border hover:border-foreground" title="Keyboard shortcuts (?)">
          <Keyboard className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md border-2 border-foreground bg-card p-0">
        <DialogHeader className="border-b-2 border-border px-6 py-4">
          <DialogTitle className="font-mono text-sm font-bold uppercase tracking-wider">Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto px-6 py-4 space-y-6">
          {shortcuts.map(group => (
            <div key={group.category}>
              <h4 className="mb-3 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">{group.category}</h4>
              <div className="space-y-2">
                {group.items.map(item => (
                  <div key={item.desc} className="flex items-center justify-between">
                    <span className="font-mono text-xs text-foreground">{item.desc}</span>
                    <div className="flex gap-1">
                      {item.keys.map(k => (
                        <kbd key={k} className="inline-flex min-w-[24px] items-center justify-center border-2 border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-bold text-foreground">
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
