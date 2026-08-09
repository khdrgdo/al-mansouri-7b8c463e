import { createFileRoute } from "@tanstack/react-router";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "شروط الاستخدام | ذاكرة المناصير" },
      {
        name: "description",
        content: "شروط استخدام منصة ذاكرة المناصير وحقوق المحتوى والمساهمات.",
      },
      { property: "og:title", content: "شروط الاستخدام | ذاكرة المناصير" },
      { property: "og:description", content: "شروط الاستخدام وحقوق المحتوى." },
    ],
  }),
  component: () => (
    <SiteLayout>
      <PageHeader title="شروط الاستخدام" />
      <div className="mx-auto max-w-3xl px-4 py-12 text-base leading-9 text-foreground">
        <p>
          محتوى الموقع مخصص للأغراض التوثيقية والثقافية. يُسمح بالاقتباس مع الإشارة إلى المصدر
          «ذاكرة المناصير» ورابط الصفحة.
        </p>
        <p className="mt-4">
          بإرسالك أي صورة أو وثيقة أو نص، فإنك تقر بأن لديك الحق في مشاركته، وتمنح المنصة إذنًا
          بنشره مع نسبته إليك. تحتفظ الإدارة بحق التعديل التحريري أو الرفض أو الحذف.
        </p>
        <p className="mt-4">
          يُمنع نشر أي محتوى مسيء أو يمس الأشخاص أو يحرّض على الكراهية، ويُمنع نشر معلومات تاريخية
          دون مصدر أو دون توضيح كونها رواية شفهية.
        </p>
      </div>
    </SiteLayout>
  ),
});
