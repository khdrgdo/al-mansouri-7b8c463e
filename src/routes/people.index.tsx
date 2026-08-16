import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { listPeople } from "@/lib/public.functions";
import { SiteLayout, PageHeader, EmptyState } from "@/components/site/SiteLayout";
import { MediaImage } from "@/components/site/MediaImage";
import { Reveal } from "@/components/site/Reveal";
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
        (p) => !q.trim() || p.name.includes(q.trim()) || (p.role_title ?? "").includes(q.trim()),
      ),
    [people, q],
  );

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="أعلام الذاكرة"
        title="الشخصيات"
        description="من أسهموا في تاريخ المنطقة وثقافتها. نرحّب بأي إضافة أو تصحيح موثّق عبر صفحة المساهمات."
      />
      <div className="mx-auto max-w-[1400px] px-5 py-14 lg:px-10">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث بالاسم أو الصفة…"
          className="md:max-w-sm"
        />

        <div className="mt-12">
          {filtered.length === 0 ? (
            <EmptyState title="لا توجد شخصيات مطابقة" />
          ) : (
            <div className="rule">
              {filtered.map((p, i) => (
                <Reveal key={p.id} delay={Math.min(i, 6) * 40}>
                  <Link
                    to="/people/$slug"
                    params={{ slug: p.slug }}
                    className="group flex items-center gap-5 rule border-b py-6 transition-colors last:border-b-0 hover:bg-secondary/30 md:gap-8 md:py-8"
                  >
                    <span className="hidden shrink-0 font-display text-sm text-muted-foreground md:block">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <MediaImage
                      path={p.photo_url}
                      alt={p.name}
                      ratio="aspect-square"
                      className="w-20 shrink-0 md:w-24"
                      imgClassName="group-hover:scale-[1.05]"
                    />
                    <div className="min-w-0 flex-1">
                      <h2 className="font-display text-xl text-foreground transition-colors group-hover:text-primary md:text-2xl">
                        {p.name}
                      </h2>
                      {p.role_title ? (
                        <p className="mt-1 text-sm text-primary">{p.role_title}</p>
                      ) : null}
                      {p.biography ? (
                        <p className="mt-2 line-clamp-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                          {p.biography}
                        </p>
                      ) : null}
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
