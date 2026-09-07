import { motion } from "framer-motion";
import { AlertCircle, AlertTriangle, Info, Plus, Search, Trash2, Download } from "lucide-react";
import { exportToCsv } from "@/lib/exportCsv";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const severityIcon: Record<string, JSX.Element> = {
  P1: <AlertCircle className="h-4 w-4 text-destructive" />,
  P2: <AlertTriangle className="h-4 w-4 text-warning" />,
  P3: <Info className="h-4 w-4 text-muted-foreground" />,
};

export const IncidentFeedLive = () => {
  const { data: incidents = [] } = useQuery({
    queryKey: ["incidents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("incidents")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel("incidents-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "incidents" }, () => {
        queryClient.invalidateQueries({ queryKey: ["incidents"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      className="border-2 border-border bg-card">
      <div className="flex items-center justify-between border-b-2 border-border px-5 py-4">
        <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">Live Incident Feed</h3>
        <span className="h-2 w-2 bg-success status-pulse" />
      </div>
      <div className="divide-y divide-border">
        {incidents.length === 0 ? (
          <div className="p-6 text-center font-mono text-xs text-muted-foreground">No incidents</div>
        ) : incidents.map((inc: any) => (
          <div key={inc.id} className="flex items-center gap-4 px-5 py-3 transition-all duration-150 hover:bg-accent/5 hover:translate-x-1 cursor-default">
            {severityIcon[inc.severity] || severityIcon.P3}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-bold text-muted-foreground">{inc.incident_id}</span>
                <p className="truncate font-mono text-xs font-bold text-foreground">{inc.title}</p>
              </div>
              <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{inc.team || "—"} · {new Date(inc.created_at).toLocaleTimeString()}</p>
            </div>
            <StatusBadge status={inc.status as any} />
          </div>
        ))}
      </div>
    </motion.div>
  );
};

const AlertSystem = () => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", severity: "P3", status: "investigating", team: "", description: "" });
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ["incidents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("incidents")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('alerts-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'incidents' }, (payload) => {
        queryClient.invalidateQueries({ queryKey: ["incidents"] });
        if (payload.eventType === 'INSERT' && payload.new?.severity === 'P1') {
          toast({
            title: "🚨 Critical P1 Incident",
            description: payload.new.title,
            variant: "destructive",
          });
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient, toast]);

  const createIncident = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("incidents").insert({
        ...form,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      setOpen(false);
      setForm({ title: "", severity: "P3", status: "investigating", team: "", description: "" });
      toast({ title: "Incident created" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("incidents").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["incidents"] }),
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteIncident = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("incidents").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      toast({ title: "Incident deleted" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const filtered = incidents.filter((inc: any) => {
    const matchesSearch = inc.title?.toLowerCase().includes(search.toLowerCase()) || inc.team?.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === "ALL" || inc.severity === severityFilter;
    const matchesStatus = statusFilter === "ALL" || inc.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const activeCount = incidents.filter((i: any) => i.status !== "resolved").length;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <div className="inline-block border-2 border-foreground bg-accent px-3 py-1 mb-3">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-accent-foreground">Incident Management</span>
          </div>
          <h2 className="text-3xl font-bold uppercase tracking-tight text-foreground">Alert System</h2>
          <p className="mt-1 font-mono text-xs text-muted-foreground">Manage and respond to active alerts across infrastructure.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportToCsv("incidents", filtered, ["incident_id", "title", "severity", "status", "team", "description", "created_at", "updated_at"])}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4" /> New Incident</Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Incident</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Describe the incident" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Severity</Label>
                  <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["P1", "P2", "P3"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["critical", "investigating", "warning", "resolved"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Team</Label>
                <Input value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })} placeholder="e.g. Platform" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional details" />
              </div>
              <Button onClick={() => createIncident.mutate()} disabled={!form.title} className="w-full">Create Incident</Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="border-2 border-border bg-card p-4 text-center brutal-hover-accent">
          <p className="stat-number text-2xl text-destructive">{activeCount}</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Active</p>
        </div>
        <div className="border-2 border-border bg-card p-4 text-center brutal-hover-accent">
          <p className="stat-number text-2xl text-success">{incidents.filter((i: any) => i.status === "resolved").length}</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Resolved</p>
        </div>
        <div className="border-2 border-border bg-card p-4 text-center brutal-hover-accent">
          <p className="stat-number text-2xl text-foreground">{incidents.length}</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Total</p>
        </div>
        <div className="border-2 border-border bg-card p-4 text-center brutal-hover-accent">
          <p className="stat-number text-2xl text-foreground">{filtered.length}</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Showing</p>
        </div>
      </motion.div>

      {/* Search & Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search incidents..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full border-2 border-border bg-card py-2 pl-10 pr-4 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none" />
        </div>
        <div className="flex gap-2">
          {["ALL", "P1", "P2", "P3"].map((s) => (
            <button key={s} onClick={() => setSeverityFilter(s)}
              className={`border-2 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wider transition-all duration-150 ${severityFilter === s ? "border-foreground bg-primary text-primary-foreground shadow-brutal-sm" : "border-border bg-card text-muted-foreground hover:border-foreground hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-brutal-sm"}`}>
              {s === "ALL" ? "All Sev" : s}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {["ALL", "critical", "investigating", "warning", "resolved"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`border-2 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wider transition-all duration-150 ${statusFilter === s ? "border-foreground bg-primary text-primary-foreground shadow-brutal-sm" : "border-border bg-card text-muted-foreground hover:border-foreground hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-brutal-sm"}`}>
              {s === "ALL" ? "All Status" : s}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Incident List */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="h-6 w-6 animate-spin border-2 border-foreground border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="border-2 border-border bg-card p-12 text-center font-mono text-xs text-muted-foreground">No incidents match your filters.</div>
        ) : filtered.map((inc: any, i: number) => (
          <motion.div key={inc.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.03 * Math.min(i, 10) }}
            className="group border-2 border-border bg-card p-5 brutal-hover">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {severityIcon[inc.severity]}
                  <span className="font-mono text-[10px] font-bold text-muted-foreground">{inc.incident_id}</span>
                  <span className="border-2 border-border px-1.5 py-0 font-mono text-[9px] font-bold uppercase text-muted-foreground">{inc.severity}</span>
                </div>
                <h4 className="mt-1 font-mono text-xs font-bold text-foreground">{inc.title}</h4>
                {inc.description && <p className="mt-1 font-mono text-[10px] text-muted-foreground">{inc.description}</p>}
                <p className="mt-2 font-mono text-[10px] text-muted-foreground">{inc.team || "—"} · {new Date(inc.created_at).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                {inc.status !== "resolved" ? (
                  <Select value={inc.status} onValueChange={(v) => updateStatus.mutate({ id: inc.id, status: v })}>
                    <SelectTrigger className="h-7 w-auto gap-1 border-0 bg-transparent p-0 text-xs">
                      <StatusBadge status={inc.status as any} />
                    </SelectTrigger>
                    <SelectContent>
                      {["critical", "investigating", "warning", "resolved"].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <StatusBadge status="resolved" />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 text-destructive hover:text-destructive"
                  onClick={() => deleteIncident.mutate(inc.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default AlertSystem;
