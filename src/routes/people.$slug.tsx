import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getPerson } from "@/lib/public.functions";
import {
  SiteLayout,
  Container,
  Crumbs,
  SectionTitle,
  Prose,
  MetaList,
} from "@/components/site/SiteLayout";
import { MediaImage } from "@/components/site/MediaImage";
import { MosaicImage, PORTRAIT_TRIPTYCH } from "@/components/site/MosaicImage";
import { Reveal } from "@/components/site/Reveal";
import { CommentsSection } from "@/components/site/CommentsSection";
import { VERIFICATION_LABELS } from "@/lib/constants";

export const Route = createFileRoute("/people/$slug")({
  loader: async ({ params }) => {
    const data = await getPerson({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "الصفحة غير متاحة | ذاكرة المناصير" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { person } = loaderData;
    const title = person.seo_title || `${person.name} | ذاكرة المناصير`;
    const description =
      person.seo_description || person.biography?.slice(0, 155) || "سيرة شخصية من ذاكرة المناصير.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
      ],
    };
  },
  component: PersonPage,
});

function PersonPage() {
  const { person, articles, archive } = Route.useLoaderData();
  const location = person.locations as { slug: string; name: string } | null;

  return (
    <SiteLayout>
      {/* ————— Masthead ————— */}
      <section className="border-b border-border bg-paper">
        <Container className="pb-14 pt-10 md:pb-20 md:pt-14">
          <Crumbs parent="الشخصيات" parentTo="/people" current={person.name} />

          <div className="mt-10 grid gap-12 md:grid-cols-12 md:items-end">
            <Reveal className="md:col-span-7">
              <p className="eyebrow mb-6">
                {VERIFICATION_LABELS[person.verification] ?? person.verification}
              </p>
              <h1 className="font-display text-5xl leading-[0.98] text-balance text-foreground md:text-7xl lg:text-8xl">
                {person.name}
              </h1>
              {person.role_title ? (
                <p className="mt-6 max-w-md text-lg leading-9 text-muted-foreground">
                  {person.role_title}
                </p>
              ) : null}
            </Reveal>

            <Reveal delay={120} className="md:col-span-5">
              <MetaList
                items={[
                  ...(person.birth_info
                    ? [{ label: "الميلاد", value: person.birth_info }]
                    : []),
                  ...(person.death_info ? [{ label: "الوفاة", value: person.death_info }] : []),
                  ...(location
                    ? [
                        {
                          label: "المنطقة",
                          value: (
                            <Link
                              to="/locations/$slug"
                              params={{ slug: location.slug }}
                              className="rounded-sm text-primary transition-colors hover:text-foreground"
                            >
                              {location.name}
                            </Link>
                          ),
                        },
                      ]
                    : []),
                  {
                    label: "درجة التوثيق",
                    value: VERIFICATION_LABELS[person.verification] ?? person.verification,
                  },
                ]}
              />
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ————— صورة واحدة، ثلاث نوافذ ————— */}
      {person.photo_url ? (
        <section className="border-b border-border py-14 md:py-20">
          <Container>
            <div className="grid gap-10 md:grid-cols-12">
              <div className="md:col-span-7">
                <MosaicImage
                  path={person.photo_url}
                  alt={person.name}
                  fragments={PORTRAIT_TRIPTYCH}
                  priority
                />
              </div>
              <Reveal delay={140} className="md:col-span-4 md:col-start-9 md:self-end">
                <p className="eyebrow mb-4">قراءة في الصورة</p>
                <p className="text-sm leading-8 text-muted-foreground">
                  ثلاث نوافذ على صورة واحدة: الوجه، وتفصيل من الهامش، وطرف من الخلفية — دون قصّ
                  الصورة الأصلية.
                </p>
              </Reveal>
            </div>
          </Container>
        </section>
      ) : null}

      {/* ————— السيرة ————— */}
      <section className="py-14 md:py-20">
        <Container>
          <div className="grid gap-12 md:grid-cols-12">
            <div className="md:col-span-7 md:col-start-1">
              {person.biography ? (
                <Reveal>
                  <SectionTitle eyebrow="سيرة">السيرة</SectionTitle>
                  <Prose className="mt-6">{person.biography}</Prose>
                </Reveal>
              ) : null}

              {person.contribution ? (
                <Reveal className="mt-14">
                  <SectionTitle eyebrow="الأثر">الإسهامات</SectionTitle>
                  <Prose className="mt-6">{person.contribution}</Prose>
                </Reveal>
              ) : null}

              {person.sources ? (
                <Reveal className="mt-14">
                  <SectionTitle eyebrow="التوثيق">المصادر</SectionTitle>
                  <p className="mt-6 whitespace-pre-line text-sm leading-8 text-muted-foreground">
                    {person.sources}
                  </p>
                </Reveal>
              ) : null}
            </div>

            <aside className="md:col-span-4 md:col-start-9">
              {articles.length > 0 ? (
                <Reveal>
                  <SectionTitle>مقالات مرتبطة</SectionTitle>
                  <ul className="mt-4 grid">
                    {articles.map((a: { id: string; slug: string; title: string } | null) =>
                      a ? (
                        <li key={a.id} className="border-b border-border last:border-0">
                          <Link
                            to="/articles/$slug"
                            params={{ slug: a.slug }}
                            className="block rounded-sm py-4 text-sm leading-7 text-foreground transition-colors hover:text-primary"
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

      {/* ————— مواد أرشيفية ————— */}
      {archive.length > 0 ? (
        <section className="border-t border-border py-14 md:py-20">
          <Container>
            <Reveal>
              <SectionTitle eyebrow="الذاكرة البصرية">مواد أرشيفية</SectionTitle>
            </Reveal>
          </Container>
          <div className="snap-rail mt-8 px-5 lg:px-10">
            {archive.map(
              (
                a: {
                  id: string;
                  title: string;
                  media_url: string | null;
                  alt_text: string | null;
                } | null,
                i: number,
              ) =>
                a ? (
                  <div key={a.id} className="w-[62vw] shrink-0 md:w-[24vw]">
                    <MediaImage
                      path={a.media_url}
                      alt={a.alt_text || a.title}
                      ratio={i % 3 === 1 ? "aspect-[3/4]" : "aspect-[4/5]"}
                      imgClassName="hover:scale-[1.03]"
                    />
                    <p className="mt-3 line-clamp-1 text-sm text-muted-foreground">{a.title}</p>
                  </div>
                ) : null,
            )}
          </div>
        </section>
      ) : null}

      <Container className="pb-24">
        <CommentsSection targetType="person" targetId={person.id} />
      </Container>
    </SiteLayout>
  );
}
