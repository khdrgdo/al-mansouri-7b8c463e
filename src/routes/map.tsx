import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense } from "react";
import { ClientOnly } from "@tanstack/react-router";
import { listMapLocations } from "@/lib/public.functions";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import type { MapPoint } from "@/components/site/LocationsMap";

const LocationsMap = lazy(() => import("@/components/site/LocationsMap"));

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "الخريطة التفاعلية | ذاكرة المناصير" },
      {
        name: "description",
        content: "خريطة تفاعلية تعرض مناطق وقرى ومواضع المناصير مع روابط صفحاتها التفصيلية.",
      },
      { property: "og:title", content: "الخريطة التفاعلية | ذاكرة المناصير" },
      { property: "og:description", content: "استكشف مواقع المناصير على الخريطة." },
    ],
  }),
  loader: () => listMapLocations(),
  component: MapPage,
});

function MapPage() {
  const points = Route.useLoaderData() as MapPoint[];

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="الجغرافيا"
        title="الخريطة التفاعلية"
        description="المواقع المسجَّلة بإحداثيات موثّقة. اضغط على أي علامة لعرض نبذة سريعة والانتقال لصفحة الموقع."
      />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <ClientOnly
          fallback={<div className="h-[70vh] min-h-[420px] w-full animate-pulse rounded-lg bg-muted" />}
        >
          <Suspense
            fallback={<div className="h-[70vh] min-h-[420px] w-full animate-pulse rounded-lg bg-muted" />}
          >
            <LocationsMap points={points} />
          </Suspense>
        </ClientOnly>
        <p className="mt-4 text-sm text-muted-foreground">
          عدد المواقع المعروضة: {points.length.toLocaleString("ar-EG")}
        </p>
      </div>
    </SiteLayout>
  );
}
