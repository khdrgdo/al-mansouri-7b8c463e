import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { getHomeData } from "@/lib/public.functions";
import { SiteLayout } from "@/components/site/SiteLayout";
import { MediaImage } from "@/components/site/MediaImage";
import { Reveal, useParallax } from "@/components/site/Reveal";
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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
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

function ChapterHead({
  number,
  chapter,
  title,
  lead,
  to,
  cta,
  tone = "light",
}: {
  number: string;
  chapter: string;
  title: string;
  lead?: string;
  to: "/people" | "/history" | "/locations" | "/archive" | "/articles";
  cta: string;
  tone?: "light" | "dark";
}) {
  const accent = tone === "dark" ? "text-gold" : "text-primary";
  return (
    <Reveal className="grid gap-8 md:grid-cols-12 md:items-end">
      <div className="md:col-span-8">
        <span className="chapter-mark">
          {number} — {chapter}
        </span>
        <h2 className="mt-5 font-display text-[2.6rem] leading-[0.95] text-balance md:text-7xl">
          {title}
        </h2>
        {lead ? (
          <p className="mt-6 max-w-xl font-narrative text-lg leading-[2.1] opacity-70">{lead}</p>
        ) : null}
      </div>
      <div className="md:col-span-4 md:text-left">
        <Link
          to={to}
          className={`group inline-flex items-center gap-3 text-sm font-medium ${accent}`}
        >
          <span className="border-b border-current/40 pb-1">{cta}</span>
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        </Link>
      </div>
    </Reveal>
  );
}

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
      {/* ————— الفصل الأول: الفجر ————— */}
      <section className="relative min-h-[100svh] overflow-hidden bg-ink text-ink-foreground">
        <div ref={parallaxRef} className="pointer-events-none absolute inset-0" aria-hidden>
          <img
            src={heroArchive}
            alt=""
            className="h-full w-full object-cover opacity-55"
            style={{ objectPosition: "45% 35%" }}
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/50 via-ink/35 to-ink" />
          <div className="absolute inset-0 bg-[radial-gradient(60%_45%_at_78%_18%,color-mix(in_oklab,var(--gold)_45%,transparent),transparent_70%)]" />
        </div>

        <div className="relative mx-auto flex min-h-[100svh] max-w-[1400px] flex-col justify-end px-5 pb-16 pt-32 lg:px-10 lg:pb-24">
          <Reveal>
            <span className="chapter-mark text-gold">٠١ — الفجر</span>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="mt-6 font-display text-[21vw] leading-[0.82] tracking-tight md:text-[15rem]">
              المَنَاصِير
            </h1>
          </Reveal>
          <Reveal delay={180}>
            <div className="river-rule mt-8 w-full max-w-3xl" aria-hidden />
          </Reveal>
          <Reveal delay={240}>
            <div className="mt-8 grid gap-8 md:grid-cols-12 md:items-end">
              <p className="font-narrative text-lg leading-[2.1] text-ink-foreground/75 md:col-span-6 md:text-xl">
                ذاكرةٌ تُروى ولا تُنسى — رحلة يوم كامل على ضفاف النيل: تاريخٌ وأرضٌ وناس، مجموعون
                في أرشيف واحد.
              </p>
              <div className="flex flex-wrap gap-6 md:col-span-6 md:justify-end">
                <Link
                  to="/history"
                  className="group inline-flex items-center gap-3 border-b-2 border-gold pb-2 font-display text-lg text-gold"
                >
                  ابدأ الرحلة
                  <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                </Link>
                <Link
                  to="/contribute"
                  className="inline-flex items-center border-b-2 border-ink-foreground/25 pb-2 font-display text-lg text-ink-foreground/80 transition-colors hover:border-ink-foreground"
                >
                  ساهم في الأرشيف
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <dl className="mt-14 grid grid-cols-2 gap-px overflow-hidden border-y border-ink-foreground/15 md:grid-cols-4">
              {[
                { label: "أحداث تاريخية", value: timeline.length },
                { label: "مناطق وقرى", value: featuredLocations.length },
                { label: "شخصيات", value: featuredPeople.length },
                { label: "مواد أرشيفية", value: featuredArchive.length },
              ].map((s) => (
                <div key={s.label} className="px-1 py-6">
                  <dd className="font-display text-4xl text-gold">
                    {s.value.toLocaleString("ar-EG")}
                  </dd>
                  <dt className="mt-1 text-xs tracking-[0.18em] text-ink-foreground/55">
                    {s.label}
                  </dt>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ————— الفصل الثاني: الضحى — الشخصيات ————— */}
      {featuredPeople.length > 0 ? (
        <section className="chapter-noon py-24 md:py-32">
          <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
            <ChapterHead
              number="٠٢"
              chapter="الضحى"
              title="وجوهٌ صنعت المكان"
              lead="أسماء من ذاكرة المناصير، كل اسم بابٌ إلى سيرة وصورة ومصدر."
              to="/people"
              cta="كل الشخصيات"
            />

            <ul className="mt-14 border-t border-foreground/15">
              {featuredPeople.slice(0, 6).map((p, i) => (
                <li key={p.id} className="border-b border-foreground/15">
                  <Link
                    to="/people/$slug"
                    params={{ slug: p.slug }}
                    className="group grid items-center gap-4 py-6 md:grid-cols-12"
                  >
                    <span className="font-display text-sm text-muted-foreground md:col-span-1">
                      {(i + 1).toLocaleString("ar-EG").padStart(2, "٠")}
                    </span>
                    <h3 className="font-display text-3xl leading-tight text-foreground transition-colors group-hover:text-primary md:col-span-6 md:text-5xl">
                      {p.name}
                    </h3>
                    <p className="text-sm text-muted-foreground md:col-span-3">
                      {p.role_title ?? "—"}
                    </p>
                    <div className="md:col-span-2">
                      <div className="h-0 overflow-hidden opacity-0 transition-all duration-500 group-hover:h-24 group-hover:opacity-100 md:h-24 md:opacity-60 md:group-hover:opacity-100">
                        <MediaImage
                          path={p.photo_url}
                          alt={p.name}
                          ratio="aspect-[4/3]"
                          className="h-24"
                          imgClassName="grayscale transition-all duration-500 group-hover:grayscale-0"
                        />
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* ————— الراعي ————— */}
      {sponsor ? (
        <section className="border-y border-foreground/10 bg-linen py-8">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-5 px-5 lg:px-10">
            {sponsor.image_url ? (
              <MediaImage
                path={sponsor.image_url}
                alt={sponsor.advertiser_name}
                ratio="aspect-square"
                grain={false}
                className="h-14 w-14 shrink-0"
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="text-[11px] tracking-[0.18em] text-muted-foreground">بدعم من</p>
              <p className="truncate font-display text-lg text-foreground">
                {sponsor.advertiser_name} · {sponsor.title}
              </p>
            </div>
            {sponsor.website ? (
              <a
                href={sponsor.website}
                target="_blank"
                rel="noreferrer noopener"
                className="shrink-0 border-b border-primary/50 pb-1 text-sm text-primary"
              >
                زيارة الموقع
              </a>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* ————— الفصل الثالث: الظهيرة — التاريخ ————— */}
      <section className="chapter-night py-24 md:py-32">
        <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
          <ChapterHead
            number="٠٣"
            chapter="الظهيرة"
            title="من الجذور إلى اليوم"
            lead="محطات موثّقة تروي كيف تشكّل تاريخ المناصير جيلًا بعد جيل."
            to="/history"
            cta="خط الزمن كاملًا"
            tone="dark"
          />

          {timeline.length > 0 ? (
            <ol className="mt-14 border-t border-ink-foreground/15">
              {timeline.slice(0, 5).map((e) => (
                <li key={e.id} className="border-b border-ink-foreground/15">
                  <Link
                    to="/history/$slug"
                    params={{ slug: e.slug }}
                    className="group grid gap-3 py-7 md:grid-cols-12 md:items-baseline"
                  >
                    <p className="font-display text-xl text-gold md:col-span-3">
                      {e.period ?? "—"}
                    </p>
                    <h3 className="font-display text-2xl leading-snug text-ink-foreground transition-colors group-hover:text-gold md:col-span-6 md:text-4xl">
                      {e.title}
                    </h3>
                    {e.summary ? (
                      <p className="line-clamp-2 font-narrative text-sm leading-8 text-ink-foreground/55 md:col-span-3">
                        {e.summary}
                      </p>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      </section>

      {/* ————— الفصل الرابع: العصر — المناطق ————— */}
      {featuredLocations.length > 0 ? (
        <section className="chapter-afternoon py-24 md:py-32">
          <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
            <ChapterHead
              number="٠٤"
              chapter="العصر"
              title="مجرى النهر وقراه"
              lead="مسارٌ جغرافي يتبع النيل من قرية إلى أخرى."
              to="/locations"
              cta="استكشف المناطق"
            />

            <div className="relative mt-16">
              <div className="river-rule absolute inset-x-0 top-3" aria-hidden />
              <div className="snap-rail relative gap-10">
                {featuredLocations.map((loc) => (
                  <Link
                    key={loc.id}
                    to="/locations/$slug"
                    params={{ slug: loc.slug }}
                    className="group w-[52vw] shrink-0 md:w-[17vw]"
                  >
                    <span className="block h-6 w-6 rounded-full border-2 border-primary bg-background transition-colors group-hover:bg-primary" />
                    <h3 className="mt-6 font-display text-2xl text-foreground transition-colors group-hover:text-primary">
                      {loc.name}
                    </h3>
                    <p className="mt-2 text-xs tracking-[0.16em] text-muted-foreground">
                      {loc.kind}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* ————— الفصل الخامس: الغروب — الأرشيف ————— */}
      {featuredArchive.length > 0 ? (
        <section className="chapter-sunset py-24 md:py-32">
          <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
            <ChapterHead
              number="٠٥"
              chapter="الغروب"
              title="جدار الذاكرة"
              lead="صور ووثائق وقصاصات، كل قطعة بمصدرها."
              to="/archive"
              cta="تصفّح الأرشيف"
              tone="dark"
            />
          </div>
          <div className="snap-rail mt-14 gap-6 px-5 lg:px-10">
            {featuredArchive.map((item, i) => (
              <Link
                key={item.id}
                to="/archive"
                className="group block w-[62vw] shrink-0 md:w-[24vw]"
                style={{ transform: `rotate(${(i % 3) - 1}deg)` }}
              >
                <MediaImage
                  path={item.media_url}
                  alt={item.alt_text ?? item.title}
                  ratio={i % 3 === 1 ? "aspect-[3/4]" : "aspect-[4/5]"}
                  className="border-8 border-linen shadow-2xl shadow-black/30"
                  imgClassName="transition-transform duration-500 group-hover:scale-105"
                />
                <p className="mt-4 line-clamp-1 text-sm text-ink-foreground/80">{item.title}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* ————— الفصل السادس: الليل — المقالات ————— */}
      {latestArticles.length > 0 ? (
        <section className="py-24 md:py-32">
          <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
            <ChapterHead
              number="٠٦"
              chapter="الليل"
              title="حكايات تُقرأ"
              lead="مقالات ودراسات وروايات، محرّرة ومراجعة."
              to="/articles"
              cta="كل المقالات"
            />

            <div className="mt-14 grid gap-12 md:grid-cols-12">
              {latestArticles[0] ? (
                <Reveal className="md:col-span-7">
                  <Link to="/articles/$slug" params={{ slug: latestArticles[0].slug }} className="group block">
                    <MediaImage
                      path={latestArticles[0].cover_image_url}
                      alt={latestArticles[0].title}
                      ratio="aspect-[16/10]"
                      imgClassName="transition-transform duration-700 group-hover:scale-105"
                    />
                    <h3 className="mt-6 font-display text-3xl leading-tight text-foreground transition-colors group-hover:text-primary md:text-5xl">
                      {latestArticles[0].title}
                    </h3>
                    {latestArticles[0].excerpt ? (
                      <p className="mt-4 max-w-lg font-narrative text-base leading-[2.1] text-muted-foreground">
                        {latestArticles[0].excerpt}
                      </p>
                    ) : null}
                  </Link>
                </Reveal>
              ) : null}

              <div className="md:col-span-5">
                <ul className="border-t border-foreground/15">
                  {latestArticles.slice(1, 5).map((a) => (
                    <li key={a.id} className="border-b border-foreground/15">
                      <Link
                        to="/articles/$slug"
                        params={{ slug: a.slug }}
                        className="group block py-6"
                      >
                        <h3 className="font-display text-xl leading-snug text-foreground transition-colors group-hover:text-primary">
                          {a.title}
                        </h3>
                        {a.excerpt ? (
                          <p className="mt-2 line-clamp-2 font-narrative text-sm leading-8 text-muted-foreground">
                            {a.excerpt}
                          </p>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* ————— دعوة ————— */}
      <section className="chapter-night py-24 md:py-32">
        <Reveal className="mx-auto max-w-[1400px] px-5 lg:px-10">
          <span className="chapter-mark text-gold">ختامًا</span>
          <h2 className="mt-6 max-w-3xl font-display text-4xl leading-[1.05] text-balance text-ink-foreground md:text-7xl">
            عندك صورة أو وثيقة أو رواية؟
          </h2>
          <p className="mt-6 max-w-xl font-narrative text-base leading-[2.1] text-ink-foreground/65">
            كل مساهمة تُراجع من فريق التوثيق قبل النشر، وتُنسب لصاحبها. لا نضيف معلومة دون مصدر أو
            إشارة واضحة إلى أنها رواية شفهية.
          </p>
          <Link
            to="/contribute"
            className="group mt-10 inline-flex items-center gap-3 border-b-2 border-gold pb-2 font-display text-xl text-gold"
          >
            أرسل مساهمتك
            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          </Link>
        </Reveal>
      </section>
    </SiteLayout>
  );
}
