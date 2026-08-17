import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getArticle } from "@/lib/public.functions";
import { SiteLayout, Container, Crumbs, Prose } from "@/components/site/SiteLayout";
import { MediaImage } from "@/components/site/MediaImage";
import { Reveal } from "@/components/site/Reveal";
import { CommentsSection } from "@/components/site/CommentsSection";
import { VERIFICATION_LABELS } from "@/lib/constants";

export const Route = createFileRoute("/articles/$slug")({
  loader: async ({ params }) => {
    const data = await getArticle({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "المقال غير متاح | ذاكرة المناصير" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { article } = loaderData;
    const title = article.seo_title || `${article.title} | ذاكرة المناصير`;
    const description =
      article.seo_description || article.excerpt || "مقال من منصة ذاكرة المناصير.";
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
  component: ArticlePage,
});

function ArticlePage() {
  const { article, tags, locations, people, related } = Route.useLoaderData();
  const category = article.categories as { slug: string; name: string } | null;

  return (
    <SiteLayout>
      {/* ————— Masthead ————— */}
      <section className="border-b border-border bg-paper">
        <Container className="pb-14 pt-10 md:pb-20 md:pt-14">
          <Crumbs parent="المقالات" parentTo="/articles" current={article.title} />

          <Reveal className="mt-10 max-w-3xl">
            <p className="eyebrow mb-6">
              {[category?.name, VERIFICATION_LABELS[article.verification] ?? article.verification]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <h1 className="font-display text-4xl leading-[1.05] text-balance text-foreground md:text-6xl">
              {article.title}
            </h1>
            <p className="mt-6 text-sm text-muted-foreground">
              {[
                article.author,
                article.published_at
                  ? new Date(article.published_at).toLocaleDateString("ar-EG")
                  : null,
              ]
                .filter(Boolean)
                .join(" — ")}
            </p>
          </Reveal>
        </Container>
      </section>

      {/* ————— الصورة ————— */}
      {article.cover_image_url ? (
        <section className="border-b border-border py-12 md:py-16">
          <Container>
            <Reveal>
              <MediaImage
                path={article.cover_image_url}
                alt={article.title}
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
            <article className="md:col-span-7">
              {article.excerpt ? (
                <Reveal>
                  <p className="border-r-2 border-primary pr-5 text-lg leading-9 text-muted-foreground">
                    {article.excerpt}
                  </p>
                </Reveal>
              ) : null}

              {article.content ? (
                <Reveal delay={80} className="mt-8">
                  <Prose>{article.content}</Prose>
                </Reveal>
              ) : null}

              {tags.length > 0 ? (
                <Reveal delay={140} className="mt-10 flex flex-wrap gap-2">
                  {tags.map((t: { slug: string; name: string } | null) =>
                    t ? (
                      <span
                        key={t.slug}
                        className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
                      >
                        #{t.name}
                      </span>
                    ) : null,
                  )}
                </Reveal>
              ) : null}

              {article.sources ? (
                <Reveal className="mt-14">
                  <h2 className="font-display text-xl text-foreground">المصادر</h2>
                  <p className="mt-4 whitespace-pre-line text-sm leading-8 text-muted-foreground">
                    {article.sources}
                  </p>
                </Reveal>
              ) : null}
            </article>

            {locations.length > 0 || people.length > 0 ? (
              <aside className="md:col-span-4 md:col-start-9">
                <Reveal>
                  <h2 className="font-display text-xl text-foreground">مرتبط بـ</h2>
                  <ul className="mt-4 grid">
                    {locations.map((l: { slug: string; name: string } | null) =>
                      l ? (
                        <li key={l.slug} className="border-b border-border last:border-0">
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
                    {people.map((p: { slug: string; name: string } | null) =>
                      p ? (
                        <li key={p.slug} className="border-b border-border last:border-0">
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
              </aside>
            ) : null}
          </div>
        </Container>
      </section>

      {/* ————— مقالات ذات صلة ————— */}
      {related.length > 0 ? (
        <section className="border-t border-border py-14 md:py-20">
          <Container>
            <Reveal>
              <h2 className="font-display text-2xl text-foreground md:text-3xl">مقالات ذات صلة</h2>
            </Reveal>
            <div className="mt-8 grid gap-8 sm:grid-cols-3">
              {related.map(
                (
                  r: { id: string; slug: string; title: string; cover_image_url: string | null },
                  i: number,
                ) => (
                  <Reveal key={r.id} delay={i * 80}>
                    <Link to="/articles/$slug" params={{ slug: r.slug }} className="group block">
                      <MediaImage
                        path={r.cover_image_url}
                        alt={r.title}
                        ratio="aspect-[4/3]"
                        imgClassName="group-hover:scale-[1.04]"
                      />
                      <p className="mt-3 font-display text-base leading-tight text-foreground transition-colors group-hover:text-primary">
                        {r.title}
                      </p>
                    </Link>
                  </Reveal>
                ),
              )}
            </div>
          </Container>
        </section>
      ) : null}

      <Container className="pb-24 pt-14 md:pt-20">
        <CommentsSection targetType="article" targetId={article.id} />
      </Container>
    </SiteLayout>
  );
}
