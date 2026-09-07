import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
  "hsl(var(--accent))",
  "hsl(var(--primary))",
  "hsl(142 76% 36%)",
  "hsl(38 92% 50%)",
  "hsl(0 84% 60%)",
];

export const SlaUptimeChart = () => {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ["sla-uptime-chart"],
    queryFn: async () => {
      const { data: targets } = await supabase
        .from("sla_targets")
        .select("id, service_name, target_uptime");

      const { data: history } = await supabase
        .from("sla_history" as any)
        .select("sla_target_id, uptime, recorded_at")
        .order("recorded_at", { ascending: true });

      if (!targets?.length || !history?.length) return { points: [], services: [] };

      const serviceMap = new Map(targets.map((t) => [t.id, t]));
      const dateMap = new Map<string, Record<string, number>>();

      (history as any[]).forEach((h: any) => {
        const day = format(new Date(h.recorded_at), "MMM d");
        if (!dateMap.has(day)) dateMap.set(day, {});
        const svc = serviceMap.get(h.sla_target_id);
        if (svc) dateMap.get(day)![svc.service_name] = Number(h.uptime);
      });

      const services = targets.map((t) => t.service_name);
      const points = Array.from(dateMap.entries()).map(([date, vals]) => ({
        date,
        ...vals,
      }));

      return { points, services, targets };
    },
    refetchInterval: 30000,
  });

  const services = chartData?.services ?? [];
  const points = chartData?.points ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="border-2 border-border bg-card p-6"
    >
      <div className="mb-4 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-accent" />
        <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
          SLA Uptime Trends
        </h3>
      </div>

      {isLoading || points.length === 0 ? (
        <div className="flex h-[220px] items-center justify-center">
          <p className="font-mono text-[10px] text-muted-foreground">
            {isLoading ? "Loading…" : "No history data yet"}
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={points} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fontFamily: "monospace", fill: "hsl(var(--muted-foreground))" }}
              stroke="hsl(var(--border))"
            />
            <YAxis
              domain={[99, 100.1]}
              tick={{ fontSize: 10, fontFamily: "monospace", fill: "hsl(var(--muted-foreground))" }}
              stroke="hsl(var(--border))"
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "2px solid hsl(var(--border))",
                fontFamily: "monospace",
                fontSize: 11,
              }}
              formatter={(value: number) => [`${value.toFixed(2)}%`]}
            />
            <Legend
              wrapperStyle={{ fontFamily: "monospace", fontSize: 10 }}
            />
            {services.map((svc, i) => (
              <Line
                key={svc}
                type="monotone"
                dataKey={svc}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </motion.div>
  );
};
