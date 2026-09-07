import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Plus, Trash2, Search, ChevronDown, ChevronRight, ListChecks } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

type RunbookStep = { title: string; description: string };

const Runbooks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", severity_trigger: "P1", steps: [{ title: "", description: "" }] as RunbookStep[] });

  const { data: runbooks = [], isLoading } = useQuery({
    queryKey: ["runbooks"],
    queryFn: async () => {
      const { data, error } = await supabase.from("runbooks").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: teams = [] } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data, error } = await supabase.from("teams").select("id, name");
      if (error) throw error;
      return data;
    },
  });

  const createRunbook = useMutation({
    mutationFn: async () => {
      const validSteps = form.steps.filter((s) => s.title.trim());
      const { error } = await supabase.from("runbooks").insert({
        title: form.title,
        description: form.description,
        severity_trigger: form.severity_trigger,
        steps: validSteps as any,
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["runbooks"] });
      toast({ title: "Runbook created" });
      setForm({ title: "", description: "", severity_trigger: "P1", steps: [{ title: "", description: "" }] });
      setOpen(false);
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteRunbook = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("runbooks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["runbooks"] });
      toast({ title: "Runbook deleted" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const addStep = () => setForm({ ...form, steps: [...form.steps, { title: "", description: "" }] });
  const updateStep = (idx: number, field: keyof RunbookStep, value: string) => {
    const steps = [...form.steps];
    steps[idx] = { ...steps[idx], [field]: value };
    setForm({ ...form, steps });
  };
  const removeStep = (idx: number) => setForm({ ...form, steps: form.steps.filter((_, i) => i !== idx) });

  const filtered = runbooks.filter((r) => r.title.toLowerCase().includes(search.toLowerCase()));

  const getTeamName = (id: string | null) => teams.find((t) => t.id === id)?.name || "None";

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="inline-block border-2 border-foreground bg-accent px-3 py-1 mb-4">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-accent-foreground">Operations</span>
        </div>
        <h2 className="text-3xl font-bold uppercase tracking-tight text-foreground">
          Response <span className="bg-accent text-accent-foreground px-2">Runbooks</span>
        </h2>
      </motion.div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search runbooks..." className="pl-10 border-2 border-border bg-background font-mono text-xs" />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="border-2 border-foreground bg-foreground font-mono text-[10px] uppercase tracking-wider text-background hover:bg-foreground/90">
              <Plus className="mr-2 h-3.5 w-3.5" /> New Runbook
            </Button>
          </DialogTrigger>
          <DialogContent className="border-2 border-foreground bg-card max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-mono text-sm uppercase tracking-wider">Create Runbook</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="border-2 font-mono text-sm" placeholder="e.g. Database Failover Procedure" />
              </div>
              <div>
                <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="border-2 font-mono text-sm min-h-[60px]" placeholder="When to use this runbook..." />
              </div>
              <div>
                <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Severity Trigger</Label>
                <Select value={form.severity_trigger} onValueChange={(v) => setForm({ ...form, severity_trigger: v })}>
                  <SelectTrigger className="border-2 font-mono text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["P1", "P2", "P3", "P4"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Steps</Label>
                <div className="space-y-2 mt-1">
                  {form.steps.map((step, idx) => (
                    <div key={idx} className="border border-border p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-muted-foreground">Step {idx + 1}</span>
                        {form.steps.length > 1 && (
                          <Button variant="ghost" size="icon" className="h-5 w-5 hover:text-destructive" onClick={() => removeStep(idx)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <Input value={step.title} onChange={(e) => updateStep(idx, "title", e.target.value)} className="border font-mono text-xs" placeholder="Step title" />
                      <Input value={step.description} onChange={(e) => updateStep(idx, "description", e.target.value)} className="border font-mono text-xs" placeholder="Step details" />
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addStep} className="w-full border-2 font-mono text-[10px] uppercase">
                    <Plus className="mr-1 h-3 w-3" /> Add Step
                  </Button>
                </div>
              </div>
              <Button onClick={() => createRunbook.mutate()} disabled={!form.title || createRunbook.isPending} className="w-full border-2 border-foreground bg-foreground font-mono text-[10px] uppercase tracking-wider text-background">
                {createRunbook.isPending ? "Creating…" : "Create Runbook"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {filtered.map((rb, i) => {
          const steps = (Array.isArray(rb.steps) ? rb.steps : []) as RunbookStep[];
          const isExpanded = expanded === rb.id;
          return (
            <motion.div
              key={rb.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.03 * i }}
              className="border-2 border-border bg-card hover:border-foreground transition-colors"
            >
              <div className="flex items-center justify-between p-5 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : rb.id)}>
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  <div>
                    <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">{rb.title}</h3>
                    <div className="mt-1 flex items-center gap-3">
                      <span className="inline-block border border-accent px-2 py-0.5 font-mono text-[10px] uppercase text-accent">{rb.severity_trigger || "Any"}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{steps.length} steps</span>
                      {rb.auto_assign_team && <span className="font-mono text-[10px] text-muted-foreground">→ {getTeamName(rb.auto_assign_team)}</span>}
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive" onClick={(e) => { e.stopPropagation(); deleteRunbook.mutate(rb.id); }}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              {isExpanded && (
                <div className="border-t border-border px-5 pb-5 pt-3 space-y-2">
                  {rb.description && <p className="font-mono text-xs text-muted-foreground mb-3">{rb.description}</p>}
                  {steps.map((step, idx) => (
                    <div key={idx} className="flex gap-3 items-start">
                      <div className="flex h-6 w-6 shrink-0 items-center justify-center border-2 border-foreground font-mono text-[10px] font-bold">{idx + 1}</div>
                      <div>
                        <p className="font-mono text-xs font-bold text-foreground">{step.title}</p>
                        {step.description && <p className="font-mono text-[10px] text-muted-foreground">{step.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {!isLoading && filtered.length === 0 && (
        <div className="border-2 border-dashed border-border p-12 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 font-mono text-xs text-muted-foreground">No runbooks yet</p>
        </div>
      )}
    </div>
  );
};

export default Runbooks;
