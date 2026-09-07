import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck, AlertTriangle, XCircle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const statusIcon = { met: ShieldCheck, at_risk: AlertTriangle, breached: XCircle };
const statusCls = {
  met: "text-success border-success bg-success/10",
  at_risk: "text-warning border-warning bg-warning/10",
  breached: "text-destructive border-destructive bg-destructive/10",
};

export function SlaComplianceWidget() {
  const { data } = useQuery({
    queryKey: ["dashboard-sla-compliance"],
    queryFn: async () => {
      const { data, error } = await supabase.from("sla_targets").select("*");
      if (error) throw error;
      const items = data ?? [];
      const met = items.filter((s) => s.status === "met").length;
      const atRisk = items.filter((s) => s.status === "at_risk").length;
      const breached = items.filter((s) => s.status === "breached").length;
      const avgUptime = items.length > 0 ? (items.reduce((a, b) => a + Number(b.current_uptime), 0) / items.length).toFixed(2) : "—";
      return { items, met, atRisk, breached, total: items.length, avgUptime };
    },
    refetchInterval: 15000,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      className="border-2 border-border bg-card p-6"
    >
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-accent" />
        <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">
          SLA Compliance
        </h3>
      </div>

      {/* Summary pills */}
      <div className="mb-4 flex gap-2">
        {[
          { label: "Met", count: data?.met ?? 0, cls: "border-success bg-success/10 text-success" },
          { label: "At Risk", count: data?.atRisk ?? 0, cls: "border-warning bg-warning/10 text-warning" },
          { label: "Breached", count: data?.breached ?? 0, cls: "border-destructive bg-destructive/10 text-destructive" },
        ].map((s) => (
          <span key={s.label} className={cn("border-2 px-2 py-0.5 font-mono text-[10px] font-bold", s.cls)}>
            {s.count} {s.label}
          </span>
        ))}
      </div>

      {/* Avg uptime */}
      <div className="mb-4">
        <p className="font-mono text-[10px] text-muted-foreground">Average Uptime</p>
        <p className="stat-number text-2xl text-foreground">{data?.avgUptime ?? "—"}%</p>
      </div>

      {/* Service list */}
      <div className="space-y-2 max-h-[180px] overflow-y-auto">
        {(data?.items ?? []).map((sla) => {
          const Icon = statusIcon[sla.status as keyof typeof statusIcon] ?? ShieldCheck;
          const cls = statusCls[sla.status as keyof typeof statusCls] ?? "";
          return (
            <div key={sla.id} className="flex items-center gap-3 border-l-2 border-border py-1.5 pl-3 hover:border-accent transition-colors">
              <div className={cn("border p-1", cls)}>
                <Icon className="h-3 w-3" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-[11px] font-bold text-foreground">{sla.service_name}</p>
                <p className="font-mono text-[9px] text-muted-foreground">
                  {Number(sla.current_uptime).toFixed(2)}% / {Number(sla.target_uptime)}% · {sla.response_time_target_ms}ms target
                </p>
              </div>
            </div>
          );
        })}
        {(data?.total ?? 0) === 0 && (
          <p className="py-4 text-center font-mono text-[11px] text-muted-foreground">No SLA targets configured</p>
        )}
      </div>
    </motion.div>
  );
}
