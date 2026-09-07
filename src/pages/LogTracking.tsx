import { motion } from "framer-motion";
import { Search, Plus } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const levelStyles: Record<string, string> = {
  ERROR: "border-destructive bg-destructive/10 text-destructive",
  WARN: "border-warning bg-warning/10 text-warning",
  INFO: "border-foreground/30 bg-secondary text-foreground",
  DEBUG: "border-border bg-muted/30 text-muted-foreground",
};

const LogTracking = () => {
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [open, setOpen] = useState(false);
  const [newLog, setNewLog] = useState({ level: "INFO", source: "", message: "", trace_id: "" });
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("logs")
        .select("*")
        .order("timestamp", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createLog = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("logs").insert({
        ...newLog,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["logs"] });
      setOpen(false);
      setNewLog({ level: "INFO", source: "", message: "", trace_id: "" });
      toast({ title: "Log created" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const filtered = logs.filter((log: any) => {
    const matchesSearch = log.message?.toLowerCase().includes(search.toLowerCase()) || log.source?.toLowerCase().includes(search.toLowerCase());
    const matchesLevel = levelFilter === "ALL" || log.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <div className="inline-block border-2 border-foreground bg-accent px-3 py-1 mb-3">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-accent-foreground">System Logs</span>
          </div>
          <h2 className="text-3xl font-bold uppercase tracking-tight text-foreground">Log Tracking</h2>
          <p className="mt-1 font-mono text-xs text-muted-foreground">Centralized log aggregation and search across all services.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4" /> Add Log</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Log Entry</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Level</Label>
                <Select value={newLog.level} onValueChange={(v) => setNewLog({ ...newLog, level: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["ERROR", "WARN", "INFO", "DEBUG"].map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Source</Label>
                <Input value={newLog.source} onChange={(e) => setNewLog({ ...newLog, source: e.target.value })} placeholder="e.g. api-gateway" />
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Input value={newLog.message} onChange={(e) => setNewLog({ ...newLog, message: e.target.value })} placeholder="Log message" />
              </div>
              <div className="space-y-2">
                <Label>Trace ID</Label>
                <Input value={newLog.trace_id} onChange={(e) => setNewLog({ ...newLog, trace_id: e.target.value })} placeholder="Optional" />
              </div>
              <Button onClick={() => createLog.mutate()} disabled={!newLog.source || !newLog.message} className="w-full">
                Create Log
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full border-2 border-border bg-card py-2 pl-10 pr-4 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none" />
        </div>
        <div className="flex gap-2">
          {["ALL", "ERROR", "WARN", "INFO", "DEBUG"].map((level) => (
            <button key={level} onClick={() => setLevelFilter(level)}
              className={`border-2 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wider transition-all duration-150 ${levelFilter === level ? "border-foreground bg-primary text-primary-foreground shadow-brutal-sm" : "border-border bg-card text-muted-foreground hover:border-foreground hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-brutal-sm"}`}>
              {level}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="border-2 border-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="h-6 w-6 animate-spin border-2 border-foreground border-t-transparent" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-border bg-secondary/30">
                  <th className="px-4 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Timestamp</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Level</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Source</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Message</th>
                  <th className="px-4 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Trace ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr><td colSpan={5} className="px-4 py-8 text-center font-mono text-xs text-muted-foreground">No logs found. Create one to get started.</td></tr>
                ) : filtered.map((log: any, i: number) => (
                  <motion.tr key={log.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * Math.min(i, 10) }} className="transition-all duration-150 hover:bg-accent/5 hover:translate-x-1 cursor-default">
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] text-muted-foreground">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-3"><span className={`inline-block border-2 px-2 py-0.5 font-mono text-[10px] font-bold uppercase ${levelStyles[log.level]}`}>{log.level}</span></td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-[11px] font-bold text-foreground">{log.source}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-foreground">{log.message}</td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-[10px] text-muted-foreground">{log.trace_id || "—"}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default LogTracking;
