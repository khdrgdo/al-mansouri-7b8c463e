import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { listArticles } from "@/lib/public.functions";
import { SiteLayout, PageHeader, EmptyState } from "@/components/site/SiteLayout";
import { MediaImage } from "@/components/site/MediaImage";
import { Reveal } from "@/components/site/Reveal";
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
      <div className="mx-auto max-w-[1400px] px-5 py-14 lg:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث في المقالات…"
            className="md:max-w-sm"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={cat === null ? "default" : "outline"}
              onClick={() => setCat(null)}
            >
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

        <div className="mt-12">
          {filtered.length === 0 ? (
            <EmptyState title="لا توجد مقالات منشورة مطابقة" />
          ) : (
            <div className="rule">
              {filtered.map((a, i) => (
                <Reveal key={a.id} delay={Math.min(i, 6) * 40}>
                  <Link
                    to="/articles/$slug"
                    params={{ slug: a.slug }}
                    className="group grid grid-cols-[auto_1fr] items-center gap-5 rule border-b py-6 transition-colors last:border-b-0 hover:bg-secondary/30 md:grid-cols-[auto_10rem_1fr_auto] md:gap-8 md:py-8"
                  >
                    <span className="hidden font-display text-sm text-muted-foreground md:block">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <MediaImage
                      path={a.cover_image_url}
                      alt={a.title}
                      ratio="aspect-[4/3]"
                      className="w-24 md:w-40"
                      imgClassName="group-hover:scale-[1.05]"
                    />
                    <div className="min-w-0">
                      <h2 className="font-display text-xl text-foreground transition-colors group-hover:text-primary md:text-2xl">
                        {a.title}
                      </h2>
                      {a.excerpt ? (
                        <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                          {a.excerpt}
                        </p>
                      ) : null}
                      <p className="mt-3 text-xs text-muted-foreground">
                        {[
                          a.author,
                          a.published_at
                            ? new Date(a.published_at).toLocaleDateString("ar-EG")
                            : null,
                        ]
                          .filter(Boolean)
                          .join(" — ")}
                      </p>
                    </div>
                    <ArrowLeft className="hidden h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-1 group-hover:text-primary md:block" />
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
