import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Trash2, Search, UserPlus, Phone } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const TeamManagement = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", description: "" });

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const { data, error } = await supabase.from("teams").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: members = [] } = useQuery({
    queryKey: ["team_members"],
    queryFn: async () => {
      const { data, error } = await supabase.from("team_members").select("*");
      if (error) throw error;
      return data;
    },
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["all-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("user_id, display_name");
      if (error) throw error;
      return data;
    },
  });

  const createTeam = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("teams").insert({ name: form.name, description: form.description });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast({ title: "Team created" });
      setForm({ name: "", description: "" });
      setOpen(false);
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const deleteTeam = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("teams").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast({ title: "Team deleted" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const setOnCall = useMutation({
    mutationFn: async ({ teamId, userId }: { teamId: string; userId: string | null }) => {
      const { error } = await supabase
        .from("teams")
        .update({ on_call_user_id: userId })
        .eq("id", teamId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast({ title: "On-call updated" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const addMember = useMutation({
    mutationFn: async ({ teamId, userId }: { teamId: string; userId: string }) => {
      const { error } = await supabase.from("team_members").insert({ team_id: teamId, user_id: userId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team_members"] });
      toast({ title: "Member added" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const removeMember = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("team_members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team_members"] });
      toast({ title: "Member removed" });
    },
    onError: (e: Error) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const filtered = teams.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));

  const getMemberCount = (teamId: string) => members.filter((m) => m.team_id === teamId).length;
  const getTeamMembers = (teamId: string) => members.filter((m) => m.team_id === teamId);
  const getProfileName = (userId: string | null) => {
    if (!userId) return "Unassigned";
    return profiles.find((p) => p.user_id === userId)?.display_name || "Unknown";
  };

  // Users not yet in a given team
  const getAvailableUsers = (teamId: string) => {
    const teamMemberIds = new Set(getTeamMembers(teamId).map((m) => m.user_id));
    return profiles.filter((p) => !teamMemberIds.has(p.user_id));
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="inline-block border-2 border-foreground bg-accent px-3 py-1 mb-4">
          <span className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-accent-foreground">Operations</span>
        </div>
        <h2 className="text-3xl font-bold uppercase tracking-tight text-foreground">
          Team <span className="bg-accent text-accent-foreground px-2">Management</span>
        </h2>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search teams..." className="pl-10 border-2 border-border bg-background font-mono text-xs" />
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="border-2 border-foreground bg-foreground font-mono text-[10px] uppercase tracking-wider text-background hover:bg-foreground/90">
              <Plus className="mr-2 h-3.5 w-3.5" /> New Team
            </Button>
          </DialogTrigger>
          <DialogContent className="border-2 border-foreground bg-card">
            <DialogHeader>
              <DialogTitle className="font-mono text-sm uppercase tracking-wider">Create Team</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Team Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="border-2 font-mono text-sm" placeholder="e.g. Platform Engineering" />
              </div>
              <div>
                <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">Description</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="border-2 font-mono text-sm" placeholder="Team responsibilities..." />
              </div>
              <Button onClick={() => createTeam.mutate()} disabled={!form.name || createTeam.isPending} className="w-full border-2 border-foreground bg-foreground font-mono text-[10px] uppercase tracking-wider text-background">
                {createTeam.isPending ? "Creating…" : "Create Team"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((team, i) => {
          const teamMembers = getTeamMembers(team.id);
          const availableUsers = getAvailableUsers(team.id);

          return (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className="border-2 border-border bg-card p-5 space-y-4 hover:border-foreground transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-foreground">{team.name}</h3>
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground">{team.description || "No description"}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive" onClick={() => deleteTeam.mutate(team.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              {/* On-Call Assignment */}
              <div className="space-y-1.5">
                <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Phone className="h-3 w-3" /> On-Call
                </Label>
                <Select
                  value={team.on_call_user_id || "none"}
                  onValueChange={(v) => setOnCall.mutate({ teamId: team.id, userId: v === "none" ? null : v })}
                >
                  <SelectTrigger className="border-2 font-mono text-[10px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Unassigned</SelectItem>
                    {/* Show current team members + any profile for flexibility */}
                    {profiles.map((p) => (
                      <SelectItem key={p.user_id} value={p.user_id}>
                        {p.display_name || p.user_id.slice(0, 8)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Team Members */}
              <div className="space-y-1.5 border-t border-border pt-3">
                <div className="flex items-center justify-between">
                  <Label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <UserPlus className="h-3 w-3" /> Members ({teamMembers.length})
                  </Label>
                </div>

                {teamMembers.length > 0 && (
                  <div className="space-y-1">
                    {teamMembers.map((m) => (
                      <div key={m.id} className="flex items-center justify-between bg-secondary/50 px-2 py-1">
                        <span className="font-mono text-[10px] text-foreground">{getProfileName(m.user_id)}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5 hover:text-destructive"
                          onClick={() => removeMember.mutate(m.id)}
                        >
                          <Trash2 className="h-2.5 w-2.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {availableUsers.length > 0 && (
                  <Select onValueChange={(userId) => addMember.mutate({ teamId: team.id, userId })}>
                    <SelectTrigger className="border border-dashed border-border font-mono text-[10px] h-7 text-muted-foreground">
                      <SelectValue placeholder="Add member…" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableUsers.map((p) => (
                        <SelectItem key={p.user_id} value={p.user_id}>
                          {p.display_name || p.user_id.slice(0, 8)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {!isLoading && filtered.length === 0 && (
        <div className="border-2 border-dashed border-border p-12 text-center">
          <Users className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 font-mono text-xs text-muted-foreground">No teams found</p>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
