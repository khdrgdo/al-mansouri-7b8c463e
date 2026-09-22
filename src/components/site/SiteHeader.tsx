import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Menu, X, Search } from "lucide-react";
import { MAIN_NAV } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
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
        "fixed top-4 left-4 right-4 z-50 transition-all duration-500",
        scrolled || open
          ? "glass top-3 mx-3 rounded-2xl shadow-lg shadow-black/5 md:mx-8 lg:mx-12"
          : "mx-0 rounded-none border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 md:h-18 lg:px-10">
        {/* Logo */}
        <Link to="/" className="group flex items-center gap-3">
          <span
            className="text-lg font-bold leading-tight text-foreground"
            style={{ fontFamily: "'Aref Ruqaa', serif" }}
          >
            المَنَاصِير
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav
          aria-label="التنقل الرئيسي"
          className="hidden items-center gap-1 lg:flex"
        >
          {MAIN_NAV.filter((i) => i.to !== "/").map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeProps={{ className: "bg-primary/10 text-primary" }}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-foreground/5 hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link
            to="/search"
            aria-label="بحث"
            className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground transition-all duration-200 hover:bg-foreground/5 hover:text-foreground"
          >
            <Search className="h-[18px] w-[18px]" />
          </Link>

          <Link
            to="/contribute"
            className="hidden rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-ink-foreground transition-all duration-300 hover:bg-primary md:inline-flex"
          >
            ساهم في الأرشيف
          </Link>

          <button
            type="button"
            aria-label={open ? "إغلاق القائمة" : "فتح القائمة"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="grid h-10 w-10 place-items-center rounded-full text-foreground transition-all duration-200 hover:bg-foreground/5 lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      <div
        className={cn(
          "glass fixed inset-x-0 top-20 z-40 origin-top overflow-hidden rounded-2xl shadow-2xl transition-all duration-400 lg:hidden",
          open
            ? "scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0",
        )}
      >
        <nav aria-label="قائمة الجوال" className="p-6">
          <ul className="grid gap-2">
            {MAIN_NAV.map((item, i) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  onClick={() => setOpen(false)}
                  activeOptions={{ exact: item.to === "/" }}
                  activeProps={{ className: "bg-primary/10 text-primary" }}
                  className="flex items-center gap-4 rounded-xl px-4 py-3 text-lg font-medium text-foreground transition-all duration-200 hover:bg-foreground/5"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground/5 text-sm tabular-nums text-muted-foreground">
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
            className="mt-6 block rounded-xl bg-ink px-4 py-4 text-center text-sm font-semibold text-ink-foreground shadow-lg shadow-black/10"
          >
            ساهم في الأرشيف
          </Link>
        </nav>
      </div>
    </header>
  );
}
