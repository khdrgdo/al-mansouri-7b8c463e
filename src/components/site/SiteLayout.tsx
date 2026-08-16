import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { Reveal } from "./Reveal";
import { cn } from "@/lib/utils";

export function SiteLayout({ children }: { children: ReactNode }) {
  // Simple route transition: re-key <main> per pathname so the fade replays.
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main key={pathname} className="route-fade flex-1">
        {children}
      </main>
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

/** Shared editorial container. */
export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto max-w-[1400px] px-5 lg:px-10", className)}>{children}</div>
  );
}

/** Breadcrumb rail used at the top of detail pages. */
export function Crumbs({
  parent,
  parentTo,
  current,
}: {
  parent: string;
  parentTo: "/people" | "/history" | "/locations" | "/articles" | "/archive";
  current: string;
}) {
  return (
    <nav
      aria-label="مسار التصفح"
      className="flex flex-wrap items-center gap-3 text-[11px] tracking-[0.16em] text-muted-foreground"
    >
      <Link
        to={parentTo}
        className="rounded-sm transition-colors hover:text-primary focus-visible:text-primary"
      >
        {parent}
      </Link>
      <span aria-hidden className="h-px w-6 bg-border" />
      <span className="truncate text-foreground/70">{current}</span>
    </nav>
  );
}

/** Small section heading with a hairline rule above it. */
export function SectionTitle({
  children,
  eyebrow,
  className,
}: {
  children: ReactNode;
  eyebrow?: string;
  className?: string;
}) {
  return (
    <div className={cn("rule border-t pt-6", className)}>
      {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
      <h2 className="font-display text-2xl leading-tight text-foreground md:text-3xl">
        {children}
      </h2>
    </div>
  );
}

/** Underlined text link with a sliding arrow. */
export function ArrowLink({
  children,
  className,
  ...rest
}: React.ComponentProps<typeof Link>) {
  return (
    <Link
      {...rest}
      className={cn(
        "group inline-flex items-center gap-3 rounded-sm text-sm font-medium text-primary",
        className,
      )}
    >
      <span className="border-b border-primary/40 pb-0.5 transition-colors group-hover:border-primary">
        {children}
      </span>
      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
    </Link>
  );
}

/** Key/value strip used for metadata on detail pages. */
export function MetaList({ items }: { items: Array<{ label: string; value: ReactNode }> }) {
  return (
    <dl className="rule grid gap-0 border-t">
      {items.map((it, i) => (
        <div
          key={i}
          className="flex items-baseline justify-between gap-6 border-b border-border py-3"
        >
          <dt className="text-[11px] tracking-[0.16em] text-muted-foreground">{it.label}</dt>
          <dd className="text-sm text-foreground">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Long-form body copy. */
export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "whitespace-pre-line text-[1.0625rem] leading-[2.1] text-foreground/90",
        className,
      )}
    >
      {children}
    </div>
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
