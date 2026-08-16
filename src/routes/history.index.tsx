import { createFileRoute, Link } from "@tanstack/react-router";
import { listEvents } from "@/lib/public.functions";
import { SiteLayout, PageHeader, EmptyState, Container } from "@/components/site/SiteLayout";
import { MediaImage } from "@/components/site/MediaImage";
import { Reveal } from "@/components/site/Reveal";
import { VERIFICATION_LABELS } from "@/lib/constants";

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

      <Container className="py-14 md:py-20">
        {events.length === 0 ? (
          <EmptyState
            title="لم تُضف محطات تاريخية بعد"
            description="سيظهر الخط الزمني فور إضافة المحتوى الموثّق من قبل الإدارة."
          />
        ) : (
          <ol className="rule border-t">
            {events.map((e, i) => (
              <li key={e.id} className="border-b border-border">
                <Reveal delay={Math.min(i, 4) * 60}>
                  <Link
                    to="/history/$slug"
                    params={{ slug: e.slug }}
                    className="group grid items-start gap-6 rounded-sm py-8 md:grid-cols-12 md:gap-8 md:py-12"
                  >
                    <div className="md:col-span-2">
                      <p className="font-display text-lg text-primary md:text-2xl">
                        {e.period ?? "—"}
                      </p>
                      <p className="mt-2 text-[11px] tracking-[0.16em] text-muted-foreground">
                        {VERIFICATION_LABELS[e.verification] ?? e.verification}
                      </p>
                    </div>

                    <div className="md:col-span-6">
                      <h2 className="font-display text-2xl leading-tight text-foreground transition-colors group-hover:text-primary md:text-4xl">
                        {e.title}
                      </h2>
                      {e.summary ? (
                        <p className="mt-4 max-w-xl text-sm leading-8 text-muted-foreground">
                          {e.summary}
                        </p>
                      ) : null}
                    </div>

                    <div className="md:col-span-3 md:col-start-10">
                      <MediaImage
                        path={e.cover_image_url}
                        alt={e.title}
                        ratio="aspect-[4/3]"
                        position={i % 2 === 0 ? "50% 35%" : "50% 65%"}
                        imgClassName="group-hover:scale-[1.04]"
                      />
                    </div>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ol>
        )}
      </Container>
    </SiteLayout>
  );
}
