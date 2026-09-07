
-- Teams table
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  on_call_user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View teams" ON public.teams FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage teams" ON public.teams FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));
CREATE POLICY "Update teams" ON public.teams FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));
CREATE POLICY "Delete teams" ON public.teams FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Team members table
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View team members" ON public.team_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage team members" ON public.team_members FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));
CREATE POLICY "Update team members" ON public.team_members FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));
CREATE POLICY "Delete team members" ON public.team_members FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));

-- SLA targets table
CREATE TABLE public.sla_targets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name TEXT NOT NULL,
  target_uptime NUMERIC(5,2) NOT NULL DEFAULT 99.9,
  response_time_target_ms INTEGER NOT NULL DEFAULT 500,
  current_uptime NUMERIC(5,2) NOT NULL DEFAULT 100.00,
  status TEXT NOT NULL DEFAULT 'met',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.sla_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View SLA targets" ON public.sla_targets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Create SLA targets" ON public.sla_targets FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'));
CREATE POLICY "Update SLA targets" ON public.sla_targets FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Delete SLA targets" ON public.sla_targets FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_sla_targets_updated_at BEFORE UPDATE ON public.sla_targets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Runbooks table
CREATE TABLE public.runbooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  severity_trigger TEXT,
  auto_assign_team UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.runbooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View runbooks" ON public.runbooks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Create runbooks" ON public.runbooks FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));
CREATE POLICY "Update runbooks" ON public.runbooks FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator'));
CREATE POLICY "Delete runbooks" ON public.runbooks FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_runbooks_updated_at BEFORE UPDATE ON public.runbooks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Audit logs table
CREATE TABLE public.audit_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  user_id UUID,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins view all audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (has_role(auth.uid(), 'admin'));
CREATE POLICY "Users view own audit logs" ON public.audit_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "System can insert audit logs" ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Audit trigger function
CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (action, entity_type, entity_id, user_id, details)
    VALUES ('created', TG_TABLE_NAME, NEW.id::text, COALESCE(NEW.created_by, auth.uid()), jsonb_build_object('title', COALESCE(NEW.title, NEW.system_name, '')));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (action, entity_type, entity_id, user_id, details)
    VALUES ('updated', TG_TABLE_NAME, NEW.id::text, auth.uid(), jsonb_build_object('title', COALESCE(NEW.title, NEW.system_name, '')));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (action, entity_type, entity_id, user_id, details)
    VALUES ('deleted', TG_TABLE_NAME, OLD.id::text, auth.uid(), jsonb_build_object('title', COALESCE(OLD.title, OLD.system_name, '')));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Attach audit triggers
CREATE TRIGGER audit_incidents AFTER INSERT OR UPDATE OR DELETE ON public.incidents FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
CREATE TRIGGER audit_tickets AFTER INSERT OR UPDATE OR DELETE ON public.tickets FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
CREATE TRIGGER audit_status_updates AFTER INSERT OR UPDATE OR DELETE ON public.status_updates FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
