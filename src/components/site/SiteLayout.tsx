import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { Reveal } from "./Reveal";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

/** Editorial page masthead: oversized title, hairline rules, generous space. */
export function PageHeader({
  title,
  description,
  eyebrow,
}: {
  title: string;
  description?: string;
  eyebrow?: string;
}) {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-[1400px] px-5 pb-12 pt-16 md:pb-20 md:pt-24 lg:px-10">
        <Reveal>
          {eyebrow ? <p className="eyebrow mb-6">{eyebrow}</p> : null}
          <h1 className="max-w-4xl font-display text-4xl leading-[1.1] text-balance text-foreground md:text-6xl lg:text-7xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-8 max-w-xl text-base leading-9 text-muted-foreground md:mr-auto">
              {description}
            </p>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="border border-dashed border-border px-6 py-16 text-center">
      <p className="font-display text-lg text-foreground">{title}</p>
      {description ? (
        <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}

export function LoadingGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-56 animate-pulse bg-muted" />
      ))}
    </div>
  );
}
