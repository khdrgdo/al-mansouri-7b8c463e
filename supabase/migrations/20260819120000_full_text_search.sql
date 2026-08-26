-- Full-Text Search: add tsvector columns + GIN indexes for fast Arabic-aware search

-- ARTICLES
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('arabic', coalesce(title, '')), 'A') ||
    setweight(totsvector('arabic', coalesce(excerpt, '')), 'B') ||
    setweight(to_tsvector('arabic', coalesce(content, '')), 'C')
  ) STORED;
CREATE INDEX IF NOT EXISTS articles_fts_idx ON public.articles USING GIN (fts);

-- HISTORICAL EVENTS
ALTER TABLE public.historical_events ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('arabic', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('arabic', coalesce(summary, '')), 'B') ||
    setweight(to_tsvector('arabic', coalesce(description, '')), 'C')
  ) STORED;
CREATE INDEX IF NOT EXISTS events_fts_idx ON public.historical_events USING GIN (fts);

-- LOCATIONS
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('arabic', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('arabic', coalesce(description, '')), 'B')
  ) STORED;
CREATE INDEX IF NOT EXISTS locations_fts_idx ON public.locations USING GIN (fts);

-- PEOPLE
ALTER TABLE public.people ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('arabic', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('arabic', coalesce(biography, '')), 'B')
  ) STORED;
CREATE INDEX IF NOT EXISTS people_fts_idx ON public.people USING GIN (fts);

-- ARCHIVE ITEMS
ALTER TABLE public.archive_items ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('arabic', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('arabic', coalesce(description, '')), 'B')
  ) STORED;
CREATE INDEX IF NOT EXISTS archive_fts_idx ON public.archive_items USING GIN (fts);

-- DOCUMENTS
ALTER TABLE public.documents ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('arabic', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('arabic', coalesce(description, '')), 'B')
  ) STORED;
CREATE INDEX IF NOT EXISTS documents_fts_idx ON public.documents USING GIN (fts);

-- Global search function using ts_rank for relevance scoring
CREATE OR REPLACE FUNCTION public.global_search(_query text)
RETURNS TABLE (
  source text,
  id uuid,
  slug text,
  title text,
  excerpt text,
  rank real
) LANGUAGE sql STABLE AS $$
  WITH q AS (
    SELECT plainto_tsquery('arabic', _query) AS query
  )
  SELECT 'article'::text, a.id, a.slug, a.title, a.excerpt,
         ts_rank(a.fts, q.query)::real AS rank
  FROM public.articles a, q
  WHERE a.published AND a.fts @@ q.query
  UNION ALL
  SELECT 'event'::text, e.id, e.slug, e.title, e.summary,
         ts_rank(e.fts, q.query)::real
  FROM public.historical_events e, q
  WHERE e.published AND e.fts @@ q.query
  UNION ALL
  SELECT 'location'::text, l.id, l.slug, l.name, l.description,
         ts_rank(l.fts, q.query)::real
  FROM public.locations l, q
  WHERE l.published AND l.fts @@ q.query
  UNION ALL
  SELECT 'person'::text, p.id, p.slug, p.name, p.biography,
         ts_rank(p.fts, q.query)::real
  FROM public.people p, q
  WHERE p.published AND p.fts @@ q.query
  UNION ALL
  SELECT 'archive'::text, ai.id, ai.slug, ai.title, ai.description,
         ts_rank(ai.fts, q.query)::real
  FROM public.archive_items ai, q
  WHERE ai.published AND ai.fts @@ q.query
  UNION ALL
  SELECT 'document'::text, d.id, d.title, d.title, d.description,
         ts_rank(d.fts, q.query)::real
  FROM public.documents d, q
  WHERE d.published AND d.fts @@ q.query
  ORDER BY rank DESC
  LIMIT 60;
$$;

GRANT EXECUTE ON FUNCTION public.global_search(text) TO anon, authenticated;
