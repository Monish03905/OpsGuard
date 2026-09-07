import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: string; positive: boolean };
  glowClass?: string;
  delay?: number;
}

export const MetricCard = ({ title, value, subtitle, icon: Icon, trend, delay = 0 }: MetricCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.3 }}
    className="border-2 border-border bg-card p-5 brutal-hover-accent brutal-shadow-sm cursor-default"
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">{title}</p>
        <p className="stat-number mt-2 text-3xl text-foreground">{value}</p>
        {subtitle && <p className="mt-1 font-mono text-[11px] text-muted-foreground">{subtitle}</p>}
        {trend && (
          <p className={cn("mt-2 font-mono text-xs font-bold", trend.positive ? "text-success" : "text-destructive")}>
            {trend.positive ? "▼" : "▲"} {trend.value}
          </p>
        )}
      </div>
      <div className="border-2 border-foreground/20 bg-secondary p-3">
        <Icon className="h-5 w-5 text-foreground" />
      </div>
    </div>
  </motion.div>
);
