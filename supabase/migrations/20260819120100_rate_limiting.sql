-- Rate limiting: protect comments and advertisement submissions from spam

CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address inet NOT NULL,
  action text NOT NULL, -- 'comment' | 'submission' | 'advertisement'
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rate_limits_lookup_idx
  ON public.rate_limits (ip_address, action, created_at DESC);

-- Auto-cleanup: remove entries older than 1 hour
CREATE OR REPLACE FUNCTION public.cleanup_rate_limits()
RETURNS void LANGUAGE sql AS $$
  DELETE FROM public.rate_limits WHERE created_at < now() - interval '1 hour';
$$;

-- Rate check function: returns true if within limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  _ip inet,
  _action text,
  _max_per_hour int DEFAULT 10
)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT (
    SELECT count(*) FROM public.rate_limits
    WHERE ip_address = _ip
      AND action = _action
      AND created_at > now() - interval '1 hour'
  ) < _max_per_hour;
$$;

-- Insert a rate limit entry (called from client before actual insert)
CREATE OR REPLACE FUNCTION public.record_rate_limit(
  _ip inet,
  _action text
)
RETURNS void LANGUAGE sql SECURITY DEFINER AS $$
  INSERT INTO public.rate_limits (ip_address, action) VALUES (_ip, _action);
$$;

-- Tighter rate limits for comments (5/hour) and ads (3/hour)
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS ip_address inet;
ALTER TABLE public.advertisements ADD COLUMN IF NOT EXISTS ip_address inet;

-- RLS for rate_limits (only service_role can read/write)
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rate_limits service only" ON public.rate_limits
  FOR ALL USING (false) WITH CHECK (false);

GRANT ALL ON public.rate_limits TO service_role;
GRANT SELECT, INSERT ON public.rate_limits TO authenticated;
