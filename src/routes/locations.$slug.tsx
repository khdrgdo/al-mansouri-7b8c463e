import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getLocation } from "@/lib/public.functions";
import { SiteLayout } from "@/components/site/SiteLayout";
import { MediaImage } from "@/components/site/MediaImage";
import { CommentsSection } from "@/components/site/CommentsSection";
import { VERIFICATION_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/locations/$slug")({
  loader: async ({ params }) => {
    const data = await getLocation({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "الموقع غير متاح | ذاكرة المناصير" }, { name: "robots", content: "noindex" }],
      };
    }
    const { location } = loaderData;
    const title = location.seo_title || `${location.name} | ذاكرة المناصير`;
    const description =
      location.seo_description || location.description || "معلومات عن موقع في ذاكرة المناصير.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: LocationPage,
});

function LocationPage() {
  const { location, articles, archive, people } = Route.useLoaderData();

  return (
    <SiteLayout>
      <article className="mx-auto max-w-4xl px-4 py-12">
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link to="/locations" className="hover:text-primary">
            المناطق والقرى
          </Link>
          <span className="px-2">/</span>
          <span>{location.name}</span>
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          {location.kind ? <Badge variant="secondary">{location.kind}</Badge> : null}
          <Badge variant="outline">
            {VERIFICATION_LABELS[location.verification] ?? location.verification}
          </Badge>
        </div>
        <h1 className="mt-3 text-3xl font-bold text-foreground md:text-4xl">{location.name}</h1>
        {location.description ? (
          <p className="mt-4 text-lg leading-9 text-muted-foreground">{location.description}</p>
        ) : null}

        {location.cover_image_url ? (
          <MediaImage
            path={location.cover_image_url}
            alt={location.name}
            className="mt-8 rounded-lg"
            ratio="aspect-[16/9]"
          />
        ) : null}

        {location.history ? (
          <section className="mt-8">
            <h2 className="text-xl font-bold text-foreground">نبذة تاريخية</h2>
            <p className="mt-3 whitespace-pre-line text-base leading-9 text-foreground">
              {location.history}
            </p>
          </section>
        ) : null}

        {location.latitude != null && location.longitude != null ? (
          <section className="mt-8 rounded-lg border border-border bg-secondary/50 p-5">
            <h2 className="text-sm font-semibold text-foreground">الموقع الجغرافي</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {location.address ? `${location.address} — ` : ""}
              {location.latitude.toFixed(5)}، {location.longitude.toFixed(5)}
            </p>
            <Link to="/map" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
              عرض على الخريطة التفاعلية
            </Link>
          </section>
        ) : null}

        {archive.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-foreground">صور ومواد أرشيفية</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
              {archive.map((a: { id: string; title: string; media_url: string | null; alt_text: string | null }) => (
                <MediaImage
                  key={a.id}
                  path={a.media_url}
                  alt={a.alt_text || a.title}
                  className="rounded-lg"
                  ratio="aspect-square"
                />
              ))}
            </div>
          </section>
        ) : null}

        {people.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-foreground">شخصيات من المنطقة</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {people.map((p: { id: string; slug: string; name: string }) => (
                <Link key={p.id} to="/people/$slug" params={{ slug: p.slug }}>
                  <Badge variant="outline">{p.name}</Badge>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {articles.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-foreground">مقالات مرتبطة</h2>
            <ul className="mt-4 grid gap-3">
              {articles.map((a: { id: string; slug: string; title: string } | null) =>
                a ? (
                  <li key={a.id}>
                    <Link
                      to="/articles/$slug"
                      params={{ slug: a.slug }}
                      className="block rounded-lg border border-border bg-card p-4 text-sm font-medium text-foreground hover:border-primary"
                    >
                      {a.title}
                    </Link>
                  </li>
                ) : null,
              )}
            </ul>
          </section>
        ) : null}

        {location.sources ? (
          <section className="mt-10 rounded-lg border border-border bg-secondary/50 p-5">
            <h2 className="text-sm font-semibold text-foreground">المصادر</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-8 text-muted-foreground">
              {location.sources}
            </p>
          </section>
        ) : null}

        <CommentsSection targetType="location" targetId={location.id} />
      </article>
    </SiteLayout>
  );
}
