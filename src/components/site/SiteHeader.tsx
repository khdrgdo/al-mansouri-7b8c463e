import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Search } from "lucide-react";
import { MAIN_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-colors duration-300",
        scrolled || open
          ? "border-b border-border bg-background/90 backdrop-blur-md"
          : "border-b border-transparent bg-background/40 backdrop-blur-sm",
      )}
    >
      <div className="mx-auto grid h-16 max-w-[1400px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 md:h-20 lg:px-10">
        <Link to="/" className="flex min-w-0 items-baseline gap-3">
          <span className="font-display text-lg font-bold leading-none tracking-tight text-foreground md:text-xl">
            المناصير
          </span>
          <span className="hidden truncate text-[11px] tracking-[0.18em] text-muted-foreground sm:block">
            أرشيف رقمي · منصوري موقد ناارنا
          </span>
        </Link>

        <div className="flex items-center gap-1 md:gap-6">
          <nav aria-label="التنقل الرئيسي" className="hidden items-center gap-6 lg:flex">
            {MAIN_NAV.filter((i) => i.to !== "/").map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeProps={{ className: "text-foreground" }}
                className="relative py-1 text-sm text-muted-foreground transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-right after:scale-x-0 after:bg-primary after:transition-transform after:duration-300 hover:text-foreground hover:after:origin-left hover:after:scale-x-100"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <Link
            to="/search"
            aria-label="بحث"
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <Search className="h-[18px] w-[18px]" />
          </Link>

          <Link
            to="/contribute"
            className="hidden rounded-full border border-foreground/20 px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-foreground hover:text-background md:inline-flex"
          >
            ساهم في الأرشيف
          </Link>

          <button
            type="button"
            aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-full text-foreground transition-colors hover:bg-secondary lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      <div
        className={cn(
          "fixed inset-x-0 top-16 z-40 origin-top overflow-hidden border-b border-border bg-background transition-[max-height,opacity] duration-300 lg:hidden",
          open ? "max-h-[80vh] opacity-100" : "pointer-events-none max-h-0 opacity-0",
        )}
      >
        <nav aria-label="قائمة الجوال" className="px-5 pb-8 pt-4">
          <ul className="grid">
            {MAIN_NAV.map((item, i) => (
              <li key={item.to} className="border-b border-border/70 last:border-0">
                <Link
                  to={item.to}
                  onClick={() => setOpen(false)}
                  activeOptions={{ exact: item.to === "/" }}
                  activeProps={{ className: "text-primary" }}
                  className="flex items-baseline gap-4 py-4 font-display text-2xl text-foreground"
                >
                  <span className="text-[11px] tabular-nums text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            to="/contribute"
            onClick={() => setOpen(false)}
            className="mt-6 block rounded-full bg-foreground px-4 py-3 text-center text-sm font-medium text-background"
          >
            ساهم في الأرشيف
          </Link>
        </nav>
      </div>
    </header>
  );
}
