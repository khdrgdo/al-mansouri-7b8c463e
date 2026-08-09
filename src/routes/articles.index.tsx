import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { listArticles } from "@/lib/public.functions";
import { SiteLayout, PageHeader, EmptyState } from "@/components/site/SiteLayout";
import { MediaImage } from "@/components/site/MediaImage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type ArticleRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  author: string | null;
  published_at: string | null;
  category_id: string | null;
  verification: string;
};
type CategoryRow = { id: string; slug: string; name: string };

export const Route = createFileRoute("/articles/")({
  head: () => ({
    meta: [
      { title: "المقالات | ذاكرة المناصير" },
      {
        name: "description",
        content: "مقالات وأبحاث عن تاريخ المناصير وتراثهم وثقافتهم، مصنّفة وقابلة للبحث.",
      },
      { property: "og:title", content: "المقالات | ذاكرة المناصير" },
      { property: "og:description", content: "مقالات وأبحاث عن تاريخ المناصير وتراثهم." },
    ],
  }),
  loader: () => listArticles(),
  component: ArticlesPage,
});

function ArticlesPage() {
  const { articles, categories } = Route.useLoaderData() as {
    articles: ArticleRow[];
    categories: CategoryRow[];
  };
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      articles.filter((a) => {
        const matchesQ =
          !q.trim() || a.title.includes(q.trim()) || (a.excerpt ?? "").includes(q.trim());
        const matchesCat = !cat || a.category_id === cat;
        return matchesQ && matchesCat;
      }),
    [articles, q, cat],
  );

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="المكتبة"
        title="المقالات والأبحاث"
        description="محتوى تحريري يوثّق التاريخ والتراث والعادات. كل مقال يذكر مصادره وكاتبه."
      />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث في المقالات…"
            className="md:max-w-sm"
          />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant={cat === null ? "default" : "outline"} onClick={() => setCat(null)}>
              كل التصنيفات
            </Button>
            {categories.map((c) => (
              <Button
                key={c.id}
                size="sm"
                variant={cat === c.id ? "default" : "outline"}
                onClick={() => setCat(c.id)}
              >
                {c.name}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-10">
          {filtered.length === 0 ? (
            <EmptyState title="لا توجد مقالات منشورة مطابقة" />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((a) => (
                <Link
                  key={a.id}
                  to="/articles/$slug"
                  params={{ slug: a.slug }}
                  className="overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary"
                >
                  <MediaImage path={a.cover_image_url} alt={a.title} />
                  <div className="p-5">
                    <h2 className="text-lg font-semibold text-foreground">{a.title}</h2>
                    {a.excerpt ? (
                      <p className="mt-2 line-clamp-3 text-sm leading-7 text-muted-foreground">
                        {a.excerpt}
                      </p>
                    ) : null}
                    <p className="mt-3 text-xs text-muted-foreground">
                      {[a.author, a.published_at ? new Date(a.published_at).toLocaleDateString("ar-EG") : null]
                        .filter(Boolean)
                        .join(" — ")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
