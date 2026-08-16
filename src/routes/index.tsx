import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { getHomeData } from "@/lib/public.functions";
import { SiteLayout } from "@/components/site/SiteLayout";
import { MediaImage } from "@/components/site/MediaImage";
import { Reveal, useParallax } from "@/components/site/Reveal";
import { Button } from "@/components/ui/button";
import heroArchive from "@/assets/hero-archive.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ذاكرة المناصير | أرشيف رقمي للتاريخ والتراث" },
      {
        name: "description",
        content:
          "أرشيف رقمي ثقافي وتاريخي للمناصير: شخصيات، مناطق، أحداث، ووثائق موثّقة بمصادرها أو موسومة كروايات شفهية.",
      },
      { property: "og:title", content: "ذاكرة المناصير | أرشيف رقمي للتاريخ والتراث" },
      {
        property: "og:description",
        content: "أرشيف رقمي ثقافي وتاريخي للمناصير: شخصيات، مناطق، أحداث، ووثائق.",
      },
    ],
  }),
  loader: () => getHomeData(),
  component: HomePage,
});

type Person = {
  id: string;
  slug: string;
  name: string;
  role_title: string | null;
  biography: string | null;
  photo_url: string | null;
};
type LocationRow = { id: string; slug: string; name: string; kind: string };
type ArchiveRow = {
  id: string;
  slug: string;
  title: string;
  media_url: string | null;
  media_type: string;
  alt_text: string | null;
};
type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
};
type Sponsor = {
  id: string;
  advertiser_name: string;
  title: string;
  description: string | null;
  image_url: string | null;
  website: string | null;
  phone: string | null;
} | null;

