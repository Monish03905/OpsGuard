import { motion } from "framer-motion";
import { Cpu, HardDrive, Wifi, Server, Activity, RefreshCw } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MetricCard } from "@/components/MetricCard";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts";

const generateTimeSeries = (seed: number) => {
  const hours = ["00:00", "04:00", "08:00", "12:00", "14:00", "16:00", "18:00", "20:00", "23:00"];
  return hours.map((time, i) => ({
    time,
    value: Math.min(100, Math.max(10, 40 + Math.sin(i + seed) * 30 + Math.random() * 15)),
  }));
};

const generateMemSeries = (seed: number) => {
  const hours = ["00:00", "04:00", "08:00", "12:00", "14:00", "16:00", "18:00", "20:00", "23:00"];
  return hours.map((time, i) => ({
    time,
    used: Math.min(95, Math.max(40, 60 + Math.sin(i + seed) * 20 + Math.random() * 10)),
    cached: Math.max(3, 15 - Math.random() * 10),
  }));
};

const MonitoringDashboard = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const [cpuData, setCpuData] = useState(() => generateTimeSeries(0));
  const [memoryData, setMemoryData] = useState(() => generateMemSeries(0));

  const { data: statusData } = useQuery({
    queryKey: ["monitor-status"],
    queryFn: async () => {
      const { data, error } = await supabase.from("status_updates").select("id, status, system_name");
      if (error) throw error;
      const total = data.length;
      const healthy = data.filter((s) => s.status === "operational").length;
      const degraded = total - healthy;
      return { total, healthy, degraded, systems: data };
    },
    refetchInterval: 15000,
  });

  const { data: logData } = useQuery({
    queryKey: ["monitor-logs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("logs").select("id, level, source");
      if (error) throw error;
      const total = data.length;
      const errors = data.filter((l) => l.level === "ERROR").length;
      const warns = data.filter((l) => l.level === "WARN").length;
      const sourceCounts: Record<string, number> = {};
      data.forEach((l) => { sourceCounts[l.source] = (sourceCounts[l.source] || 0) + 1; });
      const bySource = Object.entries(sourceCounts).slice(0, 8).map(([source, count]) => ({ source, count }));
      return { total, errors, warns, bySource };
    },
    refetchInterval: 15000,
  });

  const { data: incidentData } = useQuery({
    queryKey: ["monitor-incidents"],
    queryFn: async () => {
      const { data, error } = await supabase.from("incidents").select("id, status");
      if (error) throw error;
      return { total: data.length, active: data.filter((i) => i.status !== "resolved").length };
    },
    refetchInterval: 15000,
  });

  const handleRefresh = useCallback(() => {
    setRefreshKey((k) => k + 1);
    setCpuData(generateTimeSeries(Date.now()));
    setMemoryData(generateMemSeries(Date.now()));
  }, []);

  useEffect(() => {
    const interval = setInterval(handleRefresh, 30000);
    return () => clearInterval(interval);
  }, [handleRefresh]);

  const chartTooltipStyle = {
    background: "hsl(var(--card))",
    border: "2px solid hsl(var(--border))",
    fontSize: 11,
    fontFamily: "'Space Mono', monospace",
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <div className="inline-block border-2 border-foreground bg-accent px-3 py-1 mb-3">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-accent-foreground">Infrastructure</span>
          </div>
          <h2 className="text-3xl font-bold uppercase tracking-tight text-foreground">Monitoring Dashboard</h2>
          <p className="mt-1 font-mono text-xs text-muted-foreground">Real-time infrastructure and service health monitoring.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Refresh
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Active Services"
          value={String(statusData?.total ?? 0)}
          subtitle={`${statusData?.degraded ?? 0} degraded`}
          icon={Server}
          trend={statusData?.degraded ? { value: `${statusData.degraded} need attention`, positive: false } : { value: "All healthy", positive: true }}
          delay={0.1}
        />
        <MetricCard title="Total Logs" value={String(logData?.total ?? 0)} subtitle={`${logData?.errors ?? 0} errors · ${logData?.warns ?? 0} warnings`} icon={HardDrive} delay={0.15} />
        <MetricCard title="Active Incidents" value={String(incidentData?.active ?? 0)} subtitle={`${incidentData?.total ?? 0} total`} icon={Activity} delay={0.2} />
        <MetricCard
          title="System Health"
          value={statusData?.total ? `${Math.round((statusData.healthy / statusData.total) * 100)}%` : "—"}
          subtitle={`${statusData?.healthy ?? 0}/${statusData?.total ?? 0} operational`}
          icon={Cpu}
          delay={0.25}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div key={`cpu-${refreshKey}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="border-2 border-border bg-card p-6 brutal-hover">
          <h3 className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">CPU Usage (24h)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={cpuData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontFamily: "'Space Mono', monospace" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontFamily: "'Space Mono', monospace" }} domain={[0, 100]} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Line type="monotone" dataKey="value" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} animationDuration={800} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div key={`mem-${refreshKey}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="border-2 border-border bg-card p-6 brutal-hover">
          <h3 className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">Memory Usage (24h)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={memoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="time" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontFamily: "'Space Mono', monospace" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontFamily: "'Space Mono', monospace" }} domain={[0, 100]} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Area type="monotone" dataKey="used" stackId="1" stroke="hsl(var(--warning))" fill="hsl(var(--warning) / 0.2)" animationDuration={800} />
              <Area type="monotone" dataKey="cached" stackId="1" stroke="hsl(var(--success))" fill="hsl(var(--success) / 0.2)" animationDuration={800} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Logs by Source Bar Chart */}
      {logData?.bySource && logData.bySource.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="border-2 border-border bg-card p-6 brutal-hover">
          <h3 className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">Logs by Source</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={logData.bySource}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="source" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))", fontFamily: "'Space Mono', monospace" }} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))", fontFamily: "'Space Mono', monospace" }} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="count" fill="hsl(var(--foreground))" radius={[0, 0, 0, 0]} animationDuration={800} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Service Health */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="border-2 border-border bg-card overflow-hidden">
        <div className="border-b-2 border-border px-6 py-4">
          <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">Service Health</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-border bg-secondary/30">
                <th className="px-6 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Service</th>
                <th className="px-6 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {(!statusData?.systems || statusData.systems.length === 0) ? (
                <tr><td colSpan={2} className="px-6 py-8 text-center font-mono text-xs text-muted-foreground">No systems tracked yet. Add systems in Status Updates.</td></tr>
              ) : statusData.systems.map((svc) => {
                const isHealthy = svc.status === "operational";
                return (
                  <tr key={svc.id} className="transition-all duration-150 hover:bg-accent/5 hover:translate-x-1 cursor-default">
                    <td className="px-6 py-3 font-mono text-xs font-bold text-foreground">{svc.system_name}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex items-center gap-1.5 border-2 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase ${isHealthy ? "border-success bg-success/10 text-success" : "border-warning bg-warning/10 text-warning"}`}>
                        <span className={`h-1.5 w-1.5 ${isHealthy ? "bg-success" : "bg-warning"} status-pulse`} />
                        {svc.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default MonitoringDashboard;
