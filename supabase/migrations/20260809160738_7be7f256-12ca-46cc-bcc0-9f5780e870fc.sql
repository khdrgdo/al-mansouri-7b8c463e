
-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin', 'editor');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
$$;

CREATE POLICY "own roles readable" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_admin());
CREATE POLICY "admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- timestamps helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- CATEGORIES
CREATE TABLE public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL, -- article | archive | advertisement | location
  slug text NOT NULL,
  name text NOT NULL,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kind, slug)
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories admin write" ON public.categories FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- TAGS
CREATE TABLE public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tags TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.tags TO authenticated;
GRANT ALL ON public.tags TO service_role;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tags public read" ON public.tags FOR SELECT USING (true);
CREATE POLICY "tags admin write" ON public.tags FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- LOCATIONS
CREATE TABLE public.locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  kind text NOT NULL DEFAULT 'منطقة', -- منطقة | قرية | موضع | معلم
  description text,
  history text,
  address text,
  latitude double precision,
  longitude double precision,
  cover_image_url text,
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  sources text,
  verification text NOT NULL DEFAULT 'unverified', -- verified | oral | unverified
  published boolean NOT NULL DEFAULT false,
  seo_title text,
  seo_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.locations TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.locations TO authenticated;
GRANT ALL ON public.locations TO service_role;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "locations public read" ON public.locations FOR SELECT USING (published OR public.is_admin());
CREATE POLICY "locations admin write" ON public.locations FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER locations_updated BEFORE UPDATE ON public.locations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- PEOPLE
CREATE TABLE public.people (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  photo_url text,
  biography text,
  birth_info text,
  death_info text,
  role_title text,
  location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  contribution text,
  sources text,
  verification text NOT NULL DEFAULT 'unverified',
  published boolean NOT NULL DEFAULT false,
  seo_title text,
  seo_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.people TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.people TO authenticated;
GRANT ALL ON public.people TO service_role;
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;
CREATE POLICY "people public read" ON public.people FOR SELECT USING (published OR public.is_admin());
CREATE POLICY "people admin write" ON public.people FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER people_updated BEFORE UPDATE ON public.people FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- HISTORICAL EVENTS
CREATE TABLE public.historical_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  period text,
  event_date date,
  sort_order int NOT NULL DEFAULT 0,
  summary text,
  description text,
  cover_image_url text,
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  sources text,
  references_text text,
  verification text NOT NULL DEFAULT 'unverified',
  published boolean NOT NULL DEFAULT false,
  seo_title text,
  seo_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.historical_events TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.historical_events TO authenticated;
GRANT ALL ON public.historical_events TO service_role;
ALTER TABLE public.historical_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "events public read" ON public.historical_events FOR SELECT USING (published OR public.is_admin());
CREATE POLICY "events admin write" ON public.historical_events FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER events_updated BEFORE UPDATE ON public.historical_events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ARTICLES
CREATE TABLE public.articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text,
  content text,
  cover_image_url text,
  author text,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  published_at timestamptz,
  sources text,
  verification text NOT NULL DEFAULT 'unverified',
  published boolean NOT NULL DEFAULT false,
  seo_title text,
  seo_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.articles TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.articles TO authenticated;
GRANT ALL ON public.articles TO service_role;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "articles public read" ON public.articles FOR SELECT USING (published OR public.is_admin());
CREATE POLICY "articles admin write" ON public.articles FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER articles_updated BEFORE UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ARCHIVE ITEMS
CREATE TABLE public.archive_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  media_url text,
  media_type text NOT NULL DEFAULT 'image', -- image | document
  file_name text,
  alt_text text,
  caption text,
  item_date text,
  location_id uuid REFERENCES public.locations(id) ON DELETE SET NULL,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  source text,
  contributor text,
  verification text NOT NULL DEFAULT 'unverified',
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.archive_items TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.archive_items TO authenticated;
GRANT ALL ON public.archive_items TO service_role;
ALTER TABLE public.archive_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "archive public read" ON public.archive_items FOR SELECT USING (published OR public.is_admin());
CREATE POLICY "archive admin write" ON public.archive_items FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER archive_updated BEFORE UPDATE ON public.archive_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- DOCUMENTS
CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  file_url text NOT NULL,
  file_name text,
  file_type text,
  file_size int,
  source text,
  verification text NOT NULL DEFAULT 'unverified',
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.documents TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.documents TO authenticated;
GRANT ALL ON public.documents TO service_role;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "documents public read" ON public.documents FOR SELECT USING (published OR public.is_admin());
CREATE POLICY "documents admin write" ON public.documents FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER documents_updated BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- RELATION TABLES
CREATE TABLE public.article_locations (
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, location_id)
);
CREATE TABLE public.article_people (
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  person_id uuid NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, person_id)
);
CREATE TABLE public.article_events (
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  event_id uuid NOT NULL REFERENCES public.historical_events(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, event_id)
);
CREATE TABLE public.article_tags (
  article_id uuid NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);
CREATE TABLE public.archive_people (
  archive_id uuid NOT NULL REFERENCES public.archive_items(id) ON DELETE CASCADE,
  person_id uuid NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  PRIMARY KEY (archive_id, person_id)
);
CREATE TABLE public.event_locations (
  event_id uuid NOT NULL REFERENCES public.historical_events(id) ON DELETE CASCADE,
  location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, location_id)
);
CREATE TABLE public.event_people (
  event_id uuid NOT NULL REFERENCES public.historical_events(id) ON DELETE CASCADE,
  person_id uuid NOT NULL REFERENCES public.people(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, person_id)
);
CREATE TABLE public.event_documents (
  event_id uuid NOT NULL REFERENCES public.historical_events(id) ON DELETE CASCADE,
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  PRIMARY KEY (event_id, document_id)
);

