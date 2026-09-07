import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Plus, AlertTriangle, Ticket, FileText, Server, X } from "lucide-react";

const actions = [
  { icon: AlertTriangle, label: "New Incident", url: "/alerts", color: "bg-accent text-accent-foreground" },
  { icon: Ticket, label: "New Ticket", url: "/tickets", color: "bg-warning text-warning-foreground" },
  { icon: FileText, label: "Add Log", url: "/logs", color: "bg-foreground text-background" },
  { icon: Server, label: "Status Update", url: "/status", color: "bg-success text-success-foreground" },
];

export function QuickActions() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const go = (url: string) => {
    setOpen(false);
    navigate(url);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end gap-2">
      <motion.button
        onClick={() => setOpen(!open)}
        className="flex h-12 w-12 items-center justify-center border-2 border-foreground bg-accent text-accent-foreground brutal-shadow"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X className="h-5 w-5" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <Zap className="h-5 w-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && actions.map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            transition={{ delay: i * 0.05, duration: 0.2 }}
            onClick={() => go(action.url)}
            className={`flex items-center gap-2 border-2 border-foreground px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wider brutal-shadow-sm ${action.color}`}
          >
            <action.icon className="h-4 w-4" />
            {action.label}
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
}
