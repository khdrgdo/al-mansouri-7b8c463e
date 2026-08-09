import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { listLocations } from "@/lib/public.functions";
import { SiteLayout, PageHeader, EmptyState } from "@/components/site/SiteLayout";
import { MediaImage } from "@/components/site/MediaImage";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type LocationRow = {
  id: string;
  slug: string;
  name: string;
  kind: string | null;
  description: string | null;
  cover_image_url: string | null;
  latitude: number | null;
  longitude: number | null;
  verification: string;
};

export const Route = createFileRoute("/locations/")({
  head: () => ({
    meta: [
      { title: "المناطق والقرى | ذاكرة المناصير" },
      {
        name: "description",
        content: "دليل مناطق وقرى ومواضع المناصير مع نبذة تاريخية وصور لكل موقع.",
      },
      { property: "og:title", content: "المناطق والقرى | ذاكرة المناصير" },
      { property: "og:description", content: "دليل مناطق وقرى المناصير." },
    ],
  }),
  loader: () => listLocations(),
  component: LocationsPage,
});

function LocationsPage() {
  const locations = Route.useLoaderData() as LocationRow[];
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<string | null>(null);

  const kinds = useMemo(
    () => Array.from(new Set(locations.map((l) => l.kind).filter(Boolean))) as string[],
    [locations],
  );

  const filtered = useMemo(
    () =>
      locations.filter((l) => {
        const matchesQ =
          !q.trim() ||
          l.name.includes(q.trim()) ||
          (l.description ?? "").includes(q.trim());
        const matchesKind = !kind || l.kind === kind;
        return matchesQ && matchesKind;
      }),
    [locations, q, kind],
  );

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="الجغرافيا"
        title="المناطق والقرى"
        description="تصفّح المواقع حسب النوع أو ابحث بالاسم. كل موقع يحتوي على نبذته وصوره والمقالات والشخصيات المرتبطة به."
      />

      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث باسم المنطقة أو القرية…"
            className="md:max-w-sm"
          />
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={kind === null ? "default" : "outline"}
              onClick={() => setKind(null)}
            >
              الكل
            </Button>
            {kinds.map((k) => (
              <Button
                key={k}
                size="sm"
                variant={kind === k ? "default" : "outline"}
                onClick={() => setKind(k)}
              >
                {k}
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-10">
          {filtered.length === 0 ? (
            <EmptyState
              title="لا توجد نتائج"
              description="لم تُضف مواقع بعد أو لا تطابق بحثك الحالي."
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((l) => (
                <Link
                  key={l.id}
                  to="/locations/$slug"
                  params={{ slug: l.slug }}
                  className="overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary"
                >
                  <MediaImage path={l.cover_image_url} alt={l.name} />
                  <div className="p-5">
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold text-foreground">{l.name}</h2>
                      {l.kind ? <Badge variant="secondary">{l.kind}</Badge> : null}
                    </div>
                    {l.description ? (
                      <p className="mt-2 line-clamp-3 text-sm leading-7 text-muted-foreground">
                        {l.description}
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
