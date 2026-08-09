import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "تواصل معنا | ذاكرة المناصير" },
      { name: "description", content: "تواصل مع فريق ذاكرة المناصير للتصحيح أو الاستفسار أو التعاون." },
      { property: "og:title", content: "تواصل معنا | ذاكرة المناصير" },
      { property: "og:description", content: "للتصحيح أو الاستفسار أو التعاون." },
    ],
  }),
  component: () => (
    <SiteLayout>
      <PageHeader title="تواصل معنا" description="نرحّب بالتصحيحات والإضافات الموثّقة." />
      <div className="mx-auto max-w-3xl px-4 py-12 text-base leading-9 text-foreground">
        <p>
          أسرع طريقة للوصول إلينا هي عبر{" "}
          <Link to="/contribute" className="text-primary hover:underline">
            نموذج المساهمة
          </Link>
          ، حيث يمكنك إرسال تصحيح معلومة أو إضافة مصدر أو طلب حذف مادة.
        </p>
        <p className="mt-4">للتواصل الإداري: khdrmamon@gmail.com</p>
      </div>
    </SiteLayout>
  ),
});
