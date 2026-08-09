import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { globalSearch } from "@/lib/public.functions";
import { SiteLayout, PageHeader, EmptyState } from "@/components/site/SiteLayout";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "البحث | ذاكرة المناصير" },
      {
        name: "description",
        content: "ابحث في المقالات والأحداث والمناطق والشخصيات والأرشيف والوثائق في ذاكرة المناصير.",
      },
      { property: "og:title", content: "البحث | ذاكرة المناصير" },
      { property: "og:description", content: "بحث شامل في محتوى المنصة." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const [q, setQ] = useState("");
  const { data, isFetching } = useQuery({
    queryKey: ["search", q],
    enabled: q.trim().length >= 2,
    queryFn: () => globalSearch({ data: { q } }),
  });

  const groups = [
    { key: "articles", label: "المقالات", to: "/articles/$slug" as const },
    { key: "events", label: "الأحداث", to: "/history/$slug" as const },
    { key: "locations", label: "المناطق", to: "/locations/$slug" as const },
    { key: "people", label: "الشخصيات", to: "/people/$slug" as const },
  ];

  const total = data
    ? Object.values(data).reduce((sum, arr) => sum + (arr as unknown[]).length, 0)
    : 0;

  return (
    <SiteLayout>
      <PageHeader eyebrow="بحث" title="ابحث في ذاكرة المناصير" />
      <div className="mx-auto max-w-4xl px-4 py-12">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="اكتب كلمة للبحث (حرفان على الأقل)…"
          autoFocus
        />

        <div className="mt-10 grid gap-8">
          {isFetching ? <p className="text-sm text-muted-foreground">جارٍ البحث…</p> : null}
          {data && total === 0 && !isFetching ? <EmptyState title="لا توجد نتائج" /> : null}

          {data
            ? groups.map((g) => {
                const items = (data as Record<string, Array<Record<string, string>>>)[g.key] ?? [];
                if (items.length === 0) return null;
                return (
                  <section key={g.key}>
                    <h2 className="text-lg font-bold text-foreground">{g.label}</h2>
                    <ul className="mt-3 grid gap-2">
                      {items.map((item) => (
                        <li key={item["id"]}>
                          <Link
                            to={g.to}
                            params={{ slug: item["slug"]! }}
                            className="block rounded-lg border border-border bg-card p-4 text-sm font-medium text-foreground hover:border-primary"
                          >
                            {item["title"] ?? item["name"]}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })
            : null}

          {data && data.archive.length > 0 ? (
            <section>
              <h2 className="text-lg font-bold text-foreground">الأرشيف</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {data.archive.length.toLocaleString("ar-EG")} مادة مطابقة —{" "}
                <Link to="/archive" className="text-primary hover:underline">
                  تصفّح الأرشيف
                </Link>
              </p>
            </section>
          ) : null}
        </div>
      </div>
    </SiteLayout>
  );
}
