import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const url = process.env["SUPABASE_URL"]!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const getHomeData = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const [
    locations,
    articles,
    images,
    documents,
    people,
    latestArticles,
    timeline,
    featuredPeople,
    featuredLocations,
    featuredArchive,
    sponsor,
  ] = await Promise.all([
    sb.from("locations").select("id", { count: "exact", head: true }).eq("published", true),
    sb.from("articles").select("id", { count: "exact", head: true }).eq("published", true),
    sb
      .from("archive_items")
      .select("id", { count: "exact", head: true })
      .eq("published", true)
      .eq("media_type", "image"),
    sb.from("documents").select("id", { count: "exact", head: true }).eq("published", true),
    sb.from("people").select("id", { count: "exact", head: true }).eq("published", true),
    sb
      .from("articles")
      .select("id, slug, title, excerpt, cover_image_url, published_at")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(3),
    sb
      .from("historical_events")
      .select("id, slug, title, period, summary")
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .limit(4),
    sb
      .from("people")
      .select("id, slug, name, role_title, biography, photo_url")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(4),
    sb
      .from("locations")
      .select("id, slug, name, kind, latitude, longitude")
      .eq("published", true)
      .order("name")
      .limit(8),
    sb
      .from("archive_items")
      .select("id, slug, title, media_url, media_type, alt_text")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(5),
    sb
      .from("advertisements")
      .select("id, advertiser_name, title, description, image_url, website, phone")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    stats: {
      locations: locations.count ?? 0,
      articles: articles.count ?? 0,
      images: images.count ?? 0,
      documents: documents.count ?? 0,
      people: people.count ?? 0,
    },
    latestArticles: latestArticles.data ?? [],
    timeline: timeline.data ?? [],
    featuredPeople: featuredPeople.data ?? [],
    featuredLocations: featuredLocations.data ?? [],
    featuredArchive: featuredArchive.data ?? [],
    sponsor: sponsor.data ?? null,
  };
});

export const listEvents = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data } = await sb
    .from("historical_events")
    .select(
      "id, slug, title, period, event_date, summary, cover_image_url, verification, sort_order",
    )
    .eq("published", true)
    .order("sort_order", { ascending: true });
  return data ?? [];
});

export const getEvent = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: event } = await sb
      .from("historical_events")
      .select("*")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (!event) return null;

    const [locs, ppl] = await Promise.all([
      sb
        .from("event_locations")
        .select("locations(id, slug, name, published)")
        .eq("event_id", event.id),
      sb.from("event_people").select("people(id, slug, name, published)").eq("event_id", event.id),
    ]);

    return {
      event,
      locations: (locs.data ?? []).map((r) => r.locations).filter((l) => l?.published),
      people: (ppl.data ?? []).map((r) => r.people).filter((p) => p?.published),
    };
  });

export const listLocations = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data } = await sb
    .from("locations")
    .select("id, slug, name, kind, description, cover_image_url, latitude, longitude, verification")
    .eq("published", true)
    .order("name");
  return data ?? [];
});

export const getLocation = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: location } = await sb
      .from("locations")
      .select("*")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (!location) return null;

    const [articles, archive, people] = await Promise.all([
      sb
        .from("article_locations")
        .select("articles(id, slug, title, excerpt, published)")
        .eq("location_id", location.id),
      sb
        .from("archive_items")
        .select("id, slug, title, media_url, media_type, alt_text")
        .eq("location_id", location.id)
        .eq("published", true)
        .limit(12),
      sb
        .from("people")
        .select("id, slug, name, photo_url")
        .eq("location_id", location.id)
        .eq("published", true),
    ]);

    return {
      location,
      articles: (articles.data ?? []).map((r) => r.articles).filter((a) => a?.published),
      archive: archive.data ?? [],
      people: people.data ?? [],
    };
  });

export const listMapLocations = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data } = await sb
    .from("locations")
    .select("id, slug, name, kind, description, latitude, longitude, cover_image_url")
    .eq("published", true)
    .not("latitude", "is", null)
    .not("longitude", "is", null);
  return data ?? [];
});

export const listPeople = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data } = await sb
    .from("people")
    .select("id, slug, name, photo_url, role_title, biography, verification")
    .eq("published", true)
    .order("name");
  return data ?? [];
});

export const getPerson = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: person } = await sb
      .from("people")
      .select("*, locations(slug, name)")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (!person) return null;

    const [articles, archive] = await Promise.all([
      sb
        .from("article_people")
        .select("articles(id, slug, title, excerpt, published)")
        .eq("person_id", person.id),
      sb
        .from("archive_people")
        .select("archive_items(id, slug, title, media_url, media_type, published, alt_text)")
        .eq("person_id", person.id),
    ]);

    return {
      person,
      articles: (articles.data ?? []).map((r) => r.articles).filter((a) => a?.published),
      archive: (archive.data ?? []).map((r) => r.archive_items).filter((a) => a?.published),
    };
  });

export const listArticles = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const [articles, categories] = await Promise.all([
    sb
      .from("articles")
      .select(
        "id, slug, title, excerpt, cover_image_url, author, published_at, category_id, verification",
      )
      .eq("published", true)
      .order("published_at", { ascending: false }),
    sb.from("categories").select("id, slug, name").eq("kind", "article").order("sort_order"),
  ]);
  return { articles: articles.data ?? [], categories: categories.data ?? [] };
});

