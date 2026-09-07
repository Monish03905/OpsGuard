import { useState } from "react";
import { Bell, AlertTriangle, AlertCircle, Info, Check, Trash2, ExternalLink } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";

const typeConfig: Record<string, { icon: typeof AlertTriangle; cls: string }> = {
  error: { icon: AlertCircle, cls: "text-destructive" },
  warning: { icon: AlertTriangle, cls: "text-warning" },
  info: { icon: Info, cls: "text-muted-foreground" },
};

export function NotificationDropdown() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
    refetchInterval: 15000,
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user!.id)
        .eq("is_read", false);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const deleteNotification = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const handleClick = (n: (typeof notifications)[0]) => {
    if (!n.is_read) markRead.mutate(n.id);
    if (n.link) {
      setOpen(false);
      navigate(n.link);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 border border-border hover:border-foreground"
          title="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 font-mono text-[9px] font-bold text-destructive-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 border-2 border-foreground bg-card p-0" align="end" sideOffset={8}>
        <div className="flex items-center justify-between border-b-2 border-border px-4 py-3">
          <h3 className="font-mono text-[10px] font-bold uppercase tracking-wider text-foreground">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 font-mono text-[9px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
              onClick={() => markAllRead.mutate()}
            >
              <Check className="mr-1 h-3 w-3" /> Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="mx-auto h-6 w-6 text-muted-foreground" />
              <p className="mt-2 font-mono text-[10px] text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((n) => {
                const config = typeConfig[n.type] || typeConfig.info;
                const Icon = config.icon;
                return (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-accent/5 ${
                      !n.is_read ? "bg-accent/10" : ""
                    }`}
                    onClick={() => handleClick(n)}
                  >
                    <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${config.cls}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-mono text-[10px] font-bold text-foreground">{n.title}</p>
                        {!n.is_read && <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />}
                      </div>
                      <p className="mt-0.5 font-mono text-[10px] text-muted-foreground line-clamp-2">{n.message}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="font-mono text-[9px] text-muted-foreground">
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                        </span>
                        {n.link && <ExternalLink className="h-2.5 w-2.5 text-muted-foreground" />}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification.mutate(n.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
