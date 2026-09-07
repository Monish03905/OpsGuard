import { Shield, LayoutDashboard, FileText, Bell, Monitor, Ticket, Activity, LogOut, Sun, Moon, Laptop, UserCog, BellDot, Users, Target, BookOpen, ScrollText } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router-dom";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Log Tracking", url: "/logs", icon: FileText },
  { title: "Alert System", url: "/alerts", icon: Bell },
  { title: "Monitoring", url: "/monitoring", icon: Monitor },
  { title: "Incident Tickets", url: "/tickets", icon: Ticket },
  { title: "Status Updates", url: "/status", icon: Activity },
];

const opsItems = [
  { title: "Team Management", url: "/teams", icon: Users },
  { title: "SLA & Uptime", url: "/sla", icon: Target },
  { title: "Runbooks", url: "/runbooks", icon: BookOpen },
  { title: "Audit Trail", url: "/audit", icon: ScrollText },
  { title: "Profile Settings", url: "/profile", icon: UserCog },
];

export function AppSidebar() {
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, avatar_url")
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const initials = (profile?.display_name ?? user?.email ?? "U")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Sidebar>
      <SidebarHeader className="border-b-2 border-foreground/10 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center border-2 border-foreground bg-accent">
              <Shield className="h-5 w-5 text-accent-foreground" />
            </div>
            <div>
              <h1 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">OpsGuard</h1>
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Incident Response</p>
            </div>
          </div>
          <NotificationDropdown />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="font-mono text-[10px] uppercase tracking-[0.15em]">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 border-l-2 border-transparent px-3 py-2 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-all hover:border-l-2 hover:border-accent hover:bg-accent/5 hover:text-foreground"
                      activeClassName="border-l-2 !border-accent bg-accent/10 text-foreground font-bold"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="font-mono text-[10px] uppercase tracking-[0.15em]">Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {opsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 border-l-2 border-transparent px-3 py-2 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-all hover:border-l-2 hover:border-accent hover:bg-accent/5 hover:text-foreground"
                      activeClassName="border-l-2 !border-accent bg-accent/10 text-foreground font-bold"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t-2 border-foreground/10 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="h-7 w-7 shrink-0 border-2 border-foreground">
              <AvatarImage src={profile?.avatar_url ?? undefined} alt="Avatar" />
              <AvatarFallback className="bg-muted font-mono text-[10px] font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-mono text-[10px] font-bold text-foreground">{profile?.display_name || user?.email}</p>
              {profile?.display_name && <p className="truncate font-mono text-[9px] text-muted-foreground">{user?.email}</p>}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 border border-border hover:border-foreground"
              onClick={() => setTheme(theme === "dark" ? "light" : theme === "light" ? "system" : "dark")}
              title={`Theme: ${theme}`}
            >
              {theme === "dark" ? <Moon className="h-4 w-4" /> : theme === "light" ? <Sun className="h-4 w-4" /> : <Laptop className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={signOut} className="h-8 w-8 border border-border hover:border-destructive hover:text-destructive">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
