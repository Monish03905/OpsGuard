import { useState } from "react";
import { motion } from "framer-motion";
import { ScrollText, Search, Filter, Plus, Pencil, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

const actionIcons: Record<string, typeof Plus> = {
  created: Plus,
  updated: Pencil,
  deleted: Trash2,
};

const actionColors: Record<string, string> = {
  created: "border-success text-success bg-success/10",
  updated: "border-warning text-warning bg-warning/10",
  deleted: "border-destructive text-destructive bg-destructive/10",
};

const AuditTrail = () => {
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("ALL");
  const [actionFilter, setActionFilter] = useState("ALL");

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["audit_logs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(500);
      if (error) throw error;
      return data;
    },
    refetchInterval: 15000,
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["all-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("user_id, display_name");
      if (error) throw error;
      return data;
    },
  });

  const getUserName = (userId: string | null) => {
    if (!userId) return "System";
    return profiles.find((p) => p.user_id === userId)?.display_name || userId.slice(0, 8);
  };

  const filtered = logs.filter((l) => {
    if (entityFilter !== "ALL" && l.entity_type !== entityFilter) return false;
    if (actionFilter !== "ALL" && l.action !== actionFilter) return false;
    const details = l.details as any;
    const title = details?.title || "";
    if (search && !title.toLowerCase().includes(search.toLowerCase()) && !l.entity_type.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const entityTypes = [...new Set(logs.map((l) => l.entity_type))];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="inline-block border-2 border-foreground bg-accent px-3 py-1 mb-4">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-accent-foreground">Operations</span>
        </div>
        <h2 className="text-3xl font-bold uppercase tracking-tight text-foreground">
          Audit <span className="bg-accent text-accent-foreground px-2">Trail</span>
        </h2>
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          {logs.length} events tracked · Auto-refreshes every 15s
        </p>
      </motion.div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search events..." className="pl-10 border-2 border-border bg-background font-mono text-xs" />
        </div>
        <Select value={entityFilter} onValueChange={setEntityFilter}>
          <SelectTrigger className="w-[150px] border-2 font-mono text-xs">
            <Filter className="mr-1 h-3 w-3" /><SelectValue placeholder="Entity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Entities</SelectItem>
            {entityTypes.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[130px] border-2 font-mono text-xs">
            <SelectValue placeholder="Action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Actions</SelectItem>
            <SelectItem value="created">Created</SelectItem>
            <SelectItem value="updated">Updated</SelectItem>
            <SelectItem value="deleted">Deleted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="relative">
        <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border" />
        <div className="space-y-1">
          {filtered.map((log, i) => {
            const Icon = actionIcons[log.action] || Pencil;
            const colorCls = actionColors[log.action] || actionColors.updated;
            const details = log.details as any;
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.02 * Math.min(i, 20) }}
                className="relative flex items-start gap-4 pl-0 py-2 group"
              >
                <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center border-2 ${colorCls}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 border-2 border-transparent group-hover:border-border bg-card p-3 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-foreground capitalize">{log.action}</span>
                      <span className="mx-2 font-mono text-[10px] text-muted-foreground">·</span>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{log.entity_type}</span>
                      {details?.title && (
                        <>
                          <span className="mx-2 font-mono text-[10px] text-muted-foreground">·</span>
                          <span className="font-mono text-[10px] text-foreground">{details.title}</span>
                        </>
                      )}
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                      {format(new Date(log.created_at), "MMM dd, HH:mm:ss")}
                    </span>
                  </div>
                  <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                    by {getUserName(log.user_id)}
                    {log.entity_id && <> · ID: {log.entity_id.slice(0, 8)}</>}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {!isLoading && filtered.length === 0 && (
        <div className="border-2 border-dashed border-border p-12 text-center">
          <ScrollText className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 font-mono text-xs text-muted-foreground">No audit events recorded yet</p>
        </div>
      )}
    </div>
  );
};

export default AuditTrail;
