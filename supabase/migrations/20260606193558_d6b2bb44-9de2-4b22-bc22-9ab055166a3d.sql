
-- Admin table (anyone listed here can edit content)
CREATE TABLE public.admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admins TO authenticated;
GRANT ALL ON public.admins TO service_role;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can check admins" ON public.admins FOR SELECT TO authenticated USING (true);

-- Security definer helper
CREATE OR REPLACE FUNCTION public.is_admin(_uid uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.admins WHERE user_id = _uid);
$$;

-- Bootstrap function: first authenticated user calling this becomes admin if table empty
CREATE OR REPLACE FUNCTION public.claim_admin()
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  has_any BOOLEAN;
  uid UUID;
  uemail TEXT;
BEGIN
  uid := auth.uid();
  IF uid IS NULL THEN RETURN false; END IF;
  SELECT EXISTS(SELECT 1 FROM public.admins) INTO has_any;
  IF has_any THEN RETURN false; END IF;
  SELECT email INTO uemail FROM auth.users WHERE id = uid;
  INSERT INTO public.admins(user_id, email) VALUES (uid, uemail);
  RETURN true;
END;
$$;
GRANT EXECUTE ON FUNCTION public.claim_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated, anon;

-- Hotel media overrides: replace images/videos for any section of any hotel
CREATE TABLE public.hotel_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hotel_id TEXT NOT NULL,
  section_key TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image','video')),
  url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX hotel_media_lookup ON public.hotel_media(hotel_id, section_key, sort_order);
GRANT SELECT ON public.hotel_media TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.hotel_media TO authenticated;
GRANT ALL ON public.hotel_media TO service_role;
ALTER TABLE public.hotel_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read media" ON public.hotel_media FOR SELECT USING (true);
CREATE POLICY "Admins manage media" ON public.hotel_media FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Room pricing overrides
CREATE TABLE public.room_pricing (
  hotel_id TEXT NOT NULL,
  room_key TEXT NOT NULL,
  single_price TEXT,
  double_price TEXT,
  display_price TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (hotel_id, room_key)
);
GRANT SELECT ON public.room_pricing TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.room_pricing TO authenticated;
GRANT ALL ON public.room_pricing TO service_role;
ALTER TABLE public.room_pricing ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read pricing" ON public.room_pricing FOR SELECT USING (true);
CREATE POLICY "Admins manage pricing" ON public.room_pricing FOR ALL TO authenticated
  USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));
