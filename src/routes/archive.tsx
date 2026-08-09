import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { listArchive } from "@/lib/public.functions";
import { SiteLayout, PageHeader, EmptyState } from "@/components/site/SiteLayout";
import { MediaImage } from "@/components/site/MediaImage";
import { CommentsSection } from "@/components/site/CommentsSection";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type ArchiveRow = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  media_url: string | null;
  media_type: string;
  alt_text: string | null;
  caption: string | null;
  item_date: string | null;
  category_id: string | null;
  source: string | null;
  contributor: string | null;
};
type CategoryRow = { id: string; slug: string; name: string };

export const Route = createFileRoute("/archive")({
  head: () => ({
    meta: [
      { title: "الأرشيف الرقمي | ذاكرة المناصير" },
      {
        name: "description",
        content: "صور ووثائق ومواد أرشيفية من ذاكرة المناصير، مع مصدر كل مادة والمساهم بها.",
      },
      { property: "og:title", content: "الأرشيف الرقمي | ذاكرة المناصير" },
      { property: "og:description", content: "صور ووثائق ومواد أرشيفية موثّقة." },
    ],
  }),
  loader: () => listArchive(),
  component: ArchivePage,
});

function ArchivePage() {
  const { items, categories } = Route.useLoaderData() as {
    items: ArchiveRow[];
    categories: CategoryRow[];
  };
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [active, setActive] = useState<ArchiveRow | null>(null);

  const filtered = useMemo(
    () =>
      items.filter((i) => {
        const matchesQ =
          !q.trim() || i.title.includes(q.trim()) || (i.description ?? "").includes(q.trim());
        return matchesQ && (!cat || i.category_id === cat);
      }),
    [items, q, cat],
  );

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="الأرشيف"
        title="الأرشيف الرقمي"
        description="صور قديمة ووثائق ومواد بصرية. اضغط على أي مادة لعرضها بالحجم الكامل مع بياناتها ومصدرها."
      />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث في الأرشيف…"
            className="md:max-w-sm"
          />
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant={cat === null ? "default" : "outline"} onClick={() => setCat(null)}>
              الكل
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
            <EmptyState
              title="الأرشيف فارغ حاليًا"
              description="يمكنك المساهمة بصورك ووثائقك عبر صفحة المساهمات."
            />
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {filtered.map((i) => (
                <button
                  key={i.id}
                  type="button"
                  onClick={() => setActive(i)}
                  className="overflow-hidden rounded-lg border border-border bg-card text-right transition-colors hover:border-primary"
                >
                  <MediaImage path={i.media_url} alt={i.alt_text || i.title} ratio="aspect-square" />
                  <p className="p-3 text-sm font-medium text-foreground">{i.title}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto" dir="rtl">
          {active ? (
            <>
              <DialogHeader className="text-right">
                <DialogTitle>{active.title}</DialogTitle>
                <DialogDescription>{active.caption || active.description || ""}</DialogDescription>
              </DialogHeader>
              <MediaImage
                path={active.media_url}
                alt={active.alt_text || active.title}
                className="rounded-lg"
                ratio="aspect-[4/3]"
              />
              <dl className="grid gap-2 text-sm text-muted-foreground">
                {active.item_date ? (
                  <div>
                    <dt className="inline font-semibold text-foreground">التاريخ: </dt>
                    <dd className="inline">{active.item_date}</dd>
                  </div>
                ) : null}
                {active.source ? (
                  <div>
                    <dt className="inline font-semibold text-foreground">المصدر: </dt>
                    <dd className="inline">{active.source}</dd>
                  </div>
                ) : null}
                {active.contributor ? (
                  <div>
                    <dt className="inline font-semibold text-foreground">المساهم: </dt>
                    <dd className="inline">{active.contributor}</dd>
                  </div>
                ) : null}
              </dl>
              <CommentsSection targetType="archive" targetId={active.id} />
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </SiteLayout>
  );
}
