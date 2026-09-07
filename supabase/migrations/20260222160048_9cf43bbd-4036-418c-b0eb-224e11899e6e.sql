
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Incidents table
CREATE TABLE public.incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id TEXT UNIQUE,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'investigating' CHECK (status IN ('critical','investigating','warning','resolved')),
  severity TEXT NOT NULL DEFAULT 'P3' CHECK (severity IN ('P1','P2','P3')),
  team TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Logs table
CREATE TABLE public.logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  level TEXT NOT NULL DEFAULT 'INFO' CHECK (level IN ('ERROR','WARN','INFO','DEBUG')),
  source TEXT NOT NULL,
  message TEXT NOT NULL,
  trace_id TEXT,
  created_by UUID REFERENCES auth.users(id)
);

-- Tickets table
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id TEXT UNIQUE,
  title TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'P3' CHECK (priority IN ('P1','P2','P3')),
  status TEXT NOT NULL DEFAULT 'investigating' CHECK (status IN ('critical','investigating','warning','resolved')),
  assignee_id UUID REFERENCES auth.users(id),
  assignee_name TEXT,
  team TEXT,
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Status updates table
CREATE TABLE public.status_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'operational' CHECK (status IN ('operational','degraded','partial_outage','major_outage')),
  uptime TEXT DEFAULT '100%',
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_updates ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-generate incident_id
CREATE OR REPLACE FUNCTION public.generate_incident_id()
RETURNS TRIGGER AS $$
DECLARE next_num INT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(incident_id FROM 5) AS INT)), 999) + 1
  INTO next_num FROM public.incidents WHERE incident_id IS NOT NULL;
  NEW.incident_id = 'INC-' || next_num;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_incident_id
  BEFORE INSERT ON public.incidents
  FOR EACH ROW WHEN (NEW.incident_id IS NULL)
  EXECUTE FUNCTION public.generate_incident_id();

-- Auto-generate ticket_id
CREATE OR REPLACE FUNCTION public.generate_ticket_id()
RETURNS TRIGGER AS $$
DECLARE next_num INT;
BEGIN
  SELECT COALESCE(MAX(CAST(SUBSTRING(ticket_id FROM 5) AS INT)), 999) + 1
  INTO next_num FROM public.tickets WHERE ticket_id IS NULL OR ticket_id IS NOT NULL;
  NEW.ticket_id = 'TKT-' || next_num;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER set_ticket_id
  BEFORE INSERT ON public.tickets
  FOR EACH ROW WHEN (NEW.ticket_id IS NULL)
  EXECUTE FUNCTION public.generate_ticket_id();

-- Updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON public.incidents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON public.tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_status_updates_updated_at BEFORE UPDATE ON public.status_updates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies

-- Profiles: users see all, edit own
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- User roles: viewable by authenticated, managed by admins
CREATE POLICY "Users can view roles" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Incidents: viewable by all authenticated, create/update by authenticated
CREATE POLICY "View incidents" ON public.incidents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Create incidents" ON public.incidents FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Update own or admin" ON public.incidents FOR UPDATE TO authenticated USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Delete admin only" ON public.incidents FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Logs: viewable by all authenticated, create by authenticated
CREATE POLICY "View logs" ON public.logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Create logs" ON public.logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Delete logs admin" ON public.logs FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Tickets: viewable by all authenticated, create/update by authenticated
CREATE POLICY "View tickets" ON public.tickets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Create tickets" ON public.tickets FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Update tickets" ON public.tickets FOR UPDATE TO authenticated USING (auth.uid() = created_by OR auth.uid() = assignee_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Delete tickets admin" ON public.tickets FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Status updates: viewable by all authenticated, managed by admin/moderator
CREATE POLICY "View status" ON public.status_updates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Manage status" ON public.status_updates FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));
CREATE POLICY "Update status" ON public.status_updates FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.incidents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.status_updates;
