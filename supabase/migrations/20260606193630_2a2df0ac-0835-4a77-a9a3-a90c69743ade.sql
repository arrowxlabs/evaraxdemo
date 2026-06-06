
-- Restrict SECURITY DEFINER functions per linter recommendations
REVOKE EXECUTE ON FUNCTION public.is_admin(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.claim_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_admin() TO authenticated;

-- Storage policies for hotel-media bucket
CREATE POLICY "Public read hotel media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'hotel-media');

CREATE POLICY "Admins upload hotel media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'hotel-media' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins update hotel media"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'hotel-media' AND public.is_admin(auth.uid()));

CREATE POLICY "Admins delete hotel media"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'hotel-media' AND public.is_admin(auth.uid()));
