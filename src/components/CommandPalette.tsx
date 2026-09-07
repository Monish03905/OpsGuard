import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  FileText,
  Bell,
  Monitor,
  Ticket,
  Activity,
  UserCog,
  Users,
  Target,
  BookOpen,
  ScrollText,
  Sun,
  Moon,
  Laptop,
} from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";

const pages = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Log Tracking", url: "/logs", icon: FileText },
  { title: "Alert System", url: "/alerts", icon: Bell },
  { title: "Monitoring", url: "/monitoring", icon: Monitor },
  { title: "Incident Tickets", url: "/tickets", icon: Ticket },
  { title: "Status Updates", url: "/status", icon: Activity },
  { title: "Team Management", url: "/teams", icon: Users },
  { title: "SLA & Uptime", url: "/sla", icon: Target },
  { title: "Runbooks", url: "/runbooks", icon: BookOpen },
  { title: "Audit Trail", url: "/audit", icon: ScrollText },
  { title: "Profile Settings", url: "/profile", icon: UserCog },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { setTheme } = useTheme();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const go = (url: string) => {
    setOpen(false);
    navigate(url);
  };

  const switchTheme = (t: string) => {
    setOpen(false);
    setTheme(t);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search…" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigate">
          {pages.map((p) => (
            <CommandItem key={p.url} onSelect={() => go(p.url)}>
              <p.icon className="mr-2 h-4 w-4" />
              <span>{p.title}</span>
            </CommandItem>
          ))}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Theme">
          <CommandItem onSelect={() => switchTheme("light")}>
            <Sun className="mr-2 h-4 w-4" />
            <span>Light Mode</span>
          </CommandItem>
          <CommandItem onSelect={() => switchTheme("dark")}>
            <Moon className="mr-2 h-4 w-4" />
            <span>Dark Mode</span>
          </CommandItem>
          <CommandItem onSelect={() => switchTheme("system")}>
            <Laptop className="mr-2 h-4 w-4" />
            <span>System Theme</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
