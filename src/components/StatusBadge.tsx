import { cn } from "@/lib/utils";

type StatusType = "healthy" | "warning" | "critical" | "resolved" | "investigating";

const statusConfig: Record<StatusType, { label: string; className: string }> = {
  healthy: { label: "HEALTHY", className: "bg-success text-success-foreground border-success" },
  warning: { label: "WARNING", className: "bg-warning text-warning-foreground border-warning" },
  critical: { label: "CRITICAL", className: "bg-destructive text-destructive-foreground border-destructive" },
  resolved: { label: "RESOLVED", className: "bg-success text-success-foreground border-success" },
  investigating: { label: "INVESTIGATING", className: "bg-warning text-warning-foreground border-warning" },
};

export const StatusBadge = ({ status }: { status: StatusType }) => {
  const config = statusConfig[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 border-2 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider", config.className)}>
      <span className={cn("h-1.5 w-1.5", {
        "bg-success-foreground status-pulse": status === "healthy" || status === "resolved",
        "bg-warning-foreground status-pulse": status === "warning" || status === "investigating",
        "bg-destructive-foreground status-pulse": status === "critical",
      })} />
      {config.label}
    </span>
  );
};
