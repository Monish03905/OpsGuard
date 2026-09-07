import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, TrendingUp, Zap, Clock } from "lucide-react";
import { format } from "date-fns";

export function DashboardActivity() {
  const { data: recentActivity } = useQuery({
    queryKey: ["dashboard-recent-activity"],
    queryFn: async () => {
      const [incidents, tickets, logs] = await Promise.all([
        supabase.from("incidents").select("id, title, severity, status, created_at").order("created_at", { ascending: false }).limit(3),
        supabase.from("tickets").select("id, title, priority, status, created_at").order("created_at", { ascending: false }).limit(3),
        supabase.from("logs").select("id, message, level, source, timestamp").order("timestamp", { ascending: false }).limit(3),
      ]);
      return {
        incidents: incidents.data ?? [],
        tickets: tickets.data ?? [],
        logs: logs.data ?? [],
      };
    },
    refetchInterval: 15000,
  });

  const { data: severityBreakdown } = useQuery({
    queryKey: ["dashboard-severity-breakdown"],
    queryFn: async () => {
      const { data } = await supabase.from("incidents").select("severity, status");
      const items = data ?? [];
      const p1 = items.filter(i => i.severity === "P1").length;
      const p2 = items.filter(i => i.severity === "P2").length;
      const p3 = items.filter(i => i.severity === "P3").length;
      const total = items.length || 1;
      return { p1, p2, p3, total, p1Pct: Math.round((p1 / total) * 100), p2Pct: Math.round((p2 / total) * 100), p3Pct: Math.round((p3 / total) * 100) };
    },
    refetchInterval: 15000,
  });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Severity Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="border-2 border-border bg-card p-6"
      >
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-accent" />
          <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">Severity Breakdown</h3>
        </div>
        <div className="space-y-3">
          {[
            { label: "P1 Critical", count: severityBreakdown?.p1 ?? 0, pct: severityBreakdown?.p1Pct ?? 0, cls: "bg-accent" },
            { label: "P2 Warning", count: severityBreakdown?.p2 ?? 0, pct: severityBreakdown?.p2Pct ?? 0, cls: "bg-warning" },
            { label: "P3 Info", count: severityBreakdown?.p3 ?? 0, pct: severityBreakdown?.p3Pct ?? 0, cls: "bg-muted-foreground" },
          ].map(bar => (
            <div key={bar.label}>
              <div className="mb-1 flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{bar.label}</span>
                <span className="font-mono text-xs font-bold text-foreground">{bar.count}</span>
              </div>
              <div className="h-2 w-full border border-border bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${bar.pct}%` }}
                  transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
                  className={`h-full ${bar.cls}`}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent Activity Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="border-2 border-border bg-card p-6"
      >
        <div className="mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4 text-accent" />
          <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">Recent Activity</h3>
        </div>
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {[
            ...(recentActivity?.incidents.map(i => ({
              label: i.title,
              meta: `Incident · ${i.severity}`,
              time: i.created_at,
              icon: Zap,
              cls: i.severity === "P1" ? "text-accent" : "text-warning",
            })) ?? []),
            ...(recentActivity?.tickets.map(t => ({
              label: t.title,
              meta: `Ticket · ${t.priority}`,
              time: t.created_at,
              icon: TrendingUp,
              cls: "text-foreground",
            })) ?? []),
          ]
            .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
            .slice(0, 6)
            .map((item, i) => (
              <motion.div
                key={`${item.label}-${i}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.05 }}
                className="flex items-center gap-3 border-l-2 border-border py-1.5 pl-3 hover:border-accent transition-colors"
              >
                <item.icon className={`h-3.5 w-3.5 shrink-0 ${item.cls}`} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-mono text-[11px] text-foreground">{item.label}</p>
                  <p className="font-mono text-[9px] text-muted-foreground">
                    {item.meta} · {format(new Date(item.time), "MMM d, HH:mm")}
                  </p>
                </div>
              </motion.div>
            ))}
          {(!recentActivity?.incidents.length && !recentActivity?.tickets.length) && (
            <p className="py-4 text-center font-mono text-[11px] text-muted-foreground">No recent activity</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
