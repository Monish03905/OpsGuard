import { useState } from "react";
import { motion } from "framer-motion";
import { Target, Plus, Trash2, Search, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";

const statusStyles: Record<string, { label: string; cls: string; icon: typeof TrendingUp }> = {
  met: { label: "Met", cls: "text-success border-success bg-success/10", icon: TrendingUp },
  at_risk: { label: "At Risk", cls: "text-warning border-warning bg-warning/10", icon: Minus },
  breached: { label: "Breached", cls: "text-destructive border-destructive bg-destructive/10", icon: TrendingDown },
};

const SlaTracking = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ service_name: "", target_uptime: "99.9", response_time_target_ms: "500" });

  const { data: slas = [], isLoading } = useQuery({
    queryKey: ["sla_targets"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sla_targets").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createSla = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("sla_targets").insert({
        service_name: form.service_name,
        target_uptime: parseFloat(form.target_uptime),
        response_time_target_ms: parseInt(form.response_time_target_ms),
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sla_targets"] });
      toast({ title: "SLA target created" });
      setForm({ service_name: "", target_uptime: "99.9", response_time_target_ms: "500" });
      setOpen(false);
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteSla = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("sla_targets").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sla_targets"] });
      toast({ title: "SLA target deleted" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const filtered = slas.filter((s) => s.service_name.toLowerCase().includes(search.toLowerCase()));

  const summary = {
    total: slas.length,
    met: slas.filter((s) => s.status === "met").length,
    at_risk: slas.filter((s) => s.status === "at_risk").length,
    breached: slas.filter((s) => s.status === "breached").length,
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="inline-block border-2 border-foreground bg-accent px-3 py-1 mb-4">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-accent-foreground">Operations</span>
        </div>
        <h2 className="text-3xl font-bold uppercase tracking-tight text-foreground">
          SLA & <span className="bg-accent text-accent-foreground px-2">Uptime</span>
        </h2>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Services", value: summary.total, cls: "border-foreground" },
          { label: "SLA Met", value: summary.met, cls: "border-success" },
          { label: "At Risk", value: summary.at_risk, cls: "border-warning" },
          { label: "Breached", value: summary.breached, cls: "border-destructive" },
        ].map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
            className={`border-2 ${c.cls} bg-card p-4`}>
            <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{c.label}</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{c.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search services..." className="pl-10 border-2 border-border bg-background font-mono text-xs" />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="border-2 border-foreground bg-foreground font-mono text-[10px] uppercase tracking-wider text-background hover:bg-foreground/90">
              <Plus className="mr-2 h-3.5 w-3.5" /> New SLA Target
            </Button>
          </DialogTrigger>
          <DialogContent className="border-2 border-foreground bg-card">
            <DialogHeader>
              <DialogTitle className="font-mono text-sm uppercase tracking-wider">Add SLA Target</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Service Name</Label>
                <Input value={form.service_name} onChange={(e) => setForm({ ...form, service_name: e.target.value })} className="border-2 font-mono text-sm" placeholder="e.g. API Gateway" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Target Uptime %</Label>
                  <Input value={form.target_uptime} onChange={(e) => setForm({ ...form, target_uptime: e.target.value })} className="border-2 font-mono text-sm" type="number" step="0.01" />
                </div>
                <div>
                  <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Response Target (ms)</Label>
                  <Input value={form.response_time_target_ms} onChange={(e) => setForm({ ...form, response_time_target_ms: e.target.value })} className="border-2 font-mono text-sm" type="number" />
                </div>
              </div>
              <Button onClick={() => createSla.mutate()} disabled={!form.service_name || createSla.isPending} className="w-full border-2 border-foreground bg-foreground font-mono text-[10px] uppercase tracking-wider text-background">
                {createSla.isPending ? "Creating…" : "Create SLA Target"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {filtered.map((sla, i) => {
          const st = statusStyles[sla.status] || statusStyles.met;
          const uptimePercent = Math.min(100, Math.max(0, Number(sla.current_uptime)));
          return (
            <motion.div
              key={sla.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.03 * i }}
              className="border-2 border-border bg-card p-5 hover:border-foreground transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">{sla.service_name}</h3>
                  <div className="mt-1 flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1 border px-2 py-0.5 font-mono text-[10px] uppercase ${st.cls}`}>
                      <st.icon className="h-3 w-3" /> {st.label}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">Target: {Number(sla.target_uptime)}%</span>
                    <span className="font-mono text-[10px] text-muted-foreground">Response: {sla.response_time_target_ms}ms</span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive" onClick={() => deleteSla.mutate(sla.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
                  <span>Current Uptime</span>
                  <span className="font-bold text-foreground">{Number(sla.current_uptime)}%</span>
                </div>
                <Progress value={uptimePercent} className="h-2 border border-border" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {!isLoading && filtered.length === 0 && (
        <div className="border-2 border-dashed border-border p-12 text-center">
          <Target className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 font-mono text-xs text-muted-foreground">No SLA targets defined</p>
        </div>
      )}
    </div>
  );
};

export default SlaTracking;
