
DROP POLICY "Insert SLA history" ON public.sla_history;
CREATE POLICY "Admins insert SLA history" ON public.sla_history FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
