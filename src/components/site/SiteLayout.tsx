import type { ReactNode } from "react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}

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
    <section className="border-b border-border bg-secondary/60 bg-paper">
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        {eyebrow ? (
          <p className="mb-3 text-sm font-medium tracking-wide text-primary">{eyebrow}</p>
        ) : null}
        <h1 className="text-3xl font-bold text-balance text-foreground md:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-4 max-w-2xl text-base leading-8 text-muted-foreground">{description}</p>
        ) : null}
      </div>
    </section>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-card px-6 py-14 text-center">
      <p className="text-base font-semibold text-foreground">{title}</p>
      {description ? (
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      ) : null}
    </div>
  );
}

export function LoadingGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-56 animate-pulse rounded-lg border border-border bg-muted" />
      ))}
    </div>
  );
}
