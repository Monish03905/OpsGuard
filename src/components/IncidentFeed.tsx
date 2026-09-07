import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Clock, XCircle } from "lucide-react";
import { StatusBadge } from "./StatusBadge";

const incidents = [
  { id: "INC-2847", title: "Database latency spike in US-East", status: "critical" as const, time: "2 min ago", team: "Platform", severity: "P1" },
  { id: "INC-2846", title: "Memory threshold exceeded on worker-03", status: "investigating" as const, time: "14 min ago", team: "Infra", severity: "P2" },
  { id: "INC-2845", title: "CDN cache miss rate elevated in EU-West", status: "warning" as const, time: "32 min ago", team: "Network", severity: "P3" },
  { id: "INC-2844", title: "Auth service timeout resolved", status: "resolved" as const, time: "1h ago", team: "Backend", severity: "P1" },
  { id: "INC-2843", title: "Disk I/O saturation on db-replica-02", status: "resolved" as const, time: "2h ago", team: "Database", severity: "P2" },
];

const severityIcon = {
  P1: <XCircle className="h-4 w-4 text-destructive" />,
  P2: <AlertTriangle className="h-4 w-4 text-warning" />,
  P3: <Clock className="h-4 w-4 text-primary" />,
};

export const IncidentFeed = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.4, duration: 0.5 }}
    className="rounded-lg border border-border bg-card"
  >
    <div className="flex items-center justify-between border-b border-border px-6 py-4">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">Live Incident Feed</h3>
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-display">
        <span className="h-2 w-2 rounded-full bg-success status-pulse" />
        Real-time
      </span>
    </div>
    <div className="divide-y divide-border">
      {incidents.map((inc, i) => (
        <motion.div
          key={inc.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 + i * 0.1 }}
          className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-secondary/50"
        >
          {severityIcon[inc.severity as keyof typeof severityIcon]}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-display text-xs text-primary">{inc.id}</span>
              <span className="truncate text-sm text-foreground">{inc.title}</span>
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
              <span>{inc.team}</span>
              <span>•</span>
              <span>{inc.time}</span>
            </div>
          </div>
          <StatusBadge status={inc.status} />
        </motion.div>
      ))}
    </div>
  </motion.div>
);
