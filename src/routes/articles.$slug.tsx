import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getArticle } from "@/lib/public.functions";
import { SiteLayout } from "@/components/site/SiteLayout";
import { MediaImage } from "@/components/site/MediaImage";
import { CommentsSection } from "@/components/site/CommentsSection";
import { VERIFICATION_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

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
      <article className="mx-auto max-w-3xl px-4 py-12">
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link to="/articles" className="hover:text-primary">
            المقالات
          </Link>
          <span className="px-2">/</span>
          <span>{article.title}</span>
        </nav>

        <div className="flex flex-wrap items-center gap-2">
          {category ? <Badge variant="secondary">{category.name}</Badge> : null}
          <Badge variant="outline">
            {VERIFICATION_LABELS[article.verification] ?? article.verification}
          </Badge>
        </div>

        <h1 className="mt-3 text-3xl font-bold text-balance text-foreground md:text-4xl">
          {article.title}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {[
            article.author,
            article.published_at
              ? new Date(article.published_at).toLocaleDateString("ar-EG")
              : null,
          ]
            .filter(Boolean)
            .join(" — ")}
        </p>

        {article.cover_image_url ? (
          <MediaImage
            path={article.cover_image_url}
            alt={article.title}
            className="mt-8 rounded-lg"
            ratio="aspect-[16/9]"
          />
        ) : null}

        {article.excerpt ? (
          <p className="mt-8 border-r-4 border-primary pr-4 text-lg leading-9 text-muted-foreground">
            {article.excerpt}
          </p>
        ) : null}

        {article.content ? (
          <div className="mt-8 whitespace-pre-line text-base leading-9 text-foreground">
            {article.content}
          </div>
        ) : null}

        {tags.length > 0 ? (
          <div className="mt-8 flex flex-wrap gap-2">
            {tags.map((t: { slug: string; name: string } | null) =>
              t ? (
                <Badge key={t.slug} variant="secondary">
                  #{t.name}
                </Badge>
              ) : null,
            )}
          </div>
        ) : null}

        {locations.length > 0 || people.length > 0 ? (
          <section className="mt-8 rounded-lg border border-border bg-secondary/50 p-5">
            <h2 className="text-sm font-semibold text-foreground">مرتبط بـ</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {locations.map((l: { slug: string; name: string } | null) =>
                l ? (
                  <Link key={l.slug} to="/locations/$slug" params={{ slug: l.slug }}>
                    <Badge variant="outline">{l.name}</Badge>
                  </Link>
                ) : null,
              )}
              {people.map((p: { slug: string; name: string } | null) =>
                p ? (
                  <Link key={p.slug} to="/people/$slug" params={{ slug: p.slug }}>
                    <Badge variant="outline">{p.name}</Badge>
                  </Link>
                ) : null,
              )}
            </div>
          </section>
        ) : null}

        {article.sources ? (
          <section className="mt-8 rounded-lg border border-border bg-secondary/50 p-5">
            <h2 className="text-sm font-semibold text-foreground">المصادر</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-8 text-muted-foreground">
              {article.sources}
            </p>
          </section>
        ) : null}

        {related.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-foreground">مقالات ذات صلة</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {related.map((r: { id: string; slug: string; title: string; cover_image_url: string | null }) => (
                <Link
                  key={r.id}
                  to="/articles/$slug"
                  params={{ slug: r.slug }}
                  className="overflow-hidden rounded-lg border border-border bg-card hover:border-primary"
                >
                  <MediaImage path={r.cover_image_url} alt={r.title} />
                  <p className="p-3 text-sm font-medium text-foreground">{r.title}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <CommentsSection targetType="article" targetId={article.id} />
      </article>
    </SiteLayout>
  );
}
