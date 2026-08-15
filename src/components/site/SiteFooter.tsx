import { Link } from "@tanstack/react-router";
import { MAIN_NAV } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-ink text-ink-foreground">
      <div className="mx-auto max-w-[1400px] px-5 py-16 lg:px-10 lg:py-24">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <h2 className="font-display text-4xl leading-none md:text-6xl">المناصير</h2>
            <p className="mt-4 max-w-sm text-sm leading-8 text-ink-foreground/70">
              أرشيف رقمي لحفظ التاريخ والأرض والناس. كل مادة تُنسب لمصدرها أو تُوسم كرواية شفهية.
            </p>
            <p className="mt-6 text-xs tracking-[0.2em] text-gold">منصوري موقد ناارنا</p>
          </div>

          <nav aria-label="أقسام الموقع">
            <h3 className="text-[11px] tracking-[0.2em] text-ink-foreground/50">الأقسام</h3>
            <ul className="mt-5 grid gap-3 text-sm">
              {MAIN_NAV.filter((i) => i.to !== "/").map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-ink-foreground/80 transition-colors hover:text-gold">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="روابط عامة">
            <h3 className="text-[11px] tracking-[0.2em] text-ink-foreground/50">المنصة</h3>
            <ul className="mt-5 grid gap-3 text-sm">
              <li>
                <Link to="/contribute" className="text-ink-foreground/80 transition-colors hover:text-gold">
                  ساهم في التوثيق
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-ink-foreground/80 transition-colors hover:text-gold">
                  سياسة الخصوصية
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-ink-foreground/80 transition-colors hover:text-gold">
                  شروط الاستخدام
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-ink-foreground/80 transition-colors hover:text-gold">
                  تواصل معنا
                </Link>
              </li>
              <li>
                <Link to="/auth" className="text-ink-foreground/60 transition-colors hover:text-gold">
                  إدارة الموقع
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <div className="border-t border-ink-foreground/10">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-2 px-5 py-6 text-xs text-ink-foreground/50 lg:px-10">
          <span>ذاكرة المناصير © {new Date().getFullYear()}</span>
          <span>أرشيف رقمي مفتوح للمساهمة</span>
        </div>
      </div>
    </footer>
  );
}
