import { motion } from "framer-motion";
import { Plus, Clock, Search, Trash2, Download } from "lucide-react";
import { exportToCsv } from "@/lib/exportCsv";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const priorityColor: Record<string, string> = {
  P1: "border-destructive bg-destructive/10 text-destructive",
  P2: "border-warning bg-warning/10 text-warning",
  P3: "border-border bg-secondary text-muted-foreground",
};

const IncidentTickets = () => {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", priority: "P3", team: "", tags: "" });
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tickets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('tickets-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, () => {
        queryClient.invalidateQueries({ queryKey: ["tickets"] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  const createTicket = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("tickets").insert({
        title: form.title,
        priority: form.priority,
        team: form.team || null,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
        created_by: user?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      setOpen(false);
      setForm({ title: "", priority: "P3", team: "", tags: "" });
      toast({ title: "Ticket created" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("tickets").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tickets"] }),
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteTicket = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("tickets").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      toast({ title: "Ticket deleted" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const filtered = tickets.filter((t: any) => {
    const matchesSearch = t.title?.toLowerCase().includes(search.toLowerCase()) || t.team?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    const matchesPriority = priorityFilter === "ALL" || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const openCount = tickets.filter((t: any) => t.status !== "resolved").length;
  const resolvedCount = tickets.filter((t: any) => t.status === "resolved").length;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <div className="inline-block border-2 border-foreground bg-accent px-3 py-1 mb-3">
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-accent-foreground">Ticket System</span>
          </div>
          <h2 className="text-3xl font-bold uppercase tracking-tight text-foreground">Incident Tickets</h2>
          <p className="mt-1 font-mono text-xs text-muted-foreground">Track, assign, and manage incident tickets across teams.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportToCsv("tickets", filtered, ["ticket_id", "title", "priority", "status", "team", "tags", "created_at", "updated_at"])}>
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4" /> New Ticket</Button>
            </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Create Ticket</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Describe the issue" />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["P1", "P2", "P3"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Team</Label>
                <Input value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })} placeholder="e.g. Platform" />
              </div>
              <div className="space-y-2">
                <Label>Tags (comma-separated)</Label>
                <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="e.g. database, latency" />
              </div>
              <Button onClick={() => createTicket.mutate()} disabled={!form.title} className="w-full">Create Ticket</Button>
            </div>
          </DialogContent>
        </Dialog>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="border-2 border-border bg-card p-4 text-center brutal-hover-accent">
          <p className="stat-number text-2xl text-warning">{openCount}</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Open</p>
        </div>
        <div className="border-2 border-border bg-card p-4 text-center brutal-hover-accent">
          <p className="stat-number text-2xl text-success">{resolvedCount}</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Resolved</p>
        </div>
        <div className="border-2 border-border bg-card p-4 text-center brutal-hover-accent">
          <p className="stat-number text-2xl text-foreground">{tickets.length}</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Total</p>
        </div>
        <div className="border-2 border-border bg-card p-4 text-center brutal-hover-accent">
          <p className="stat-number text-2xl text-foreground">{filtered.length}</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Showing</p>
        </div>
      </motion.div>

      {/* Search & Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search tickets..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full border-2 border-border bg-card py-2 pl-10 pr-4 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none" />
        </div>
        <div className="flex gap-2">
          {["ALL", "investigating", "warning", "resolved"].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`border-2 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wider transition-all duration-150 ${statusFilter === s ? "border-foreground bg-primary text-primary-foreground shadow-brutal-sm" : "border-border bg-card text-muted-foreground hover:border-foreground hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-brutal-sm"}`}>
              {s === "ALL" ? "All Status" : s}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {["ALL", "P1", "P2", "P3"].map((p) => (
            <button key={p} onClick={() => setPriorityFilter(p)}
              className={`border-2 px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wider transition-all duration-150 ${priorityFilter === p ? "border-foreground bg-primary text-primary-foreground shadow-brutal-sm" : "border-border bg-card text-muted-foreground hover:border-foreground hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-brutal-sm"}`}>
              {p === "ALL" ? "All Priority" : p}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Ticket List */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="h-6 w-6 animate-spin border-2 border-foreground border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="border-2 border-border bg-card p-12 text-center font-mono text-xs text-muted-foreground">No tickets match your filters.</div>
        ) : filtered.map((ticket: any, i: number) => (
          <motion.div
            key={ticket.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.03 * Math.min(i, 10) }}
            className="group border-2 border-border bg-card p-5 brutal-hover"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-muted-foreground">{ticket.ticket_id || "—"}</span>
                  <span className={`border-2 px-1.5 py-0 font-mono text-[9px] font-bold uppercase ${priorityColor[ticket.priority]}`}>{ticket.priority}</span>
                </div>
                <h4 className="mt-1 font-mono text-xs font-bold text-foreground">{ticket.title}</h4>
                <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-[10px] text-muted-foreground">
                  {ticket.team && <span>{ticket.team}</span>}
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(ticket.created_at).toLocaleString()}</span>
                </div>
                {ticket.tags?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {ticket.tags.map((tag: string) => (
                      <span key={tag} className="border-2 border-border bg-secondary px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-muted-foreground">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {ticket.status !== "resolved" && (
                  <Select value={ticket.status} onValueChange={(v) => updateStatus.mutate({ id: ticket.id, status: v })}>
                    <SelectTrigger className="h-7 w-auto gap-1 border-0 bg-transparent p-0 text-xs">
                      <StatusBadge status={ticket.status as any} />
                    </SelectTrigger>
                    <SelectContent>
                      {["investigating", "warning", "critical", "resolved"].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {ticket.status === "resolved" && <StatusBadge status="resolved" />}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100 text-destructive hover:text-destructive"
                  onClick={() => deleteTicket.mutate(ticket.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

export default IncidentTickets;
