import { motion } from "framer-motion";
import { Globe } from "lucide-react";

const zones = [
  { zone: "US-East (Virginia)", timezone: "UTC-5", mttr: "12 min", cost: "$450/mo", incidents: 23, uptime: "99.97%", status: "healthy" },
  { zone: "US-West (Oregon)", timezone: "UTC-8", mttr: "14 min", cost: "$420/mo", incidents: 18, uptime: "99.98%", status: "healthy" },
  { zone: "EU-West (Ireland)", timezone: "UTC+0", mttr: "18 min", cost: "$380/mo", incidents: 31, uptime: "99.94%", status: "warning" },
  { zone: "EU-Central (Frankfurt)", timezone: "UTC+1", mttr: "15 min", cost: "$410/mo", incidents: 22, uptime: "99.96%", status: "healthy" },
  { zone: "Asia-Pacific (Tokyo)", timezone: "UTC+9", mttr: "22 min", cost: "$520/mo", incidents: 27, uptime: "99.93%", status: "warning" },
  { zone: "Asia-Pacific (Singapore)", timezone: "UTC+8", mttr: "19 min", cost: "$480/mo", incidents: 20, uptime: "99.95%", status: "healthy" },
  { zone: "South America (São Paulo)", timezone: "UTC-3", mttr: "25 min", cost: "$350/mo", incidents: 35, uptime: "99.91%", status: "warning" },
  { zone: "Middle East (Bahrain)", timezone: "UTC+3", mttr: "28 min", cost: "$390/mo", incidents: 15, uptime: "99.96%", status: "healthy" },
  { zone: "Africa (Cape Town)", timezone: "UTC+2", mttr: "32 min", cost: "$320/mo", incidents: 12, uptime: "99.92%", status: "healthy" },
  { zone: "Australia (Sydney)", timezone: "UTC+11", mttr: "20 min", cost: "$460/mo", incidents: 19, uptime: "99.95%", status: "healthy" },
];

export const ZonePricingTable = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.6, duration: 0.5 }}
    className="border-2 border-border bg-card"
  >
    <div className="flex items-center gap-2 border-b-2 border-border px-6 py-4">
      <Globe className="h-4 w-4 text-foreground" />
      <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">Country Zone Pricing & Response Time</h3>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b-2 border-border bg-secondary/30">
            <th className="px-6 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Zone</th>
            <th className="px-6 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Timezone</th>
            <th className="px-6 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">MTTR</th>
            <th className="px-6 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Cost</th>
            <th className="px-6 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Incidents</th>
            <th className="px-6 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Uptime</th>
            <th className="px-6 py-3 text-left font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {zones.map((zone, i) => (
            <motion.tr
              key={zone.zone}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 + i * 0.05 }}
              className="transition-all duration-150 hover:bg-accent/5 hover:translate-x-1 cursor-default"
            >
              <td className="whitespace-nowrap px-6 py-4 font-mono text-xs font-bold text-foreground">{zone.zone}</td>
              <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{zone.timezone}</td>
              <td className="px-6 py-4 font-mono text-xs text-foreground">{zone.mttr}</td>
              <td className="px-6 py-4 font-mono text-xs text-foreground">{zone.cost}</td>
              <td className="px-6 py-4 font-mono text-xs text-muted-foreground">{zone.incidents}</td>
              <td className="px-6 py-4 font-mono text-xs text-success">{zone.uptime}</td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center gap-1.5 border-2 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase ${
                  zone.status === "healthy"
                    ? "border-success bg-success/10 text-success"
                    : "border-warning bg-warning/10 text-warning"
                }`}>
                  <span className={`h-1.5 w-1.5 status-pulse ${zone.status === "healthy" ? "bg-success" : "bg-warning"}`} />
                  {zone.status === "healthy" ? "Healthy" : "Elevated"}
                </span>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  </motion.div>
);
