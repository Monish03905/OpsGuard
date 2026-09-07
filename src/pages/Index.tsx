import { motion } from "framer-motion";
import { Clock, AlertTriangle, TrendingDown, Server, DollarSign, Cpu, Activity, Shield } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MetricCard } from "@/components/MetricCard";
import { IncidentFeedLive } from "@/pages/AlertSystem";
import { ZonePricingTable } from "@/components/ZonePricingTable";
import { ResponseWorkflow } from "@/components/ResponseWorkflow";
import { TechStack } from "@/components/TechStack";
import { DashboardActivity } from "@/components/DashboardActivity";
import { SlaComplianceWidget } from "@/components/SlaComplianceWidget";
import { TeamOnCallWidget } from "@/components/TeamOnCallWidget";
import { SlaUptimeChart } from "@/components/SlaUptimeChart";

const Index = () => {
  const { data: incidentStats } = useQuery({
    queryKey: ["dashboard-incident-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("incidents").select("id, severity, status");
      if (error) throw error;
      const total = data.length;
      const active = data.filter((i) => i.status !== "resolved").length;
      const p1 = data.filter((i) => i.severity === "P1" && i.status !== "resolved").length;
      const resolved = total - active;
      return { total, active, p1, resolved };
    },
    refetchInterval: 15000,
  });

  const { data: ticketStats } = useQuery({
    queryKey: ["dashboard-ticket-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tickets").select("id, status, priority");
      if (error) throw error;
      const total = data.length;
      const open = data.filter((t) => t.status !== "resolved").length;
      const resolved = total - open;
      return { total, open, resolved };
    },
    refetchInterval: 15000,
  });

  const { data: statusStats } = useQuery({
    queryKey: ["dashboard-status-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("status_updates").select("id, status");
      if (error) throw error;
      const total = data.length;
      const operational = data.filter((s) => s.status === "operational").length;
      const degraded = total - operational;
      const uptime = total > 0 ? ((operational / total) * 100).toFixed(2) : "100.00";
      return { total, operational, degraded, uptime };
    },
    refetchInterval: 15000,
  });

  const { data: logStats } = useQuery({
    queryKey: ["dashboard-log-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("logs").select("id, level");
      if (error) throw error;
      const total = data.length;
      const errors = data.filter((l) => l.level === "ERROR").length;
      const warnings = data.filter((l) => l.level === "WARN").length;
      return { total, errors, warnings };
    },
    refetchInterval: 15000,
  });

  const activeIncidents = incidentStats?.active ?? 0;
  const p1Count = incidentStats?.p1 ?? 0;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="inline-block border-2 border-foreground bg-accent px-3 py-1 mb-4">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-accent-foreground">
            Operations Control
          </span>
        </div>
        <h2 className="text-3xl font-bold uppercase tracking-tight text-foreground md:text-4xl">
          DevOps Monitoring &{" "}
          <span className="bg-accent text-accent-foreground px-2">Incident Response</span>
        </h2>
        <p className="mt-3 max-w-2xl font-mono text-xs leading-relaxed text-muted-foreground">
          Unified reliability platform combining Prometheus, Grafana, and AI-powered anomaly detection
          to minimize downtime and accelerate resolution across all global zones.
        </p>
      </motion.div>

      {/* Key Metrics */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Active Incidents"
          value={String(activeIncidents)}
          subtitle={`${p1Count} Critical · ${activeIncidents - p1Count} Other`}
          icon={AlertTriangle}
          trend={activeIncidents === 0 ? { value: "All clear", positive: true } : { value: `${p1Count} P1 active`, positive: false }}
          delay={0.1}
        />
        <MetricCard
          title="Open Tickets"
          value={String(ticketStats?.open ?? 0)}
          subtitle={`${ticketStats?.resolved ?? 0} resolved of ${ticketStats?.total ?? 0}`}
          icon={Clock}
          delay={0.15}
        />
        <MetricCard
          title="System Uptime"
          value={`${statusStats?.uptime ?? "100.00"}%`}
          subtitle={`${statusStats?.operational ?? 0}/${statusStats?.total ?? 0} systems operational`}
          icon={Server}
          trend={statusStats?.degraded ? { value: `${statusStats.degraded} degraded`, positive: false } : { value: "All healthy", positive: true }}
          delay={0.2}
        />
        <MetricCard
          title="Log Errors"
          value={String(logStats?.errors ?? 0)}
          subtitle={`${logStats?.warnings ?? 0} warnings · ${logStats?.total ?? 0} total`}
          icon={Activity}
          trend={logStats?.errors === 0 ? { value: "No errors", positive: true } : { value: `${logStats?.errors} need attention`, positive: false }}
          delay={0.25}
        />
      </div>

      {/* Incident Feed + Mini Stats */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <IncidentFeedLive />
        </div>
        <div className="flex flex-col gap-4">
          <MetricCard
            title="Resolved Incidents"
            value={String(incidentStats?.resolved ?? 0)}
            subtitle="Successfully closed"
            icon={Shield}
            delay={0.3}
          />
          <MetricCard
            title="Total Logs"
            value={String(logStats?.total ?? 0)}
            subtitle={`${logStats?.errors ?? 0} errors · ${logStats?.warnings ?? 0} warnings`}
            icon={TrendingDown}
            delay={0.35}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex-1 border-2 border-border bg-card p-6"
          >
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Platform Summary</p>
            <p className="stat-number mt-2 text-3xl text-foreground">{(incidentStats?.total ?? 0) + (ticketStats?.total ?? 0)}</p>
            <p className="mt-1 font-mono text-[11px] text-muted-foreground">Total incidents & tickets tracked</p>
            <div className="mt-3 flex gap-2">
              <span className="border border-foreground/20 bg-secondary px-2 py-0.5 font-mono text-[10px] font-bold text-foreground">
                {statusStats?.total ?? 0} Systems
              </span>
              <span className="border border-success bg-success/10 px-2 py-0.5 font-mono text-[10px] font-bold text-success">
                {statusStats?.operational ?? 0} Healthy
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Activity & Severity Widgets */}
      <div className="mb-8">
        <DashboardActivity />
      </div>

      {/* SLA Uptime Trends */}
      <div className="mb-8">
        <SlaUptimeChart />
      </div>

      {/* SLA Compliance & Team On-Call */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SlaComplianceWidget />
        <TeamOnCallWidget />
      </div>

      {/* Response Workflow */}
      <div className="mb-8">
        <ResponseWorkflow />
      </div>

      {/* Zone Pricing Table */}
      <div className="mb-8">
        <ZonePricingTable />
      </div>

      {/* Tech Stack */}
      <div className="mb-8">
        <TechStack />
      </div>

      {/* Footer */}
      <footer className="border-t-2 border-border py-6 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          OpsGuard — DevOps Monitoring & Incident Response System · Capstone Project 2025
        </p>
      </footer>
    </div>
  );
};

export default Index;
