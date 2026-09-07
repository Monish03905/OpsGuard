import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AnimatedOutlet } from "@/components/AnimatedOutlet";
import { CommandPalette } from "@/components/CommandPalette";
import { GlobalSearch } from "@/components/GlobalSearch";
import { QuickActions } from "@/components/QuickActions";
import { KeyboardShortcuts } from "@/components/KeyboardShortcuts";
import { useNavigationShortcuts } from "@/hooks/useNavigationShortcuts";

export function AppLayout() {
  useNavigationShortcuts();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="flex items-center gap-3 border-b-2 border-border bg-background px-4 py-3">
            <SidebarTrigger />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              SYS://OpsGuard
            </span>
            <div className="ml-auto flex items-center gap-2">
              <GlobalSearch />
              <KeyboardShortcuts />
            </div>
          </div>
          <div className="p-6">
            <AnimatedOutlet />
          </div>
          <CommandPalette />
          <QuickActions />
        </main>
      </div>
    </SidebarProvider>
  );
}
