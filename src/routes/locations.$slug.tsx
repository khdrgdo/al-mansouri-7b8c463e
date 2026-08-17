import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getLocation } from "@/lib/public.functions";
import {
  SiteLayout,
  Container,
  Crumbs,
  SectionTitle,
  Prose,
  MetaList,
} from "@/components/site/SiteLayout";
import { MediaImage } from "@/components/site/MediaImage";
import { Reveal } from "@/components/site/Reveal";
import { CommentsSection } from "@/components/site/CommentsSection";
import { VERIFICATION_LABELS } from "@/lib/constants";

export const Route = createFileRoute("/locations/$slug")({
  loader: async ({ params }) => {
    const data = await getLocation({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "الموقع غير متاح | ذاكرة المناصير" },
          { name: "robots", content: "noindex" },
        ],
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
      {/* ————— Masthead ————— */}
      <section className="border-b border-border bg-paper">
        <Container className="pb-14 pt-10 md:pb-20 md:pt-14">
          <Crumbs parent="المناطق والقرى" parentTo="/locations" current={location.name} />

          <div className="mt-10 grid gap-12 md:grid-cols-12 md:items-end">
            <Reveal className="md:col-span-7">
              <p className="eyebrow mb-6">
                {[
                  location.kind,
                  VERIFICATION_LABELS[location.verification] ?? location.verification,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
              <h1 className="font-display text-5xl leading-[0.98] text-balance text-foreground md:text-7xl lg:text-8xl">
                {location.name}
              </h1>
              {location.description ? (
                <p className="mt-6 max-w-md text-lg leading-9 text-muted-foreground">
                  {location.description}
                </p>
              ) : null}
            </Reveal>

            {location.latitude != null && location.longitude != null ? (
              <Reveal delay={120} className="md:col-span-5">
                <MetaList
                  items={[
                    ...(location.address ? [{ label: "العنوان", value: location.address }] : []),
                    {
                      label: "الإحداثيات",
                      value: `${location.latitude.toFixed(5)}، ${location.longitude.toFixed(5)}`,
                    },
                  ]}
                />
                <Link
                  to="/map"
                  className="mt-4 inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  عرض على الخريطة التفاعلية
                </Link>
              </Reveal>
            ) : null}
          </div>
        </Container>
      </section>

      {/* ————— الصورة ————— */}
      {location.cover_image_url ? (
        <section className="border-b border-border py-12 md:py-16">
          <Container>
            <Reveal>
              <MediaImage
                path={location.cover_image_url}
                alt={location.name}
                ratio="aspect-[21/9]"
                priority
              />
            </Reveal>
          </Container>
        </section>
      ) : null}

      <section className="py-14 md:py-20">
        <Container>
          <div className="grid gap-12 md:grid-cols-12">
            <div className="md:col-span-7">
              {location.history ? (
                <Reveal>
                  <SectionTitle eyebrow="الذاكرة">نبذة تاريخية</SectionTitle>
                  <Prose className="mt-6">{location.history}</Prose>
                </Reveal>
              ) : null}

              {location.sources ? (
                <Reveal className="mt-14">
                  <SectionTitle eyebrow="التوثيق">المصادر</SectionTitle>
                  <p className="mt-6 whitespace-pre-line text-sm leading-8 text-muted-foreground">
                    {location.sources}
                  </p>
                </Reveal>
              ) : null}
            </div>

            <aside className="md:col-span-4 md:col-start-9">
              {people.length > 0 ? (
                <Reveal>
                  <SectionTitle>شخصيات من المنطقة</SectionTitle>
                  <ul className="mt-4 grid">
                    {people.map((p: { id: string; slug: string; name: string }) => (
                      <li key={p.id} className="border-b border-border last:border-0">
                        <Link
                          to="/people/$slug"
                          params={{ slug: p.slug }}
                          className="block rounded-sm py-3 text-sm text-foreground transition-colors hover:text-primary"
                        >
                          {p.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </Reveal>
              ) : null}

              {articles.length > 0 ? (
                <Reveal className="mt-10">
                  <SectionTitle>مقالات مرتبطة</SectionTitle>
                  <ul className="mt-4 grid">
                    {articles.map((a: { id: string; slug: string; title: string } | null) =>
                      a ? (
                        <li key={a.id} className="border-b border-border last:border-0">
                          <Link
                            to="/articles/$slug"
                            params={{ slug: a.slug }}
                            className="block rounded-sm py-3 text-sm leading-7 text-foreground transition-colors hover:text-primary"
                          >
                            {a.title}
                          </Link>
                        </li>
                      ) : null,
                    )}
                  </ul>
                </Reveal>
              ) : null}
            </aside>
          </div>
        </Container>
      </section>

      {/* ————— أرشيف ————— */}
      {archive.length > 0 ? (
        <section className="border-t border-border py-14 md:py-20">
          <Container>
            <Reveal>
              <SectionTitle eyebrow="الذاكرة البصرية">صور ومواد أرشيفية</SectionTitle>
            </Reveal>
          </Container>
          <div className="snap-rail mt-8 px-5 lg:px-10">
            {archive.map(
              (
                a: { id: string; title: string; media_url: string | null; alt_text: string | null },
                i: number,
              ) => (
                <div key={a.id} className="w-[62vw] shrink-0 md:w-[24vw]">
                  <MediaImage
                    path={a.media_url}
                    alt={a.alt_text || a.title}
                    ratio={i % 3 === 1 ? "aspect-[3/4]" : "aspect-[4/5]"}
                    imgClassName="hover:scale-[1.03]"
                  />
                  <p className="mt-3 line-clamp-1 text-sm text-muted-foreground">{a.title}</p>
                </div>
              ),
            )}
          </div>
        </section>
      ) : null}

      <Container className="pb-24 pt-14 md:pt-20">
        <CommentsSection targetType="location" targetId={location.id} />
      </Container>
    </SiteLayout>
  );
}
