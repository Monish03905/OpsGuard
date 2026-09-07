import { motion } from "framer-motion";

const tools = [
  { name: "Prometheus", category: "Monitoring" },
  { name: "Grafana", category: "Visualization" },
  { name: "Alertmanager", category: "Alerting" },
  { name: "Datadog", category: "APM" },
  { name: "PagerDuty", category: "On-Call" },
  { name: "Terraform", category: "IaC" },
  { name: "Ansible", category: "Config Mgmt" },
  { name: "Kubernetes", category: "Orchestration" },
];

export const TechStack = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 1, duration: 0.5 }}
    className="border-2 border-border bg-card p-6"
  >
    <h3 className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">Technology Stack</h3>
    <div className="flex flex-wrap gap-3">
      {tools.map((tool, i) => (
        <motion.div
          key={tool.name}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.1 + i * 0.06 }}
          whileHover={{ y: -3, x: -2 }}
          whileTap={{ y: 1, x: 1 }}
          className="flex flex-col border-2 border-border bg-secondary/50 px-4 py-3 cursor-default brutal-lift"
        >
          <span className="font-display text-sm font-medium text-foreground">{tool.name}</span>
          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{tool.category}</span>
        </motion.div>
      ))}
    </div>
  </motion.div>
);
