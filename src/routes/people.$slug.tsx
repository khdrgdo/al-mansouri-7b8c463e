import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getPerson } from "@/lib/public.functions";
import { SiteLayout } from "@/components/site/SiteLayout";
import { MediaImage } from "@/components/site/MediaImage";
import { CommentsSection } from "@/components/site/CommentsSection";
import { VERIFICATION_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/people/$slug")({
  loader: async ({ params }) => {
    const data = await getPerson({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "الصفحة غير متاحة | ذاكرة المناصير" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { person } = loaderData;
    const title = person.seo_title || `${person.name} | ذاكرة المناصير`;
    const description =
      person.seo_description || person.biography?.slice(0, 155) || "سيرة شخصية من ذاكرة المناصير.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
      ],
    };
  },
  component: PersonPage,
});

function PersonPage() {
  const { person, articles, archive } = Route.useLoaderData();
  const location = person.locations as { slug: string; name: string } | null;

  return (
    <SiteLayout>
      <article className="mx-auto max-w-3xl px-4 py-12">
        <nav className="mb-6 text-sm text-muted-foreground">
          <Link to="/people" className="hover:text-primary">
            الشخصيات
          </Link>
          <span className="px-2">/</span>
          <span>{person.name}</span>
        </nav>

        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          <MediaImage
            path={person.photo_url}
            alt={person.name}
            className="w-40 shrink-0 rounded-lg"
            ratio="aspect-square"
          />
          <div>
            <h1 className="text-3xl font-bold text-foreground">{person.name}</h1>
            {person.role_title ? (
              <p className="mt-1 text-primary">{person.role_title}</p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="secondary">
                {VERIFICATION_LABELS[person.verification] ?? person.verification}
              </Badge>
              {location ? (
                <Link to="/locations/$slug" params={{ slug: location.slug }}>
                  <Badge variant="outline">{location.name}</Badge>
                </Link>
              ) : null}
            </div>
            {person.birth_info || person.death_info ? (
              <p className="mt-3 text-sm text-muted-foreground">
                {[person.birth_info, person.death_info].filter(Boolean).join(" — ")}
              </p>
            ) : null}
          </div>
        </div>

        {person.biography ? (
          <section className="mt-8">
            <h2 className="text-xl font-bold text-foreground">السيرة</h2>
            <p className="mt-3 whitespace-pre-line text-base leading-9 text-foreground">
              {person.biography}
            </p>
          </section>
        ) : null}

        {person.contribution ? (
          <section className="mt-8">
            <h2 className="text-xl font-bold text-foreground">الإسهامات</h2>
            <p className="mt-3 whitespace-pre-line text-base leading-9 text-foreground">
              {person.contribution}
            </p>
          </section>
        ) : null}

        {archive.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-foreground">مواد أرشيفية</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3">
              {archive.map((a: { id: string; title: string; media_url: string | null; alt_text: string | null } | null) =>
                a ? (
                  <MediaImage
                    key={a.id}
                    path={a.media_url}
                    alt={a.alt_text || a.title}
                    className="rounded-lg"
                    ratio="aspect-square"
                  />
                ) : null,
              )}
            </div>
          </section>
        ) : null}

        {articles.length > 0 ? (
          <section className="mt-10">
            <h2 className="text-xl font-bold text-foreground">مقالات مرتبطة</h2>
            <ul className="mt-4 grid gap-3">
              {articles.map((a: { id: string; slug: string; title: string } | null) =>
                a ? (
                  <li key={a.id}>
                    <Link
                      to="/articles/$slug"
                      params={{ slug: a.slug }}
                      className="block rounded-lg border border-border bg-card p-4 text-sm font-medium text-foreground hover:border-primary"
                    >
                      {a.title}
                    </Link>
                  </li>
                ) : null,
              )}
            </ul>
          </section>
        ) : null}

        {person.sources ? (
          <section className="mt-10 rounded-lg border border-border bg-secondary/50 p-5">
            <h2 className="text-sm font-semibold text-foreground">المصادر</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-8 text-muted-foreground">
              {person.sources}
            </p>
          </section>
        ) : null}

        <CommentsSection targetType="person" targetId={person.id} />
      </article>
    </SiteLayout>
  );
}
