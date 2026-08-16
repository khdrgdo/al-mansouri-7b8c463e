import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getEvent } from "@/lib/public.functions";
import {
  SiteLayout,
  Container,
  Crumbs,
  SectionTitle,
  Prose,
} from "@/components/site/SiteLayout";
import { MosaicImage, SCENE_STRIPS } from "@/components/site/MosaicImage";
import { Reveal } from "@/components/site/Reveal";
import { CommentsSection } from "@/components/site/CommentsSection";
import { VERIFICATION_LABELS } from "@/lib/constants";

export const Route = createFileRoute("/history/$slug")({
  loader: async ({ params }) => {
    const data = await getEvent({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "المحطة غير متاحة | ذاكرة المناصير" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { event } = loaderData;
    const title = event.seo_title || `${event.title} | ذاكرة المناصير`;
    const description =
      event.seo_description || event.summary || "محطة تاريخية من ذاكرة المناصير.";
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
      <section className="border-b border-border bg-paper">
        <Container className="pb-14 pt-10 md:pb-20 md:pt-14">
          <Crumbs parent="التاريخ" parentTo="/history" current={event.title} />
          <Reveal className="mt-10">
            <p className="eyebrow mb-6">
              {[event.period, VERIFICATION_LABELS[event.verification] ?? event.verification]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <h1 className="max-w-4xl font-display text-4xl leading-[1.02] text-balance text-foreground md:text-6xl lg:text-7xl">
              {event.title}
            </h1>
            {event.summary ? (
              <p className="mt-8 max-w-xl text-lg leading-9 text-muted-foreground">
                {event.summary}
              </p>
            ) : null}
          </Reveal>
        </Container>
      </section>

      {/* صورة واحدة، ثلاثة مقاطع أفقية */}
      {event.cover_image_url ? (
        <section className="border-b border-border py-12 md:py-16">
          <Container>
            <MosaicImage
              path={event.cover_image_url}
              alt={event.title}
              fragments={SCENE_STRIPS}
              priority
            />
          </Container>
        </section>
      ) : null}

      <section className="py-14 md:py-20">
        <Container>
          <div className="grid gap-12 md:grid-cols-12">
            <div className="md:col-span-7">
              {event.description ? (
                <Reveal>
                  <Prose>{event.description}</Prose>
                </Reveal>
              ) : null}

              {event.sources || event.references_text ? (
                <Reveal className="mt-14">
                  <SectionTitle eyebrow="التوثيق">المصادر والمراجع</SectionTitle>
                  <p className="mt-6 whitespace-pre-line text-sm leading-8 text-muted-foreground">
                    {[event.sources, event.references_text].filter(Boolean).join("\n")}
                  </p>
                </Reveal>
              ) : null}
            </div>

            <aside className="md:col-span-4 md:col-start-9">
              {locations.length > 0 ? (
                <Reveal>
                  <SectionTitle>مواقع مرتبطة</SectionTitle>
                  <ul className="mt-4 grid">
                    {locations.map((l: { id: string; slug: string; name: string } | null) =>
                      l ? (
                        <li key={l.id} className="border-b border-border last:border-0">
                          <Link
                            to="/locations/$slug"
                            params={{ slug: l.slug }}
                            className="block rounded-sm py-3 text-sm text-foreground transition-colors hover:text-primary"
                          >
                            {l.name}
                          </Link>
                        </li>
                      ) : null,
                    )}
                  </ul>
                </Reveal>
              ) : null}

              {people.length > 0 ? (
                <Reveal className="mt-10">
                  <SectionTitle>شخصيات مرتبطة</SectionTitle>
                  <ul className="mt-4 grid">
                    {people.map((p: { id: string; slug: string; name: string } | null) =>
                      p ? (
                        <li key={p.id} className="border-b border-border last:border-0">
                          <Link
                            to="/people/$slug"
                            params={{ slug: p.slug }}
                            className="block rounded-sm py-3 text-sm text-foreground transition-colors hover:text-primary"
                          >
                            {p.name}
                          </Link>
                        </li>
                      ) : null,
                    )}
                  </ul>
                </Reveal>
              ) : null}
            </aside>
          </div>

          <CommentsSection targetType="event" targetId={event.id} />
        </Container>
      </section>
    </SiteLayout>
  );
}
