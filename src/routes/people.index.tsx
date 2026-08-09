import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { listPeople } from "@/lib/public.functions";
import { SiteLayout, PageHeader, EmptyState } from "@/components/site/SiteLayout";
import { MediaImage } from "@/components/site/MediaImage";
import { Input } from "@/components/ui/input";

type PersonRow = {
  id: string;
  slug: string;
  name: string;
  photo_url: string | null;
  role_title: string | null;
  biography: string | null;
  verification: string;
};

export const Route = createFileRoute("/people/")({
  head: () => ({
    meta: [
      { title: "الشخصيات | ذاكرة المناصير" },
      {
        name: "description",
        content: "سير ومساهمات شخصيات من المناصير، موثّقة بمصادرها أو موسومة كروايات شفهية.",
      },
      { property: "og:title", content: "الشخصيات | ذاكرة المناصير" },
      { property: "og:description", content: "سير ومساهمات شخصيات من المناصير." },
    ],
  }),
  loader: () => listPeople(),
  component: PeoplePage,
});

function PeoplePage() {
  const people = Route.useLoaderData() as PersonRow[];
  const [q, setQ] = useState("");

  const filtered = useMemo(
    () =>
      people.filter(
        (p) =>
          !q.trim() || p.name.includes(q.trim()) || (p.role_title ?? "").includes(q.trim()),
      ),
    [people, q],
  );

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="الناس"
        title="الشخصيات"
        description="من أسهموا في تاريخ المنطقة وثقافتها. نرحّب بأي إضافة أو تصحيح موثّق عبر صفحة المساهمات."
      />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث بالاسم أو الصفة…"
          className="md:max-w-sm"
        />

        <div className="mt-10">
          {filtered.length === 0 ? (
            <EmptyState title="لا توجد شخصيات مطابقة" />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => (
                <Link
                  key={p.id}
                  to="/people/$slug"
                  params={{ slug: p.slug }}
                  className="overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary"
                >
                  <MediaImage path={p.photo_url} alt={p.name} ratio="aspect-[4/3]" />
                  <div className="p-5">
                    <h2 className="text-lg font-semibold text-foreground">{p.name}</h2>
                    {p.role_title ? (
                      <p className="mt-1 text-sm text-primary">{p.role_title}</p>
                    ) : null}
                    {p.biography ? (
                      <p className="mt-2 line-clamp-3 text-sm leading-7 text-muted-foreground">
                        {p.biography}
                      </p>
                    ) : null}
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
