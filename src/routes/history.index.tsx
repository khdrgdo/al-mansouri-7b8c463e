import { createFileRoute, Link } from "@tanstack/react-router";
import { listEvents } from "@/lib/public.functions";
import { SiteLayout, PageHeader, EmptyState } from "@/components/site/SiteLayout";
import { VERIFICATION_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

type EventRow = {
  id: string;
  slug: string;
  title: string;
  period: string | null;
  event_date: string | null;
  summary: string | null;
  cover_image_url: string | null;
  verification: string;
};

export const Route = createFileRoute("/history/")({
  head: () => ({
    meta: [
      { title: "التاريخ | ذاكرة المناصير" },
      {
        name: "description",
        content: "خط زمني للأحداث والمحطات التاريخية في ذاكرة المناصير، مرتبة زمنيًا مع مصادرها.",
      },
      { property: "og:title", content: "التاريخ | ذاكرة المناصير" },
      { property: "og:description", content: "خط زمني للأحداث والمحطات التاريخية." },
    ],
  }),
  loader: () => listEvents(),
  component: HistoryPage,
});

function HistoryPage() {
  const events = Route.useLoaderData() as EventRow[];

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="الخط الزمني"
        title="تاريخ المناصير"
        description="محطات وأحداث مرتبة زمنيًا. كل محطة موسومة بدرجة التوثيق: موثّقة بمصدر، أو رواية شفهية، أو قيد التوثيق."
      />

      <div className="mx-auto max-w-4xl px-4 py-14">
        {events.length === 0 ? (
          <EmptyState
            title="لم تُضف محطات تاريخية بعد"
            description="سيظهر الخط الزمني فور إضافة المحتوى الموثّق من قبل الإدارة."
          />
        ) : (
          <ol className="relative border-r-2 border-border pr-6">
            {events.map((e) => (
              <li key={e.id} className="relative pb-10 last:pb-0">
                <span className="absolute -right-[calc(1.5rem+7px)] top-2 h-3 w-3 rounded-full bg-primary ring-4 ring-background" />
                <Link
                  to="/history/$slug"
                  params={{ slug: e.slug }}
                  className="block rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {e.period ? (
                      <span className="text-sm font-semibold text-primary">{e.period}</span>
                    ) : null}
                    <Badge variant="secondary">
                      {VERIFICATION_LABELS[e.verification] ?? e.verification}
                    </Badge>
                  </div>
                  <h2 className="mt-2 text-xl font-bold text-foreground">{e.title}</h2>
                  {e.summary ? (
                    <p className="mt-2 text-sm leading-8 text-muted-foreground">{e.summary}</p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>
    </SiteLayout>
  );
}
