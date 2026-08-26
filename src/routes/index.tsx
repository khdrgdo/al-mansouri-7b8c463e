import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Sparkles, MapPin, BookOpen, Users } from "lucide-react";
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
      <section className="relative min-h-[100vh] overflow-hidden bg-ink">
        {/* Background image with parallax */}
        <div
          ref={parallaxRef}
          className="pointer-events-none absolute inset-0"
          aria-hidden
        >
          <img
            src={heroArchive}
            alt=""
            className="h-full w-full object-cover opacity-65"
            style={{ objectPosition: "45% 35%" }}
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/30 to-ink" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-secondary/20" />
        </div>

        {/* Animated water ripple */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute -left-1/4 top-1/4 h-[500px] w-[500px] animate-flow rounded-full bg-primary/10 blur-3xl" />
          <div
            className="absolute -right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-secondary/10 blur-3xl"
            style={{ animationDelay: "2s" }}
          />
        </div>

        {/* Content */}
        <div className="relative mx-auto flex min-h-[100vh] max-w-[1400px] flex-col justify-center px-5 pb-24 pt-32 lg:px-10">
          <div className="max-w-3xl">
            <Reveal>
              <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-gold" />
                <span className="text-sm text-ink-foreground/80">منصوري موقد ناارنا</span>
              </div>
            </Reveal>

            <Reveal delay={100}>
              <h1
                className="text-[14vw] leading-[0.85] tracking-tight text-white sm:text-[12vw] md:text-[10rem] lg:text-[12rem]"
                style={{
                  fontFamily: "'Aref Ruqaa', serif",
                  textShadow: "0 4px 20px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)",
                }}
              >
                المَنَاصِير
              </h1>
            </Reveal>

            <Reveal delay={200}>
              <p className="mt-8 max-w-xl text-lg leading-9 text-ink-foreground/70 md:text-xl">
                ذاكرةٌ تُروى ولا تُنسى — أرشيف رقمي يجمع تاريخ المناصير وأرضهم وناسهم في مكان واحد.
              </p>
            </Reveal>

            <Reveal delay={300}>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Link to="/history">
                  <Button
                    size="lg"
                    className="group rounded-full bg-gradient-to-r from-primary to-secondary px-8 py-6 text-base font-semibold text-white shadow-xl shadow-primary/30 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/40 hover:scale-105"
                  >
                    استكشف التاريخ
                    <ArrowLeft className="mr-2 h-5 w-5 transition-transform group-hover:-translate-x-1" />
                  </Button>
                </Link>
                <Link to="/contribute">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full border-white/20 bg-white/5 px-8 py-6 text-base font-semibold text-white backdrop-blur-sm hover:bg-white/10"
                  >
                    ساهم في الأرشيف
                  </Button>
                </Link>
              </div>
            </Reveal>
          </div>

          {/* Scroll indicator */}
          <Reveal delay={500} className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <div className="flex flex-col items-center gap-2 text-ink-foreground/40">
              <span className="text-xs tracking-wider">اكتشف المزيد</span>
              <div className="h-12 w-px animate-pulse bg-gradient-to-b from-ink-foreground/40 to-transparent" />
            </div>
          </Reveal>
        </div>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            className="h-auto w-full"
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M0,60 C240,100 480,20 720,60 C960,100 1200,20 1440,60 L1440,120 L0,120 Z"
              fill="currentColor"
              className="text-background"
            />
          </svg>
        </div>
      </section>

      {/* ————— Stats bar ————— */}
      <section className="relative z-10 -mt-1">
        <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
          <Reveal>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { icon: BookOpen, label: "أحداث تاريخية", value: timeline.length.toString() },
                { icon: MapPin, label: "مناطق وقرى", value: featuredLocations.length.toString() },
                { icon: Users, label: "شخصيات بارزة", value: featuredPeople.length.toString() },
                { icon: Sparkles, label: "وثيقة مؤرشفة", value: featuredArchive.length.toString() },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="float-card flex items-center gap-4 p-5"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-display text-2xl font-bold text-foreground">
                      {stat.value}
                    </p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ————— الشخصيات البارزة ————— */}
      {featuredPeople.length > 0 ? (
        <section className="py-24 md:py-32">
          <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
            <Reveal className="mb-16 flex flex-col gap-6 md:mb-20 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="eyebrow mb-4">أعلام الذاكرة</p>
                <h2 className="font-display text-4xl leading-[1.1] text-foreground md:text-6xl">
                  الشخصيات البارزة
                </h2>
              </div>
              <Link
                to="/people"
                className="group inline-flex items-center gap-3 text-sm font-medium text-primary"
              >
                <span className="border-b border-primary/40 pb-1 transition-colors group-hover:border-primary">
                  كل الشخصيات
                </span>
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              </Link>
            </Reveal>

            {/* Desktop: floating cards */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featuredPeople.slice(0, 4).map((p, i) => (
                <PersonCard key={p.id} person={p} index={i} />
              ))}
            </div>

            {/* Mobile: horizontal snap rail */}
            <div className="snap-rail md:hidden">
              {featuredPeople.slice(0, 4).map((p, i) => (
                <Link
                  key={p.id}
                  to="/people/$slug"
                  params={{ slug: p.slug }}
                  className="group float-card float-card-hover block w-[70vw] shrink-0 overflow-hidden"
                >
                  <div className="relative overflow-hidden">
                    <MediaImage
                      path={p.photo_url}
                      alt={p.name}
                      ratio="aspect-[3/4]"
                      imgClassName="transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="font-display text-lg font-bold text-white">{p.name}</h3>
                      {p.role_title ? (
                        <p className="mt-1 text-xs text-white/70">{p.role_title}</p>
                      ) : null}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ————— مساحة الراعي ————— */}
      {sponsor ? (
        <section className="bg-water py-12">
          <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
            <Reveal>
              <div className="float-card flex flex-wrap items-center gap-6 p-6">
                {sponsor.image_url ? (
                  <MediaImage
                    path={sponsor.image_url}
                    alt={sponsor.advertiser_name}
                    ratio="aspect-square"
                    grain={false}
                    className="h-16 w-16 shrink-0 rounded-xl"
                  />
                ) : null}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {sponsor.advertiser_name} · {sponsor.title}
                  </p>
                  {sponsor.description ? (
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {sponsor.description}
                    </p>
                  ) : null}
                </div>
                {sponsor.website ? (
                  <a
                    href={sponsor.website}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="shrink-0 rounded-full bg-primary/10 px-4 py-2 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
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
      <section className="relative overflow-hidden bg-ink py-24 text-ink-foreground md:py-32">
        {/* Wave top */}
        <div className="absolute -top-px left-0 right-0">
          <svg
            className="h-auto w-full"
            viewBox="0 0 1440 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,0 L0,0 Z"
              fill="currentColor"
              className="text-background"
            />
          </svg>
        </div>

        <div className="relative mx-auto max-w-[1400px] px-5 lg:px-10">
          <div className="grid gap-12 md:grid-cols-12 md:items-start">
            <Reveal className="md:col-span-7">
              <p className="eyebrow mb-5 text-gold before:bg-gold">التاريخ</p>
              <h2 className="font-display text-4xl leading-[1.1] text-ink-foreground md:text-6xl">
                من الجذور إلى اليوم
              </h2>
              <p className="mt-6 max-w-md text-base leading-9 text-ink-foreground/60">
                محطات وأحداث موثّقة تروي كيف تشكّل تاريخ المناصير جيلًا بعد جيل.
              </p>
              <Link
                to="/history"
                className="group mt-8 inline-flex items-center gap-3 text-sm font-medium text-gold"
              >
                اكتشف التاريخ
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              </Link>
            </Reveal>

            {timeline.length > 0 ? (
              <Reveal delay={100} className="md:col-span-5">
                <ol className="grid gap-4">
                  {timeline.slice(0, 4).map((e) => (
                    <li key={e.id}>
                      <Link
                        to="/history/$slug"
                        params={{ slug: e.slug }}
                        className="group block rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all duration-300 hover:border-gold/30 hover:bg-white/10"
                      >
                        <p className="text-xs font-medium text-gold">{e.period}</p>
                        <h3 className="mt-2 font-display text-lg text-ink-foreground transition-colors group-hover:text-gold">
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

        {/* Wave bottom */}
        <div className="absolute -bottom-px left-0 right-0">
          <svg
            className="h-auto w-full"
            viewBox="0 0 1440 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M0,40 C360,0 720,80 1080,40 C1260,20 1380,30 1440,40 L1440,80 L0,80 Z"
              fill="currentColor"
              className="text-background"
            />
          </svg>
        </div>
      </section>

      {/* ————— المناطق ————— */}
      {featuredLocations.length > 0 ? (
        <section className="py-24 md:py-32">
          <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
            <Reveal className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="eyebrow mb-4">الجغرافيا</p>
                <h2 className="font-display text-4xl leading-[1.1] text-foreground md:text-6xl">
                  المناطق والقرى
                </h2>
              </div>
              <Link
                to="/locations"
                className="group inline-flex items-center gap-3 text-sm font-medium text-primary"
              >
                <span className="border-b border-primary/40 pb-1 transition-colors group-hover:border-primary">
                  استكشف المناطق
                </span>
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              </Link>
            </Reveal>

            <Reveal delay={80} className="flex flex-wrap gap-3">
              {featuredLocations.map((loc) => (
                <Link
                  key={loc.id}
                  to="/locations/$slug"
                  params={{ slug: loc.slug }}
                  className="group flex items-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:border-primary hover:bg-primary/5 hover:text-primary hover:shadow-lg hover:shadow-primary/10"
                >
                  <MapPin className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                  {loc.name}
                </Link>
              ))}
            </Reveal>
          </div>
        </section>
      ) : null}

      {/* ————— الأرشيف ————— */}
      {featuredArchive.length > 0 ? (
        <section className="bg-water py-24 md:py-32">
          <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
            <Reveal className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="eyebrow mb-4">الذاكرة البصرية</p>
                <h2 className="font-display text-4xl leading-[1.1] text-foreground md:text-6xl">
                  الأرشيف الرقمي
                </h2>
              </div>
              <Link
                to="/archive"
                className="group inline-flex items-center gap-3 text-sm font-medium text-primary"
              >
                <span className="border-b border-primary/40 pb-1 transition-colors group-hover:border-primary">
                  تصفّح الأرشيف
                </span>
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              </Link>
            </Reveal>
          </div>
          <Reveal delay={80} className="snap-rail px-5 lg:px-10">
            {featuredArchive.map((item, i) => (
              <Link
                key={item.id}
                to="/archive"
                className="group float-card float-card-hover block w-[62vw] shrink-0 overflow-hidden md:w-[26vw]"
              >
                <MediaImage
                  path={item.media_url}
                  alt={item.alt_text ?? item.title}
                  ratio={i % 3 === 1 ? "aspect-[3/4]" : "aspect-[4/5]"}
                  imgClassName="transition-transform duration-500 group-hover:scale-105"
                />
                <div className="p-4">
                  <p className="line-clamp-1 text-sm font-medium text-foreground">
                    {item.title}
                  </p>
                </div>
              </Link>
            ))}
          </Reveal>
        </section>
      ) : null}

      {/* ————— المقالات ————— */}
      {latestArticles.length > 0 ? (
        <section className="py-24 md:py-32">
          <div className="mx-auto max-w-[1400px] px-5 lg:px-10">
            <Reveal className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="eyebrow mb-4">المحتوى</p>
                <h2 className="font-display text-4xl leading-[1.1] text-foreground md:text-6xl">
                  أحدث المقالات
                </h2>
              </div>
              <Link
                to="/articles"
                className="group inline-flex items-center gap-3 text-sm font-medium text-primary"
              >
                <span className="border-b border-primary/40 pb-1 transition-colors group-hover:border-primary">
                  كل المقالات
                </span>
                <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              </Link>
            </Reveal>

            <div className="grid gap-8 md:grid-cols-12">
              {latestArticles[0] ? (
                <Reveal className="md:col-span-7">
                  <Link
                    to="/articles/$slug"
                    params={{ slug: latestArticles[0].slug }}
                    className="group float-card float-card-hover block overflow-hidden"
                  >
                    <MediaImage
                      path={latestArticles[0].cover_image_url}
                      alt={latestArticles[0].title}
                      ratio="aspect-[16/10]"
                      imgClassName="transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="p-6">
                      <h3 className="font-display text-2xl leading-tight text-foreground transition-colors group-hover:text-primary md:text-3xl">
                        {latestArticles[0].title}
                      </h3>
                      {latestArticles[0].excerpt ? (
                        <p className="mt-3 line-clamp-2 max-w-lg text-sm leading-8 text-muted-foreground">
                          {latestArticles[0].excerpt}
                        </p>
                      ) : null}
                    </div>
                  </Link>
                </Reveal>
              ) : null}

              <div className="grid gap-6 md:col-span-5">
                {latestArticles.slice(1, 3).map((a, i) => (
                  <Reveal key={a.id} delay={100 + i * 80}>
                    <Link
                      to="/articles/$slug"
                      params={{ slug: a.slug }}
                      className="group float-card float-card-hover flex overflow-hidden"
                    >
                      <MediaImage
                        path={a.cover_image_url}
                        alt={a.title}
                        ratio="aspect-square"
                        className="w-28 shrink-0 md:w-32"
                      />
                      <div className="min-w-0 flex-1 p-4">
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
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-secondary py-24 text-white md:py-32">
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden" aria-hidden>
          <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        </div>

        <Reveal className="relative mx-auto max-w-[1400px] px-5 text-center lg:px-10">
          <h2 className="font-display text-3xl leading-[1.2] text-balance md:text-5xl">
            عندك صورة أو وثيقة أو رواية؟
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-8 text-white/70">
            كل مساهمة تُراجع من فريق التوثيق قبل النشر، وتُنسب لصاحبها. لا نضيف معلومة دون مصدر أو
            إشارة واضحة إلى أنها رواية شفهية.
          </p>
          <Link to="/contribute" className="mt-10 inline-block">
            <Button
              size="lg"
              className="group rounded-full bg-white px-8 py-6 text-base font-semibold text-primary shadow-xl shadow-black/20 transition-all duration-300 hover:shadow-2xl hover:scale-105"
            >
              أرسل مساهمتك
              <ArrowRight className="mr-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </Reveal>

        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            className="h-auto w-full"
            viewBox="0 0 1440 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <path
              d="M0,40 C360,0 720,80 1080,40 C1260,20 1380,30 1440,40 L1440,80 L0,80 Z"
              fill="currentColor"
              className="text-background"
            />
          </svg>
        </div>
      </section>
    </SiteLayout>
  );
}

function PersonCard({ person, index }: { person: Person; index: number }) {
  return (
    <Reveal delay={index * 100}>
      <Link
        to="/people/$slug"
        params={{ slug: person.slug }}
        className="group float-card float-card-hover block overflow-hidden"
      >
        <div className="relative overflow-hidden">
          <MediaImage
            path={person.photo_url}
            alt={person.name}
            ratio="aspect-[3/4]"
            imgClassName="transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-display text-lg font-bold text-white">{person.name}</h3>
            {person.role_title ? (
              <p className="mt-1 text-xs text-white/70">{person.role_title}</p>
            ) : null}
            <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-gold">
              اكتشف الشخصية
              <ArrowLeft className="h-3 w-3" />
            </span>
          </div>
        </div>
      </Link>
    </Reveal>
  );
}
