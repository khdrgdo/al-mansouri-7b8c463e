import { Link } from "@tanstack/react-router";
import { MAIN_NAV } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-nile text-nile-foreground">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <h2 className="text-xl font-bold">ذاكرة المناصير</h2>
          <p className="mt-3 max-w-sm text-sm leading-7 text-nile-foreground/80">
            منصة رقمية لحفظ التاريخ والتراث والذاكرة.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gold">أقسام الموقع</h3>
          <ul className="mt-4 grid grid-cols-2 gap-2 text-sm">
            {MAIN_NAV.filter((i) => i.to !== "/").map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="text-nile-foreground/80 hover:text-gold">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/contribute" className="text-nile-foreground/80 hover:text-gold">
                ساهم في التوثيق
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gold">روابط عامة</h3>
          <ul className="mt-4 grid gap-2 text-sm">
            <li>
              <Link to="/privacy" className="text-nile-foreground/80 hover:text-gold">
                سياسة الخصوصية
              </Link>
            </li>
            <li>
              <Link to="/terms" className="text-nile-foreground/80 hover:text-gold">
                شروط الاستخدام
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-nile-foreground/80 hover:text-gold">
                تواصل معنا
              </Link>
            </li>
            <li>
              <Link to="/auth" className="text-nile-foreground/80 hover:text-gold">
                إدارة الموقع
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-nile-foreground/15 py-5 text-center text-xs text-nile-foreground/70">
        جميع الحقوق محفوظة — ذاكرة المناصير © {new Date().getFullYear()}
      </div>
    </footer>
  );
}
