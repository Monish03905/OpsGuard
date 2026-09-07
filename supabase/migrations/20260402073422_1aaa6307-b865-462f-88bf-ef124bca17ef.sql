
-- Create notifications table for in-app notifications
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications"
ON public.notifications FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users update own notifications"
ON public.notifications FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (true);

CREATE POLICY "Users delete own notifications"
ON public.notifications FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX idx_notifications_user_unread ON public.notifications (user_id, is_read) WHERE is_read = false;

-- Trigger function: when sla_targets status changes to breached or at_risk, notify all authenticated users
CREATE OR REPLACE FUNCTION public.notify_sla_breach()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status AND NEW.status IN ('breached', 'at_risk')) THEN
    INSERT INTO public.notifications (user_id, title, message, type, link)
    SELECT ur.user_id,
      CASE WHEN NEW.status = 'breached' THEN 'SLA Breached' ELSE 'SLA At Risk' END,
      NEW.service_name || ' uptime dropped to ' || NEW.current_uptime || '% (target: ' || NEW.target_uptime || '%)',
      CASE WHEN NEW.status = 'breached' THEN 'error' ELSE 'warning' END,
      '/sla'
    FROM public.user_roles ur;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_sla_breach_notification
AFTER UPDATE ON public.sla_targets
FOR EACH ROW
EXECUTE FUNCTION public.notify_sla_breach();
