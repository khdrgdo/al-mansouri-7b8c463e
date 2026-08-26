import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { Reveal } from "./Reveal";
import { MemoryMapButton } from "./MemoryMapButton";
import { cn } from "@/lib/utils";

export function SiteLayout({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main key={pathname} className="route-fade flex-1 pt-20">
        {children}
      </main>
      <SiteFooter />
      <MemoryMapButton />
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
    <section className="relative overflow-hidden bg-ink py-20 text-ink-foreground md:py-28">
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20" />

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

      <div className="relative mx-auto max-w-[1400px] px-5 lg:px-10">
        <Reveal>
          {eyebrow ? (
            <p className="eyebrow mb-6 text-gold before:bg-gold">{eyebrow}</p>
          ) : null}
          <h1 className="max-w-4xl font-display text-4xl leading-[1.1] text-balance text-ink-foreground md:text-6xl lg:text-7xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-8 max-w-xl text-base leading-9 text-ink-foreground/60 md:mr-auto">
              {description}
            </p>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto max-w-[1400px] px-5 lg:px-10", className)}>{children}</div>
  );
}

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
        className="rounded-full px-3 py-1 transition-colors hover:bg-primary/10 hover:text-primary focus-visible:text-primary"
      >
        {parent}
      </Link>
      <span aria-hidden className="h-px w-6 bg-border" />
      <span className="truncate rounded-full bg-foreground/5 px-3 py-1 text-foreground/70">
        {current}
      </span>
    </nav>
  );
}

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
    <div className={cn("pt-6", className)}>
      {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
      <h2 className="font-display text-2xl leading-tight text-foreground md:text-3xl">
        {children}
      </h2>
    </div>
  );
}

export function ArrowLink({
  children,
  className,
  ...rest
}: Omit<React.ComponentProps<typeof Link>, "children" | "className"> & {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      {...rest}
      className={cn(
        "group inline-flex items-center gap-3 rounded-full text-sm font-medium text-primary transition-all duration-200 hover:bg-primary/10 hover:px-3 hover:py-1",
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

export function MetaList({ items }: { items: Array<{ label: string; value: ReactNode }> }) {
  return (
    <dl className="grid gap-0">
      {items.map((it, i) => (
        <div
          key={i}
          className="flex items-baseline justify-between gap-6 border-b border-border py-4"
        >
          <dt className="text-[11px] tracking-[0.16em] text-muted-foreground">{it.label}</dt>
          <dd className="text-sm font-medium text-foreground">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Prose({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "whitespace-pre-line text-[1.0625rem] leading-[2.1] text-foreground/85",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border px-6 py-16 text-center">
      <p className="font-display text-lg text-foreground">{title}</p>
      {description ? (
        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted-foreground">
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
        <div key={i} className="h-56 animate-pulse rounded-2xl bg-muted" />
      ))}
    </div>
  );
}
