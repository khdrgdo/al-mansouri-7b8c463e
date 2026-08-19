-- "ذاكرة المكان" (Memory of the Place) feature. Additive and isolated:
-- historical_events.period stays free text (unchanged), event_locations
-- stays untouched. This table is the structured, year-range-queryable
-- source the timeline UI needs — years are plain integers (not dates)
-- since that's how the data is actually written/thought about (see the
-- existing historical_events.period free-text values, all year-based).

CREATE TABLE public.location_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id uuid NOT NULL REFERENCES public.locations(id) ON DELETE CASCADE,
  from_year integer NOT NULL,
  to_year integer, -- null = ongoing / "to date"
  label text NOT NULL,
  description text,
  sources text,
  verification text NOT NULL DEFAULT 'unverified',
  published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT location_periods_year_order CHECK (to_year IS NULL OR to_year >= from_year)
);

CREATE INDEX location_periods_location_id_idx ON public.location_periods(location_id);
CREATE INDEX location_periods_published_idx ON public.location_periods(published) WHERE published = true;

ALTER TABLE public.location_periods ENABLE ROW LEVEL SECURITY;

-- Same public/staff split used everywhere else in this schema.
CREATE POLICY "public reads published location_periods" ON public.location_periods
  FOR SELECT TO public
  USING (published = true);

CREATE POLICY "staff manage location_periods" ON public.location_periods
  FOR ALL TO authenticated
  USING (public.is_admin() OR public.has_role(auth.uid(), 'editor'))
  WITH CHECK (public.is_admin() OR public.has_role(auth.uid(), 'editor'));

CREATE TRIGGER location_periods_updated BEFORE UPDATE ON public.location_periods
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