GRANT SELECT ON public.article_locations, public.article_people, public.article_events, public.article_tags, public.archive_people, public.event_locations, public.event_people, public.event_documents TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.article_locations, public.article_people, public.article_events, public.article_tags, public.archive_people, public.event_locations, public.event_people, public.event_documents TO authenticated;
GRANT ALL ON public.article_locations, public.article_people, public.article_events, public.article_tags, public.archive_people, public.event_locations, public.event_people, public.event_documents TO service_role;

ALTER TABLE public.article_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.archive_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_people ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rel read" ON public.article_locations FOR SELECT USING (true);
CREATE POLICY "rel write" ON public.article_locations FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "rel read" ON public.article_people FOR SELECT USING (true);
CREATE POLICY "rel write" ON public.article_people FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "rel read" ON public.article_events FOR SELECT USING (true);
CREATE POLICY "rel write" ON public.article_events FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "rel read" ON public.article_tags FOR SELECT USING (true);
CREATE POLICY "rel write" ON public.article_tags FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "rel read" ON public.archive_people FOR SELECT USING (true);
CREATE POLICY "rel write" ON public.archive_people FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "rel read" ON public.event_locations FOR SELECT USING (true);
CREATE POLICY "rel write" ON public.event_locations FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "rel read" ON public.event_people FOR SELECT USING (true);
CREATE POLICY "rel write" ON public.event_people FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "rel read" ON public.event_documents FOR SELECT USING (true);
CREATE POLICY "rel write" ON public.event_documents FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- COMMENTS
CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  target_type text NOT NULL, -- article | event | location | person | archive
  target_id uuid NOT NULL,
  author_name text NOT NULL,
  body text NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  reported boolean NOT NULL DEFAULT false,
  meta jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.comments TO anon, authenticated;
GRANT UPDATE, DELETE ON public.comments TO authenticated;
GRANT ALL ON public.comments TO service_role;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "approved comments public" ON public.comments FOR SELECT USING (status = 'approved' OR public.is_admin());
CREATE POLICY "anyone can submit comment" ON public.comments FOR INSERT WITH CHECK (
  status = 'pending' AND reported = false
  AND length(trim(author_name)) BETWEEN 2 AND 80
  AND length(trim(body)) BETWEEN 2 AND 2000
);
CREATE POLICY "admins manage comments" ON public.comments FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admins delete comments" ON public.comments FOR DELETE TO authenticated USING (public.is_admin());

-- SUBMISSIONS
CREATE TABLE public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contributor_name text NOT NULL,
  contact text,
  content_type text NOT NULL, -- photo | document | story | info | correction | location
  title text NOT NULL,
  description text,
  files jsonb NOT NULL DEFAULT '[]'::jsonb,
  location_text text,
  approx_date text,
  source_context text,
  status text NOT NULL DEFAULT 'pending',
  admin_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.submissions TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.submissions TO authenticated;
GRANT ALL ON public.submissions TO service_role;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can submit" ON public.submissions FOR INSERT WITH CHECK (
  status = 'pending' AND length(trim(contributor_name)) BETWEEN 2 AND 80 AND length(trim(title)) BETWEEN 2 AND 200
);
CREATE POLICY "admins read submissions" ON public.submissions FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "admins update submissions" ON public.submissions FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admins delete submissions" ON public.submissions FOR DELETE TO authenticated USING (public.is_admin());
CREATE TRIGGER submissions_updated BEFORE UPDATE ON public.submissions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ADVERTISEMENTS
CREATE TABLE public.advertisements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_name text NOT NULL,
  title text NOT NULL,
  description text,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  category_slug text,
  phone text,
  location_text text,
  image_url text,
  website text,
  start_date date,
  end_date date,
  status text NOT NULL DEFAULT 'pending', -- pending | approved | rejected | paused
  admin_notes text,
  contact_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.advertisements TO anon, authenticated;
GRANT UPDATE, DELETE ON public.advertisements TO authenticated;
GRANT ALL ON public.advertisements TO service_role;
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "active ads public" ON public.advertisements FOR SELECT USING (
  public.is_admin() OR (
    status = 'approved'
    AND (start_date IS NULL OR start_date <= current_date)
    AND (end_date IS NULL OR end_date >= current_date)
  )
);
CREATE POLICY "anyone can submit ad" ON public.advertisements FOR INSERT WITH CHECK (
  status = 'pending' AND length(trim(advertiser_name)) BETWEEN 2 AND 100 AND length(trim(title)) BETWEEN 2 AND 150
);
CREATE POLICY "admins update ads" ON public.advertisements FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "admins delete ads" ON public.advertisements FOR DELETE TO authenticated USING (public.is_admin());
CREATE TRIGGER ads_updated BEFORE UPDATE ON public.advertisements FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- SITE SETTINGS
CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings public read" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "settings admin write" ON public.site_settings FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- INDEXES
CREATE INDEX ON public.articles (published, published_at DESC);
CREATE INDEX ON public.archive_items (published, category_id);
CREATE INDEX ON public.comments (target_type, target_id, status);
CREATE INDEX ON public.advertisements (status, end_date);
CREATE INDEX ON public.historical_events (published, sort_order);
