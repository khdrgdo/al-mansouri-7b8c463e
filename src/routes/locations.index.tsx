import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { listLocations } from "@/lib/public.functions";
import { SiteLayout, PageHeader, EmptyState } from "@/components/site/SiteLayout";
import { MediaImage } from "@/components/site/MediaImage";
import { Reveal } from "@/components/site/Reveal";
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
          !q.trim() || l.name.includes(q.trim()) || (l.description ?? "").includes(q.trim());
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

      <div className="mx-auto max-w-[1400px] px-5 py-14 lg:px-10">
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

        <div className="mt-12">
          {filtered.length === 0 ? (
            <EmptyState
              title="لا توجد نتائج"
              description="لم تُضف مواقع بعد أو لا تطابق بحثك الحالي."
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((l, i) => (
                <Reveal
                  key={l.id}
                  delay={Math.min(i, 8) * 40}
                  {...(i % 5 === 0 ? { className: "sm:col-span-2" } : {})}
                >
                  <Link
                    to="/locations/$slug"
                    params={{ slug: l.slug }}
                    className="group block overflow-hidden"
                  >
                    <MediaImage
                      path={l.cover_image_url}
                      alt={l.name}
                      ratio={i % 5 === 0 ? "aspect-[21/9]" : "aspect-[4/3]"}
                      imgClassName="group-hover:scale-[1.04]"
                    />
                    <div className="pt-4">
                      <div className="flex items-center gap-2">
                        <h2 className="font-display text-xl text-foreground transition-colors group-hover:text-primary">
                          {l.name}
                        </h2>
                        {l.kind ? <Badge variant="secondary">{l.kind}</Badge> : null}
                      </div>
                      {l.description ? (
                        <p className="mt-2 line-clamp-2 text-sm leading-7 text-muted-foreground">
                          {l.description}
                        </p>
                      ) : null}
                    </div>
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
