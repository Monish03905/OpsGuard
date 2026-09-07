import { motion } from "framer-motion";
import { Users, Search, Zap, Shield, ArrowRight } from "lucide-react";

const stages = [
  { icon: Users, title: "Assemble", desc: "Auto-page on-call responders via PagerDuty. Incident commander assigned.", color: "text-foreground", bg: "bg-secondary border-2 border-border" },
  { icon: Search, title: "Assess", desc: "AI-powered anomaly detection. Root cause analysis with Datadog traces.", color: "text-warning", bg: "bg-warning/5 border-2 border-warning/30" },
  { icon: Zap, title: "Execute", desc: "Auto-remediation scripts. Kubernetes self-healing pods. Terraform rollback.", color: "text-success", bg: "bg-success/5 border-2 border-success/30" },
  { icon: Shield, title: "Mitigate", desc: "Blameless postmortem. Runbook updates. SLA/SLO threshold adjustment.", color: "text-accent", bg: "bg-accent/5 border-2 border-accent/30" },
];

export const ResponseWorkflow = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.8, duration: 0.5 }}
    className="border-2 border-border bg-card p-6"
  >
    <h3 className="mb-6 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">
      4-Stage Incident Response Workflow
    </h3>
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      {stages.map((stage, i) => (
        <div key={stage.title} className="flex items-center gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9 + i * 0.15 }}
            whileHover={{ y: -4, x: -2 }}
            whileTap={{ y: 1, x: 1 }}
            className={`flex flex-1 flex-col items-center p-5 text-center cursor-default brutal-lift ${stage.bg}`}
          >
            <stage.icon className={`mb-3 h-8 w-8 ${stage.color}`} />
            <h4 className="font-display text-sm font-bold uppercase text-foreground">{stage.title}</h4>
            <p className="mt-2 font-mono text-[10px] leading-relaxed text-muted-foreground">{stage.desc}</p>
          </motion.div>
          {i < 3 && <ArrowRight className="hidden h-5 w-5 text-muted-foreground md:block" />}
        </div>
      ))}
    </div>
  </motion.div>
);
