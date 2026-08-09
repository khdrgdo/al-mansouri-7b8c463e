import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, BookOpen, Images, FileText, Users, ArrowLeft } from "lucide-react";
import { getHomeData } from "@/lib/public.functions";
import { SiteLayout } from "@/components/site/SiteLayout";
import { MediaImage } from "@/components/site/MediaImage";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ذاكرة المناصير | أرشيف التاريخ والتراث والمناطق" },
      {
        name: "description",
        content:
          "منصة ذاكرة المناصير: تاريخ موثّق، مناطق وقرى، خريطة تفاعلية، أرشيف صور ووثائق، شخصيات، ومقالات ومساهمات الزوار.",
      },
      { property: "og:title", content: "ذاكرة المناصير | أرشيف التاريخ والتراث والمناطق" },
      {
        property: "og:description",
        content: "منصة ذاكرة المناصير: تاريخ موثّق، مناطق وقرى، خريطة تفاعلية، أرشيف صور ووثائق، شخصيات، ومقالات ومساهمات الزوار.",
      },
    ],
  }),
  loader: () => getHomeData(),
  component: HomePage,
});

const STAT_ITEMS = [
  { key: "locations", label: "منطقة وقرية", icon: MapPin },
  { key: "articles", label: "مقال", icon: BookOpen },
  { key: "images", label: "صورة أرشيفية", icon: Images },
  { key: "documents", label: "وثيقة", icon: FileText },
  { key: "people", label: "شخصية", icon: Users },
] as const;

function HomePage() {
  const { stats, latestArticles, timeline } = Route.useLoaderData();

  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-border bg-nile text-nile-foreground">
        <div className="absolute inset-0 bg-paper opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-4 py-20 md:py-28">
          <p className="mb-4 text-sm font-medium tracking-wide text-gold">
            منصة رقمية لحفظ الذاكرة الجمعية
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight text-balance md:text-5xl">
            ذاكرة المناصير: التاريخ، الأرض، الناس
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-nile-foreground/85 md:text-lg">
            نجمع ونوثّق تاريخ المناصير ومناطقهم وقراهم وتراثهم وصورهم ووثائقهم، ونفتح الباب لكل من
            يملك معلومة أو صورة أو رواية أن يساهم في حفظها للأجيال.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/history">
              <Button size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90">
                ابدأ من التاريخ
              </Button>
            </Link>
            <Link to="/contribute">
              <Button
                size="lg"
                variant="outline"
                className="border-nile-foreground/40 bg-transparent text-nile-foreground hover:bg-nile-foreground/10"
              >
                ساهم بمعلومة أو صورة
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px overflow-hidden px-4 py-10 md:grid-cols-5">
          {STAT_ITEMS.map(({ key, label, icon: Icon }) => (
            <div key={key} className="px-4 py-4 text-center">
              <Icon className="mx-auto h-6 w-6 text-primary" />
              <p className="mt-3 text-2xl font-bold text-foreground">
                {stats[key].toLocaleString("ar-EG")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-bold text-foreground">أقسام المنصة</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { to: "/history", title: "التاريخ", desc: "خط زمني للأحداث والمحطات المفصلية." },
            { to: "/locations", title: "المناطق والقرى", desc: "دليل المواقع وتاريخ كل منطقة." },
            { to: "/map", title: "الخريطة التفاعلية", desc: "استكشف المواقع على الخريطة." },
            { to: "/archive", title: "الأرشيف الرقمي", desc: "صور ووثائق ومواد أرشيفية." },
            { to: "/people", title: "الشخصيات", desc: "سير ومساهمات شخصيات من المنطقة." },
            { to: "/articles", title: "المقالات", desc: "أبحاث ومقالات ثقافية وتاريخية." },
          ].map((c) => (
            <Link
              key={c.to}
              to={c.to}
              className="group rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary"
            >
              <h3 className="text-lg font-semibold text-foreground">{c.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{c.desc}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                تصفّح
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {timeline.length > 0 ? (
        <section className="border-y border-border bg-secondary/50">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-2xl font-bold text-foreground">محطات من التاريخ</h2>
              <Link to="/history" className="text-sm font-medium text-primary hover:underline">
                كل المحطات
              </Link>
            </div>
            <ol className="mt-8 grid gap-5 md:grid-cols-2">
              {timeline.map((e: { id: string; slug: string; title: string; period: string | null; summary: string | null }) => (
                <li key={e.id}>
                  <Link
                    to="/history/$slug"
                    params={{ slug: e.slug }}
                    className="block rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary"
                  >
                    <p className="text-xs font-medium text-gold-foreground/80">{e.period}</p>
                    <h3 className="mt-1 text-lg font-semibold text-foreground">{e.title}</h3>
                    {e.summary ? (
                      <p className="mt-2 line-clamp-2 text-sm leading-7 text-muted-foreground">
                        {e.summary}
                      </p>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>
      ) : null}

      {latestArticles.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-bold text-foreground">أحدث المقالات</h2>
            <Link to="/articles" className="text-sm font-medium text-primary hover:underline">
              كل المقالات
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latestArticles.map((a: { id: string; slug: string; title: string; excerpt: string | null; cover_image_url: string | null }) => (
              <Link
                key={a.id}
                to="/articles/$slug"
                params={{ slug: a.slug }}
                className="overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary"
              >
                <MediaImage path={a.cover_image_url} alt={a.title} />
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-foreground">{a.title}</h3>
                  {a.excerpt ? (
                    <p className="mt-2 line-clamp-3 text-sm leading-7 text-muted-foreground">
                      {a.excerpt}
                    </p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="rounded-xl border border-border bg-card bg-paper p-8 text-center md:p-12">
          <h2 className="text-2xl font-bold text-foreground">عندك صورة أو وثيقة أو رواية؟</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-8 text-muted-foreground">
            كل مساهمة تُراجع من فريق التوثيق قبل النشر، وتُنسب لصاحبها. لا نضيف معلومة دون مصدر أو
            إشارة واضحة إلى أنها رواية شفهية.
          </p>
          <Link to="/contribute" className="mt-6 inline-block">
            <Button size="lg">أرسل مساهمتك</Button>
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