function HomePage() {
  const { latestArticles, timeline, featuredPeople, featuredLocations, featuredArchive, sponsor } =
    Route.useLoaderData() as {
      latestArticles: Article[];
      timeline: {
        id: string;
        slug: string;
        title: string;
        period: string | null;
        summary: string | null;
      }[];
      featuredPeople: Person[];
      featuredLocations: LocationRow[];
      featuredArchive: ArchiveRow[];
      sponsor: Sponsor;
    };

  const parallaxRef = useParallax(0.06);

  return (
    <SiteLayout>
      {/* ————— Hero ————— */}
      <section className="relative overflow-hidden bg-ink text-ink-foreground">
        <div
          ref={parallaxRef}
          className="pointer-events-none absolute inset-y-[-8%] left-[8%] right-[-18%] md:left-[22%]"
          aria-hidden
        >
          <img
            src={heroArchive}
            alt=""
            className="h-full w-full object-cover opacity-70"
            style={{ objectPosition: "45% 35%" }}
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-ink/10 via-ink/55 to-ink" />
        </div>
        <div
          className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent"
          aria-hidden
        />

        <div className="relative mx-auto flex min-h-[86vh] max-w-[1400px] flex-col justify-end px-5 pb-16 pt-40 md:min-h-[92vh] md:pb-24 lg:px-10">
          <Reveal>
            <p className="eyebrow mb-6 text-gold before:bg-gold">منصوري موقد ناارنا</p>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="font-display text-[18vw] leading-[0.88] tracking-tight text-ink-foreground sm:text-[15vw] md:text-[11rem] lg:text-[13rem]">
              المناصير
            </h1>
          </Reveal>
          <Reveal delay={160}>
            <div className="mt-8 flex flex-col items-start gap-6 md:mt-10 md:flex-row md:items-end md:justify-between">
              <p className="max-w-md text-lg leading-9 text-ink-foreground/80 md:text-xl">
                ذاكرةٌ تُروى ولا تُنسى — أرشيف رقمي يجمع تاريخ المناصير وأرضهم وناسهم في مكان واحد.
              </p>
              <Link
                to="/history"
                className="group inline-flex shrink-0 items-center gap-3 border-b border-gold pb-1 text-base font-medium text-gold transition-colors hover:text-ink-foreground"
              >
                استكشف التاريخ
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ————— الشخصيات البارزة ————— */}
      {featuredPeople.length > 0 ? (
        <section className="border-b border-border py-20 md:py-28">
          <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
            <Reveal className="mb-14 flex flex-col gap-3 md:mb-20 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="eyebrow mb-4">أعلام الذاكرة</p>
                <h2 className="font-display text-4xl leading-[1.05] text-foreground md:text-6xl">
                  الشخصيات البارزة
                </h2>
              </div>
              <p className="max-w-xs text-sm leading-8 text-muted-foreground">
                شخصيات صنعت جزءًا من تاريخ المناصير.
              </p>
            </Reveal>

            {/* Desktop: asymmetric editorial composition */}
            <div className="hidden gap-6 md:grid md:grid-cols-12">
              {featuredPeople.slice(0, 4).map((p, i) => (
                <PersonTile key={p.id} person={p} index={i} />
              ))}
            </div>

            {/* Mobile: horizontal snap rail */}
            <div className="snap-rail md:hidden">
              {featuredPeople.slice(0, 4).map((p, i) => (
                <Link
                  key={p.id}
                  to="/people/$slug"
                  params={{ slug: p.slug }}
                  className="group block w-[78vw] shrink-0"
                >
                  <MediaImage
                    path={p.photo_url}
                    alt={p.name}
                    ratio="aspect-[3/4]"
                    className="rounded-sm"
                  />
                  <div className="mt-4 flex items-start gap-3">
                    <span className="font-display text-sm text-primary">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="font-display text-xl text-foreground">{p.name}</h3>
                      {p.role_title ? (
                        <p className="mt-1 text-sm text-muted-foreground">{p.role_title}</p>
                      ) : null}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <Reveal className="mt-14 md:mt-20">
              <Link
                to="/people"
                className="group inline-flex items-center gap-3 text-sm font-medium text-foreground"
              >
                <span className="border-b border-foreground/30 pb-1 transition-colors group-hover:border-primary group-hover:text-primary">
                  كل الشخصيات
                </span>
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              </Link>
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* ————— مساحة الراعي ————— */}
      {sponsor ? (
        <section className="border-b border-border bg-secondary/40 py-10">
          <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
            <Reveal>
              <p className="mb-4 text-[11px] tracking-[0.2em] text-muted-foreground">
                هل ترغب في دعم أرشيف المناصير؟
              </p>
              <div className="flex flex-wrap items-center gap-5 rounded-sm border border-border bg-card px-5 py-4">
                {sponsor.image_url ? (
                  <MediaImage
                    path={sponsor.image_url}
                    alt={sponsor.advertiser_name}
                    ratio="aspect-square"
                    grain={false}
                    className="h-14 w-14 shrink-0 rounded-sm"
                  />
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {sponsor.advertiser_name} · {sponsor.title}
                  </p>
                  {sponsor.description ? (
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {sponsor.description}
                    </p>
                  ) : null}
                </div>
                {sponsor.website ? (
                  <a
                    href={sponsor.website}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="shrink-0 border-b border-primary pb-0.5 text-xs font-medium text-primary"
                  >
                    زيارة الموقع
                  </a>
                ) : null}
              </div>
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* ————— التاريخ ————— */}
      <section className="border-b border-border py-20 md:py-28">
        <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
          <div className="grid gap-10 md:grid-cols-12 md:items-end">
            <Reveal className="md:col-span-7">
              <p className="eyebrow mb-5">التاريخ</p>
              <h2 className="font-display text-4xl leading-[1.05] text-foreground md:text-6xl">
                من الجذور إلى اليوم
              </h2>
              <p className="mt-6 max-w-md text-base leading-9 text-muted-foreground">
                محطات وأحداث موثّقة تروي كيف تشكّل تاريخ المناصير جيلًا بعد جيل.
              </p>
              <Link
                to="/history"
                className="group mt-8 inline-flex items-center gap-3 text-sm font-medium text-primary"
              >
                اكتشف التاريخ
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              </Link>
            </Reveal>

            {timeline.length > 0 ? (
              <Reveal delay={100} className="md:col-span-5">
                <ol className="grid gap-0 rule">
                  {timeline.slice(0, 4).map((e) => (
                    <li
                      key={e.id}
                      className="rule border-b py-5 first:pt-0 last:border-b-0 last:pb-0"
                    >
                      <Link to="/history/$slug" params={{ slug: e.slug }} className="group block">
                        <p className="text-xs font-medium text-primary">{e.period}</p>
                        <h3 className="mt-1 font-display text-lg text-foreground transition-colors group-hover:text-primary">
                          {e.title}
                        </h3>
                      </Link>
                    </li>
                  ))}
                </ol>
              </Reveal>
            ) : null}
          </div>
        </div>
      </section>

      {/* ————— المناطق ————— */}
      {featuredLocations.length > 0 ? (
        <section className="border-b border-border bg-secondary/30 py-20 md:py-28">
          <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
            <Reveal className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <h2 className="font-display text-4xl leading-[1.05] text-foreground md:text-6xl">
                المناطق والقرى
              </h2>
              <Link
                to="/locations"
                className="group inline-flex items-center gap-3 text-sm font-medium text-primary"
              >
                استكشف المناطق
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              </Link>
            </Reveal>
            <Reveal delay={80} className="flex flex-wrap gap-x-3 gap-y-4">
              {featuredLocations.map((loc) => (
                <Link
                  key={loc.id}
                  to="/locations/$slug"
                  params={{ slug: loc.slug }}
                  className="rounded-full border border-border bg-card px-5 py-2.5 text-sm text-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  {loc.name}
                </Link>
              ))}
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* ————— الأرشيف ————— */}
      {featuredArchive.length > 0 ? (
        <section className="border-b border-border py-20 md:py-28">
          <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
            <Reveal className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="eyebrow mb-4">الذاكرة البصرية</p>
                <h2 className="font-display text-4xl leading-[1.05] text-foreground md:text-6xl">
                  الأرشيف الرقمي
                </h2>
              </div>
              <Link
                to="/archive"
                className="group inline-flex items-center gap-3 text-sm font-medium text-primary"
              >
                تصفّح الأرشيف
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              </Link>
            </Reveal>
          </div>
          <Reveal delay={80} className="snap-rail px-5 lg:px-10">
            {featuredArchive.map((item, i) => (
              <Link
                key={item.id}
                to="/archive"
                className="group block w-[62vw] shrink-0 md:w-[26vw]"
              >
                <MediaImage
                  path={item.media_url}
                  alt={item.alt_text ?? item.title}
                  ratio={i % 3 === 1 ? "aspect-[3/4]" : "aspect-[4/5]"}
                  imgClassName="group-hover:scale-[1.04]"
                />
                <p className="mt-3 line-clamp-1 text-sm text-muted-foreground">{item.title}</p>
              </Link>
            ))}
          </Reveal>
        </section>
      ) : null}

      {/* ————— المقالات ————— */}
      {latestArticles.length > 0 ? (
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
            <Reveal className="mb-12 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <h2 className="font-display text-4xl leading-[1.05] text-foreground md:text-6xl">
                أحدث المقالات
              </h2>
              <Link
                to="/articles"
                className="group inline-flex items-center gap-3 text-sm font-medium text-primary"
              >
                كل المقالات
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              </Link>
            </Reveal>

            <div className="grid gap-8 md:grid-cols-12">
              {latestArticles[0] ? (
                <Reveal className="md:col-span-7">
                  <Link
                    to="/articles/$slug"
                    params={{ slug: latestArticles[0].slug }}
                    className="group block"
                  >
                    <MediaImage
                      path={latestArticles[0].cover_image_url}
                      alt={latestArticles[0].title}
                      ratio="aspect-[16/10]"
                      imgClassName="group-hover:scale-[1.03]"
                    />
                    <h3 className="mt-6 font-display text-2xl leading-tight text-foreground transition-colors group-hover:text-primary md:text-3xl">
                      {latestArticles[0].title}
                    </h3>
                    {latestArticles[0].excerpt ? (
                      <p className="mt-3 line-clamp-2 max-w-lg text-sm leading-8 text-muted-foreground">
                        {latestArticles[0].excerpt}
                      </p>
                    ) : null}
                  </Link>
                </Reveal>
              ) : null}

              <div className="grid gap-8 md:col-span-5">
                {latestArticles.slice(1, 3).map((a, i) => (
                  <Reveal key={a.id} delay={100 + i * 80}>
                    <Link
                      to="/articles/$slug"
                      params={{ slug: a.slug }}
                      className="group flex gap-4"
                    >
                      <MediaImage
                        path={a.cover_image_url}
                        alt={a.title}
                        ratio="aspect-square"
                        className="w-28 shrink-0 md:w-32"
                      />
                      <div className="min-w-0">
                        <h3 className="font-display text-lg leading-tight text-foreground transition-colors group-hover:text-primary">
                          {a.title}
                        </h3>
                        {a.excerpt ? (
                          <p className="mt-2 line-clamp-2 text-sm leading-7 text-muted-foreground">
                            {a.excerpt}
                          </p>
                        ) : null}
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* ————— دعوة للمساهمة ————— */}
      <section className="border-t border-border bg-ink py-20 text-ink-foreground md:py-28">
        <Reveal className="mx-auto max-w-[1400px] px-5 text-center lg:px-10">
          <h2 className="font-display text-3xl leading-[1.15] text-balance md:text-5xl">
            عندك صورة أو وثيقة أو رواية؟
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-8 text-ink-foreground/70">
            كل مساهمة تُراجع من فريق التوثيق قبل النشر، وتُنسب لصاحبها. لا نضيف معلومة دون مصدر أو
            إشارة واضحة إلى أنها رواية شفهية.
          </p>
          <Link to="/contribute" className="mt-8 inline-block">
            <Button size="lg" className="bg-gold text-gold-foreground hover:bg-gold/90">
              أرسل مساهمتك
            </Button>
          </Link>
        </Reveal>
      </section>
    </SiteLayout>
  );
}

function PersonTile({ person, index }: { person: Person; index: number }) {
  // Editorial, non-grid composition: four differently-sized/offset tiles
  // that read as one arrangement rather than repeated cards.
  const layout = [
    { col: "md:col-span-5", ratio: "aspect-[3/4]", top: "" },
    { col: "md:col-span-4", ratio: "aspect-square", top: "md:mt-16" },
    { col: "md:col-span-3", ratio: "aspect-[3/4]", top: "" },
    { col: "md:col-span-4 md:col-start-6", ratio: "aspect-[4/5]", top: "md:-mt-10" },
  ][index % 4]!;

  return (
    <Reveal delay={index * 90} className={layout.col + " " + layout.top}>
      <Link to="/people/$slug" params={{ slug: person.slug }} className="group relative block">
        <MediaImage
          path={person.photo_url}
          alt={person.name}
          ratio={layout.ratio}
          imgClassName="group-hover:scale-[1.05]"
        />
        <span className="pointer-events-none absolute right-4 top-4 font-display text-sm text-ink-foreground/90 [text-shadow:0_1px_6px_rgba(0,0,0,0.5)]">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <h3 className="font-display text-lg text-ink-foreground">{person.name}</h3>
          {person.role_title ? (
            <p className="mt-0.5 text-xs text-ink-foreground/75">{person.role_title}</p>
          ) : null}
          <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-gold">
            اكتشف الشخصية
            <ArrowLeft className="h-3 w-3" />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}
