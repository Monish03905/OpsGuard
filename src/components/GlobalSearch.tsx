import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Search, AlertTriangle, Ticket, FileText, Server, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

type SearchResult = {
  id: string;
  title: string;
  subtitle: string;
  type: "incident" | "ticket" | "log" | "status";
  url: string;
};

const typeConfig = {
  incident: { icon: AlertTriangle, label: "Incidents", url: "/alerts" },
  ticket: { icon: Ticket, label: "Tickets", url: "/tickets" },
  log: { icon: FileText, label: "Logs", url: "/logs" },
  status: { icon: Server, label: "Status", url: "/status" },
};

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.metaKey && !e.ctrlKey && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const searchTerm = `%${q}%`;
      const [incidents, tickets, logs, statuses] = await Promise.all([
        supabase.from("incidents").select("id, title, severity, status").ilike("title", searchTerm).limit(5),
        supabase.from("tickets").select("id, title, priority, status, ticket_id").ilike("title", searchTerm).limit(5),
        supabase.from("logs").select("id, message, source, level").ilike("message", searchTerm).limit(5),
        supabase.from("status_updates").select("id, system_name, status").ilike("system_name", searchTerm).limit(5),
      ]);

      const mapped: SearchResult[] = [
        ...(incidents.data?.map(i => ({ id: i.id, title: i.title, subtitle: `${i.severity} · ${i.status}`, type: "incident" as const, url: "/alerts" })) ?? []),
        ...(tickets.data?.map(t => ({ id: t.id, title: t.title, subtitle: `${t.ticket_id ?? ""} · ${t.priority} · ${t.status}`, type: "ticket" as const, url: "/tickets" })) ?? []),
        ...(logs.data?.map(l => ({ id: l.id, title: l.message.slice(0, 80), subtitle: `${l.source} · ${l.level}`, type: "log" as const, url: "/logs" })) ?? []),
        ...(statuses.data?.map(s => ({ id: s.id, title: s.system_name, subtitle: s.status, type: "status" as const, url: "/status" })) ?? []),
      ];
      setResults(mapped);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  const go = (url: string) => {
    setOpen(false);
    setQuery("");
    setResults([]);
    navigate(url);
  };

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    (acc[r.type] ??= []).push(r);
    return acc;
  }, {});

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 border-2 border-border bg-card px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Search…</span>
        <kbd className="ml-2 border border-border bg-muted px-1.5 py-0.5 text-[9px]">/</kbd>
      </button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search incidents, tickets, logs, systems…" value={query} onValueChange={setQuery} />
        <CommandList>
          {loading && (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
          {!loading && query.length >= 2 && results.length === 0 && (
            <CommandEmpty>No results found.</CommandEmpty>
          )}
          {!loading && query.length < 2 && (
            <div className="py-6 text-center font-mono text-[11px] text-muted-foreground">
              Type at least 2 characters to search…
            </div>
          )}
          {Object.entries(grouped).map(([type, items]) => {
            const cfg = typeConfig[type as keyof typeof typeConfig];
            return (
              <CommandGroup key={type} heading={cfg.label}>
                {items.map(item => (
                  <CommandItem key={item.id} onSelect={() => go(item.url)}>
                    <cfg.icon className="mr-2 h-4 w-4" />
                    <div className="flex flex-col">
                      <span className="text-sm">{item.title}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{item.subtitle}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}
        </CommandList>
      </CommandDialog>
    </>
  );
}
