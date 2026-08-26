import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";
import { MAIN_NAV } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="relative mt-24">
      {/* Wave divider */}
      <div className="absolute -top-24 left-0 right-0 h-24 overflow-hidden">
        <svg
          className="h-full w-full"
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            d="M0,60 C240,100 480,20 720,60 C960,100 1200,20 1440,60 L1440,120 L0,120 Z"
            fill="currentColor"
            className="text-ink"
          />
        </svg>
      </div>

      <div className="bg-ink text-ink-foreground">
        <div className="mx-auto max-w-[1400px] px-5 pt-24 pb-12 lg:px-10">
          {/* Top section */}
          <div className="grid gap-16 md:grid-cols-[1.5fr_1fr_1fr]">
            {/* Brand */}
            <div>
              <h2
                className="text-3xl font-bold leading-none md:text-5xl"
                style={{ fontFamily: "'Aref Ruqaa', serif" }}
              >
                المَنَاصِير
              </h2>
              <p className="mt-6 max-w-sm text-sm leading-8 text-ink-foreground/60">
                أرشيف رقمي لحفظ التاريخ والأرض والناس. كل مادة تُنسب لمصدرها أو تُوسم كرواية شفهية.
              </p>
              <p className="mt-8 text-xs font-medium tracking-[0.2em] text-gold">
                منصوري موقد ناارنا
              </p>

              {/* Decorative waves */}
              <div className="mt-8 flex gap-1 opacity-20">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-1 rounded-full bg-gold"
                    style={{ width: `${20 + i * 12}px` }}
                  />
                ))}
              </div>
            </div>

            {/* Navigation */}
            <nav aria-label="أقسام الموقع">
              <h3 className="text-xs font-semibold tracking-[0.15em] text-ink-foreground/40">
                الأقسام
              </h3>
              <ul className="mt-6 grid gap-3">
                {MAIN_NAV.filter((i) => i.to !== "/").map((item) => (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className="group flex items-center gap-2 text-sm text-ink-foreground/70 transition-colors duration-200 hover:text-gold"
                    >
                      <span className="h-px w-0 bg-gold transition-all duration-200 group-hover:w-3" />
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Links */}
            <nav aria-label="روابط عامة">
              <h3 className="text-xs font-semibold tracking-[0.15em] text-ink-foreground/40">
                المنصة
              </h3>
              <ul className="mt-6 grid gap-3">
                <li>
                  <Link
                    to="/contribute"
                    className="group flex items-center gap-2 text-sm text-ink-foreground/70 transition-colors duration-200 hover:text-gold"
                  >
                    <span className="h-px w-0 bg-gold transition-all duration-200 group-hover:w-3" />
                    ساهم في التوثيق
                  </Link>
                </li>
                <li>
                  <Link
                    to="/privacy"
                    className="group flex items-center gap-2 text-sm text-ink-foreground/70 transition-colors duration-200 hover:text-gold"
                  >
                    <span className="h-px w-0 bg-gold transition-all duration-200 group-hover:w-3" />
                    سياسة الخصوصية
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="group flex items-center gap-2 text-sm text-ink-foreground/70 transition-colors duration-200 hover:text-gold"
                  >
                    <span className="h-px w-0 bg-gold transition-all duration-200 group-hover:w-3" />
                    شروط الاستخدام
                  </Link>
                </li>
                <li>
                  <Link
                    to="/contact"
                    className="group flex items-center gap-2 text-sm text-ink-foreground/70 transition-colors duration-200 hover:text-gold"
                  >
                    <span className="h-px w-0 bg-gold transition-all duration-200 group-hover:w-3" />
                    تواصل معنا
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Divider */}
          <div className="my-12 h-px bg-gradient-to-r from-transparent via-ink-foreground/20 to-transparent" />

          {/* Bottom */}
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-xs text-ink-foreground/40">
              ذاكرة المناصير © {new Date().getFullYear()}
            </p>
            <p className="flex items-center gap-1.5 text-xs text-ink-foreground/40">
              صُنع بـ <Heart className="h-3 w-3 fill-gold text-gold" /> للحفاظ على التراث
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
