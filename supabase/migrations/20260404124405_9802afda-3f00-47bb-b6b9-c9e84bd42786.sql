
CREATE TABLE public.sla_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sla_target_id uuid NOT NULL REFERENCES public.sla_targets(id) ON DELETE CASCADE,
  uptime numeric NOT NULL,
  recorded_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.sla_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View SLA history" ON public.sla_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "Insert SLA history" ON public.sla_history FOR INSERT TO authenticated WITH CHECK (true);

CREATE INDEX idx_sla_history_target ON public.sla_history (sla_target_id, recorded_at);

-- Trigger to record history on every SLA target update
CREATE OR REPLACE FUNCTION public.record_sla_history()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF OLD.current_uptime IS DISTINCT FROM NEW.current_uptime THEN
    INSERT INTO public.sla_history (sla_target_id, uptime) VALUES (NEW.id, NEW.current_uptime);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_record_sla_history
AFTER UPDATE ON public.sla_targets
FOR EACH ROW
EXECUTE FUNCTION public.record_sla_history();

-- Seed initial history points for existing targets
INSERT INTO public.sla_history (sla_target_id, uptime, recorded_at)
SELECT id, current_uptime, now() - interval '6 days' FROM public.sla_targets
UNION ALL
SELECT id, current_uptime - 0.02, now() - interval '5 days' FROM public.sla_targets
UNION ALL
SELECT id, current_uptime + 0.01, now() - interval '4 days' FROM public.sla_targets
UNION ALL
SELECT id, current_uptime - 0.05, now() - interval '3 days' FROM public.sla_targets
UNION ALL
SELECT id, current_uptime + 0.03, now() - interval '2 days' FROM public.sla_targets
UNION ALL
SELECT id, current_uptime - 0.01, now() - interval '1 day' FROM public.sla_targets
UNION ALL
SELECT id, current_uptime, now() FROM public.sla_targets;