export const getArticle = createServerFn({ method: "GET" })
  .inputValidator((d: { slug: string }) => d)
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: article } = await sb
      .from("articles")
      .select("*, categories(slug, name)")
      .eq("slug", data.slug)
      .eq("published", true)
      .maybeSingle();
    if (!article) return null;

    const [tags, locs, ppl, related] = await Promise.all([
      sb.from("article_tags").select("tags(slug, name)").eq("article_id", article.id),
      sb
        .from("article_locations")
        .select("locations(slug, name, published)")
        .eq("article_id", article.id),
      sb
        .from("article_people")
        .select("people(slug, name, published)")
        .eq("article_id", article.id),
      article.category_id
        ? sb
            .from("articles")
            .select("id, slug, title, excerpt, cover_image_url")
            .eq("published", true)
            .neq("id", article.id)
            .eq("category_id", article.category_id)
            .limit(3)
        : Promise.resolve({
            data: [] as Array<{
              id: string;
              slug: string;
              title: string;
              excerpt: string | null;
              cover_image_url: string | null;
            }>,
          }),
    ]);

    return {
      article,
      tags: (tags.data ?? []).map((t) => t.tags).filter(Boolean),
      locations: (locs.data ?? []).map((l) => l.locations).filter((l) => l?.published),
      people: (ppl.data ?? []).map((p) => p.people).filter((p) => p?.published),
      related: related.data ?? [],
    };
  });

export const listArchive = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const [items, categories] = await Promise.all([
    sb
      .from("archive_items")
      .select(
        "id, slug, title, description, media_url, media_type, alt_text, caption, item_date, category_id, source, contributor",
      )
      .eq("published", true)
      .order("created_at", { ascending: false })
      .limit(200),
    sb.from("categories").select("id, slug, name").eq("kind", "archive").order("sort_order"),
  ]);
  return { items: items.data ?? [], categories: categories.data ?? [] };
});

export const listAds = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const [ads, categories] = await Promise.all([
    sb
      .from("advertisements")
      .select(
        "id, advertiser_name, title, description, category_id, phone, location_text, image_url, website, end_date",
      )
      .eq("status", "approved")
      .order("created_at", { ascending: false }),
    sb.from("categories").select("id, slug, name").eq("kind", "advertisement").order("sort_order"),
  ]);
  return { ads: ads.data ?? [], categories: categories.data ?? [] };
});

export const globalSearch = createServerFn({ method: "GET" })
  .inputValidator((d: { q: string }) => ({ q: String(d.q ?? "").slice(0, 100) }))
  .handler(async ({ data }) => {
    const q = data.q.trim();
    if (q.length < 2) {
      return { articles: [], events: [], locations: [], people: [], archive: [], documents: [] };
    }
    const sb = publicClient();
    const like = `%${q}%`;
    const [articles, events, locations, people, archive, documents] = await Promise.all([
      sb
        .from("articles")
        .select("id, slug, title, excerpt")
        .eq("published", true)
        .or(`title.ilike.${like},excerpt.ilike.${like},content.ilike.${like}`)
        .limit(20),
      sb
        .from("historical_events")
        .select("id, slug, title, period, summary")
        .eq("published", true)
        .or(`title.ilike.${like},summary.ilike.${like},description.ilike.${like}`)
        .limit(20),
      sb
        .from("locations")
        .select("id, slug, name, kind, description")
        .eq("published", true)
        .or(`name.ilike.${like},description.ilike.${like}`)
        .limit(20),
      sb
        .from("people")
        .select("id, slug, name, role_title")
        .eq("published", true)
        .or(`name.ilike.${like},biography.ilike.${like}`)
        .limit(20),
      sb
        .from("archive_items")
        .select("id, slug, title, media_type")
        .eq("published", true)
        .or(`title.ilike.${like},description.ilike.${like}`)
        .limit(20),
      sb
        .from("documents")
        .select("id, title, description, file_url")
        .eq("published", true)
        .or(`title.ilike.${like},description.ilike.${like}`)
        .limit(20),
    ]);
    return {
      articles: articles.data ?? [],
      events: events.data ?? [],
      locations: locations.data ?? [],
      people: people.data ?? [],
      archive: archive.data ?? [],
      documents: documents.data ?? [],
    };
  });

export const listDocuments = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data } = await sb
    .from("documents")
    .select("id, title, description, file_url, file_name, file_type, source")
    .eq("published", true)
    .order("created_at", { ascending: false });
  return data ?? [];
});

/**
 * Data for the "ذاكرة المكان" (Memory of the Place) experience. Fetched
 * once when the experience opens (lazy-loaded component + this call
 * together), then cached client-side — year selection filters the
 * already-loaded set, it never refetches.
 */
export const getMemoryMapData = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const [locations, periods] = await Promise.all([
    sb
      .from("locations")
      .select("id, slug, name, kind, description, latitude, longitude, verification")
      .eq("published", true)
      .not("latitude", "is", null)
      .not("longitude", "is", null),
    sb
      .from("location_periods")
      .select(
        "id, location_id, from_year, to_year, label, description, sources, verification, sort_order",
      )
      .eq("published", true)
      .order("sort_order", { ascending: true }),
  ]);

  return {
    locations: locations.data ?? [],
    periods: periods.data ?? [],
  };
});
