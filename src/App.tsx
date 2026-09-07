import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import Index from "./pages/Index";
import LogTracking from "./pages/LogTracking";
import AlertSystem from "./pages/AlertSystem";
import MonitoringDashboard from "./pages/MonitoringDashboard";
import IncidentTickets from "./pages/IncidentTickets";
import StatusUpdates from "./pages/StatusUpdates";
import ProfileSettings from "./pages/ProfileSettings";
import TeamManagement from "./pages/TeamManagement";
import SlaTracking from "./pages/SlaTracking";
import Runbooks from "./pages/Runbooks";
import AuditTrail from "./pages/AuditTrail";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<Index />} />
                <Route path="/logs" element={<LogTracking />} />
                <Route path="/alerts" element={<AlertSystem />} />
                <Route path="/monitoring" element={<MonitoringDashboard />} />
                <Route path="/tickets" element={<IncidentTickets />} />
                <Route path="/status" element={<StatusUpdates />} />
                <Route path="/profile" element={<ProfileSettings />} />
                <Route path="/teams" element={<TeamManagement />} />
                <Route path="/sla" element={<SlaTracking />} />
                <Route path="/runbooks" element={<Runbooks />} />
                <Route path="/audit" element={<AuditTrail />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
