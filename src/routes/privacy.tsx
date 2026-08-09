import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "سياسة الخصوصية | ذاكرة المناصير" },
      {
        name: "description",
        content: "كيف نتعامل مع بيانات الزوار والمساهمات والتعليقات في منصة ذاكرة المناصير.",
      },
      { property: "og:title", content: "سياسة الخصوصية | ذاكرة المناصير" },
      { property: "og:description", content: "سياسة التعامل مع بيانات الزوار والمساهمات." },
    ],
  }),
  component: () => (
    <SiteLayout>
      <PageHeader title="سياسة الخصوصية" />
      <div className="mx-auto max-w-3xl px-4 py-12 text-base leading-9 text-foreground">
        <p>
          لا يتطلب تصفّح الموقع أو التعليق أو إرسال المساهمات إنشاء حساب. نجمع فقط البيانات التي
          ترسلها طوعًا: الاسم المعروض، ووسيلة التواصل إن أضفتها، ومحتوى المساهمة أو التعليق
          والمرفقات.
        </p>
        <p className="mt-4">
          تُستخدم وسيلة التواصل للتحقق من المعلومة فقط، ولا تُنشر على الموقع ولا تُشارك مع أطراف
          خارجية. تخضع كل التعليقات والمساهمات للمراجعة قبل النشر، ويحق للإدارة رفض أي محتوى مسيء أو
          غير موثّق.
        </p>
        <p className="mt-4">
          يمكنك طلب حذف مساهمتك أو تعليقك في أي وقت عبر صفحة التواصل، وسنستجيب خلال مدة معقولة.
        </p>
      </div>
    </SiteLayout>
  ),
});
