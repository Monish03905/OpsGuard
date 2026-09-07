import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, Phone, UserCheck } from "lucide-react";

export function TeamOnCallWidget() {
  const { data } = useQuery({
    queryKey: ["dashboard-team-oncall"],
    queryFn: async () => {
      const [teamsRes, membersRes, profilesRes] = await Promise.all([
        supabase.from("teams").select("*").order("name"),
        supabase.from("team_members").select("*"),
        supabase.from("profiles").select("user_id, display_name, avatar_url"),
      ]);
      const teams = teamsRes.data ?? [];
      const members = membersRes.data ?? [];
      const profiles = profilesRes.data ?? [];

      return teams.map((t) => {
        const memberCount = members.filter((m) => m.team_id === t.id).length;
        const onCallProfile = t.on_call_user_id
          ? profiles.find((p) => p.user_id === t.on_call_user_id)
          : null;
        return { ...t, memberCount, onCallName: onCallProfile?.display_name ?? null };
      });
    },
    refetchInterval: 15000,
  });

  const teams = data ?? [];
  const totalOnCall = teams.filter((t) => t.on_call_user_id).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="border-2 border-border bg-card p-6"
    >
      <div className="mb-4 flex items-center gap-2">
        <Phone className="h-4 w-4 text-accent" />
        <h3 className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-foreground">
          Team On-Call Status
        </h3>
      </div>

      {/* Summary */}
      <div className="mb-4 flex gap-3">
        <div>
          <p className="font-mono text-[10px] text-muted-foreground">Teams</p>
          <p className="stat-number text-2xl text-foreground">{teams.length}</p>
        </div>
        <div className="border-l-2 border-border pl-3">
          <p className="font-mono text-[10px] text-muted-foreground">On-Call Active</p>
          <p className="stat-number text-2xl text-foreground">{totalOnCall}</p>
        </div>
      </div>

      {/* Team list */}
      <div className="space-y-2 max-h-[180px] overflow-y-auto">
        {teams.map((team) => (
          <div key={team.id} className="flex items-center gap-3 border-l-2 border-border py-1.5 pl-3 hover:border-accent transition-colors">
            <div className="border-2 border-foreground/20 bg-secondary p-1.5">
              <Users className="h-3 w-3 text-foreground" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-[11px] font-bold text-foreground">{team.name}</p>
              <p className="font-mono text-[9px] text-muted-foreground">
                {team.memberCount} member{team.memberCount !== 1 ? "s" : ""}
              </p>
            </div>
            {team.onCallName ? (
              <span className="flex items-center gap-1 border-2 border-success bg-success/10 px-2 py-0.5 font-mono text-[9px] font-bold text-success">
                <UserCheck className="h-3 w-3" />
                {team.onCallName}
              </span>
            ) : (
              <span className="border-2 border-border px-2 py-0.5 font-mono text-[9px] font-bold text-muted-foreground">
                No on-call
              </span>
            )}
          </div>
        ))}
        {teams.length === 0 && (
          <p className="py-4 text-center font-mono text-[11px] text-muted-foreground">No teams configured</p>
        )}
      </div>
    </motion.div>
  );
}
