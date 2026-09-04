import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/sitemap.xml")({
  loader: async () => {
    const BASE = "https://al-mansouri.lovable.app";
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env["SUPABASE_URL"]!;
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const sb = createClient(url, key, { auth: { persistSession: false } });

    const [articles, events, locations, people] = await Promise.all([
      sb.from("articles").select("slug, updated_at").eq("published", true),
      sb.from("historical_events").select("slug, updated_at").eq("published", true),
      sb.from("locations").select("slug, updated_at").eq("published", true),
      sb.from("people").select("slug, updated_at").eq("published", true),
    ]);

    const urls: string[] = [];
    const add = (path: string, slug: string, date: string) => {
      urls.push(
        `  <url>\n    <loc>${BASE}${path}/${slug}</loc>\n    <lastmod>${date.slice(0, 10)}</lastmod>\n  </url>`,
      );
    };

    for (const a of articles.data ?? []) add("/articles", a.slug, a.updated_at);
    for (const e of events.data ?? []) add("/history", e.slug, e.updated_at);
    for (const l of locations.data ?? []) add("/locations", l.slug, l.updated_at);
    for (const p of people.data ?? []) add("/people", p.slug, p.updated_at);

    const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE}</loc>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
${urls.join("\n")}
</urlset>`;

    return new Response(body, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  },
  component: () => null,
});
