import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getEvent } from "@/lib/public.functions";
import { SiteLayout } from "@/components/site/SiteLayout";
import { MediaImage } from "@/components/site/MediaImage";
import { CommentsSection } from "@/components/site/CommentsSection";
import { VERIFICATION_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/history/$slug")({
  loader: async ({ params }) => {
    const data = await getEvent({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "المحطة غير متاحة | ذاكرة المناصير" }, { name: "robots", content: "noindex" }],
      };
    }
    const { event } = loaderData;
    const title = event.seo_title || `${event.title} | ذاكرة المناصير`;
    const description = event.seo_description || event.summary || "محطة تاريخية من ذاكرة المناصير.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
      ],
    };
  },
  component: EventPage,
});

function EventPage() {
  const { event, locations, people } = Route.useLoaderData();

  return (
    <SiteLayout>
      <article className="mx-auto max-w-3xl px-4 py-12">
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link to="/history" className="hover:text-primary">
            التاريخ
          </Link>
          <span className="px-2">/</span>
          <span>{event.title}</span>
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          {event.period ? (
            <span className="text-sm font-semibold text-primary">{event.period}</span>
          ) : null}
          <Badge variant="secondary">
            {VERIFICATION_LABELS[event.verification] ?? event.verification}
          </Badge>
        </div>
        <h1 className="mt-3 text-3xl font-bold text-balance text-foreground md:text-4xl">
          {event.title}
        </h1>
        {event.summary ? (
          <p className="mt-4 text-lg leading-9 text-muted-foreground">{event.summary}</p>
        ) : null}

        {event.cover_image_url ? (
          <MediaImage
            path={event.cover_image_url}
            alt={event.title}
            className="mt-8 rounded-lg"
            ratio="aspect-[16/9]"
          />
        ) : null}

        {event.description ? (
          <div className="mt-8 whitespace-pre-line text-base leading-9 text-foreground">
            {event.description}
          </div>
        ) : null}

        {event.sources || event.references_text ? (
          <section className="mt-10 rounded-lg border border-border bg-secondary/50 p-5">
            <h2 className="text-sm font-semibold text-foreground">المصادر والمراجع</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-8 text-muted-foreground">
              {[event.sources, event.references_text].filter(Boolean).join("\n")}
            </p>
          </section>
        ) : null}

        {locations.length > 0 ? (
          <section className="mt-8">
            <h2 className="text-sm font-semibold text-foreground">مواقع مرتبطة</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {locations.map((l: { id: string; slug: string; name: string } | null) =>
                l ? (
                  <Link key={l.id} to="/locations/$slug" params={{ slug: l.slug }}>
                    <Badge variant="outline">{l.name}</Badge>
                  </Link>
                ) : null,
              )}
            </div>
          </section>
        ) : null}

        {people.length > 0 ? (
          <section className="mt-6">
            <h2 className="text-sm font-semibold text-foreground">شخصيات مرتبطة</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {people.map((p: { id: string; slug: string; name: string } | null) =>
                p ? (
                  <Link key={p.id} to="/people/$slug" params={{ slug: p.slug }}>
                    <Badge variant="outline">{p.name}</Badge>
                  </Link>
                ) : null,
              )}
            </div>
          </section>
        ) : null}

        <CommentsSection targetType="event" targetId={event.id} />
      </article>
    </SiteLayout>
  );
}
