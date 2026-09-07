import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, XCircle, Plus, Search, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const statusConfig: Record<string, { label: string; icon: typeof CheckCircle; cls: string; bg: string }> = {
  operational: { label: "Operational", icon: CheckCircle, cls: "text-success", bg: "border-success bg-success/10" },
  degraded: { label: "Degraded", icon: AlertTriangle, cls: "text-warning", bg: "border-warning bg-warning/10" },
  partial_outage: { label: "Partial Outage", icon: XCircle, cls: "text-destructive", bg: "border-destructive bg-destructive/10" },
  major_outage: { label: "Major Outage", icon: XCircle, cls: "text-destructive", bg: "border-destructive bg-destructive/10" },
};

const StatusUpdates = () => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ system_name: "", status: "operational", uptime: "99.99%" });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: systems = [], isLoading } = useQuery({
    queryKey: ["status_updates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("status_updates")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('status-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'status_updates' }, () => {
        queryClient.invalidateQueries({ queryKey: ["status_updates"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const createStatus = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("status_updates").insert({
        ...form,
        updated_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["status_updates"] });
      setOpen(false);
      setForm({ system_name: "", status: "operational", uptime: "99.99%" });
      toast({ title: "System added" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateSystemStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("status_updates").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["status_updates"] }),
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteSystem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("status_updates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["status_updates"] });
      toast({ title: "System removed" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const filtered = systems.filter((sys: any) => {
    const matchesSearch = sys.system_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || sys.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const degradedCount = systems.filter((s: any) => s.status !== "operational").length;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <div className="inline-block border-2 border-foreground bg-accent px-3 py-1 mb-3">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-accent-foreground">System Health</span>
          </div>
          <h2 className="text-3xl font-bold uppercase tracking-tight text-foreground">Status Updates</h2>
          <p className="mt-1 font-mono text-xs text-muted-foreground">Current system status and recent operational updates.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4" /> Add System</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add System Status</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>System Name</Label>
                <Input value={form.system_name} onChange={(e) => setForm({ ...form, system_name: e.target.value })} placeholder="e.g. API Gateway" />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Uptime</Label>
                <Input value={form.uptime} onChange={(e) => setForm({ ...form, uptime: e.target.value })} placeholder="e.g. 99.99%" />
              </div>
              <Button onClick={() => createStatus.mutate()} disabled={!form.system_name} className="w-full">Add System</Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Overall Status */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className={`flex items-center gap-3 border-2 p-4 ${degradedCount > 0 ? "border-warning bg-warning/5" : "border-success bg-success/5"}`}>
        {degradedCount > 0 ? <AlertTriangle className="h-5 w-5 text-warning" /> : <CheckCircle className="h-5 w-5 text-success" />}
        <div className="flex-1">
          <p className="font-mono text-xs font-bold uppercase text-foreground">{degradedCount > 0 ? "Partial System Degradation" : "All Systems Operational"}</p>
          <p className="font-mono text-[10px] text-muted-foreground">{degradedCount > 0 ? `${degradedCount} service(s) experiencing issues.` : "All monitored services are healthy."}</p>
        </div>
        <div className="flex gap-4 text-center">
          <div>
            <p className="stat-number text-lg text-success">{systems.filter((s: any) => s.status === "operational").length}</p>
            <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Healthy</p>
          </div>
          <div>
            <p className="stat-number text-lg text-warning">{degradedCount}</p>
            <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Issues</p>
          </div>
          <div>
            <p className="stat-number text-lg text-foreground">{systems.length}</p>
            <p className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">Total</p>
          </div>
        </div>
      </motion.div>

      {/* Search & Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search systems..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full border-2 border-border bg-card py-2 pl-10 pr-4 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none" />
        </div>
        <div className="flex gap-2">
          {["ALL", ...Object.keys(statusConfig)].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`border-2 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wider transition-all duration-150 ${statusFilter === s ? "border-foreground bg-primary text-primary-foreground shadow-brutal-sm" : "border-border bg-card text-muted-foreground hover:border-foreground hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-brutal-sm"}`}>
              {s === "ALL" ? "All" : statusConfig[s]?.label || s}
            </button>
          ))}
        </div>
      </motion.div>

      {/* System Grid */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <div className="col-span-full flex items-center justify-center p-12">
            <div className="h-6 w-6 animate-spin border-2 border-foreground border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full border-2 border-border bg-card p-12 text-center font-mono text-xs text-muted-foreground">No systems match your filters.</div>
        ) : filtered.map((sys: any, i: number) => {
          const config = statusConfig[sys.status] || statusConfig.operational;
          const Icon = config.icon;
          return (
            <motion.div key={sys.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 * Math.min(i, 10) }}
              className="group border-2 border-border bg-card p-4 brutal-hover">
              <div className="flex items-center justify-between">
                <p className="font-mono text-xs font-bold uppercase text-foreground">{sys.system_name}</p>
                <div className="flex items-center gap-1">
                  <Icon className={`h-4 w-4 ${config.cls}`} />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100 text-destructive hover:text-destructive"
                    onClick={() => deleteSystem.mutate(sys.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <Select value={sys.status} onValueChange={(v) => updateSystemStatus.mutate({ id: sys.id, status: v })}>
                  <SelectTrigger className="h-6 w-auto border-0 bg-transparent p-0">
                    <span className={`inline-flex items-center border-2 px-2 py-0.5 font-mono text-[9px] font-bold uppercase ${config.bg} ${config.cls}`}>
                      {config.label}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(statusConfig).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
                <span className="font-mono text-[10px] text-muted-foreground">{sys.uptime}</span>
              </div>
              <p className="mt-2 font-mono text-[9px] text-muted-foreground">Updated {new Date(sys.updated_at).toLocaleString()}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
};

export default StatusUpdates;
