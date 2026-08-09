import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CONTENT_TYPE_LABELS } from "@/lib/constants";
import { uploadMedia, validateFile } from "@/lib/media";

export const Route = createFileRoute("/contribute")({
  head: () => ({
    meta: [
      { title: "ساهم في التوثيق | ذاكرة المناصير" },
      {
        name: "description",
        content:
          "أرسل صورة قديمة أو وثيقة أو رواية أو تصحيح معلومة. تُراجع كل مساهمة قبل نشرها وتُنسب لصاحبها.",
      },
      { property: "og:title", content: "ساهم في التوثيق | ذاكرة المناصير" },
      { property: "og:description", content: "شارك صورك ووثائقك ورواياتك لحفظ الذاكرة." },
    ],
  }),
  component: ContributePage,
});

const schema = z.object({
  contributor_name: z.string().trim().min(2, "الاسم مطلوب").max(100),
  contact: z.string().trim().max(120).optional(),
  content_type: z.string().min(1, "اختر نوع المساهمة"),
  title: z.string().trim().min(3, "العنوان مطلوب").max(150),
  description: z.string().trim().min(10, "أضف وصفًا أوضح").max(4000),
  location_text: z.string().trim().max(150).optional(),
  approx_date: z.string().trim().max(80).optional(),
  source_context: z.string().trim().max(1000).optional(),
});

function ContributePage() {
  const [form, setForm] = useState({
    contributor_name: "",
    contact: "",
    content_type: "",
    title: "",
    description: "",
    location_text: "",
    approx_date: "",
    source_context: "",
  });
  const [files, setFiles] = useState<File[]>([]);

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const mutation = useMutation({
    mutationFn: async () => {
      const parsed = schema.safeParse(form);
      if (!parsed.success) throw new Error(parsed.error.issues[0]!.message);
      if (files.length > 5) throw new Error("الحد الأقصى ٥ ملفات لكل مساهمة.");

      const paths: Array<{ path: string; name: string; type: string }> = [];
      for (const f of files) {
        const err = validateFile(f);
        if (err) throw new Error(err);
        const path = await uploadMedia(f, "submissions/contributions");
        paths.push({ path, name: f.name, type: f.type });
      }

      const { error } = await supabase.from("submissions").insert({
        contributor_name: parsed.data.contributor_name,
        contact: parsed.data.contact || null,
        content_type: parsed.data.content_type,
        title: parsed.data.title,
        description: parsed.data.description,
        location_text: parsed.data.location_text || null,
        approx_date: parsed.data.approx_date || null,
        source_context: parsed.data.source_context || null,
        files: paths,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("شكرًا لك! وصلت مساهمتك وسيراجعها فريق التوثيق.");
      setForm({
        contributor_name: "",
        contact: "",
        content_type: "",
        title: "",
        description: "",
        location_text: "",
        approx_date: "",
        source_context: "",
      });
      setFiles([]);
    },
    onError: (e: Error) => toast.error(e.message || "تعذّر إرسال المساهمة."),
  });

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="المشاركة المجتمعية"
        title="ساهم في التوثيق"
        description="لا نضيف أي معلومة تاريخية دون مصدر أو إشارة واضحة إلى كونها رواية شفهية. ساعدنا بالمعلومة الصحيحة، ونحن نتكفّل بالمراجعة والنشر والنسب."
      />

      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-xl border border-border bg-card p-6 md:p-8">
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="اسمك *">
              <Input value={form.contributor_name} onChange={set("contributor_name")} maxLength={100} />
            </Field>
            <Field label="وسيلة تواصل (هاتف أو بريد)">
              <Input value={form.contact} onChange={set("contact")} maxLength={120} />
            </Field>
            <Field label="نوع المساهمة *">
              <select
                value={form.content_type}
                onChange={set("content_type")}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">اختر…</option>
                {Object.entries(CONTENT_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="العنوان *">
              <Input value={form.title} onChange={set("title")} maxLength={150} />
            </Field>
            <Field label="المنطقة أو الموقع">
              <Input value={form.location_text} onChange={set("location_text")} maxLength={150} />
            </Field>
            <Field label="التاريخ التقريبي">
              <Input
                value={form.approx_date}
                onChange={set("approx_date")}
                maxLength={80}
                placeholder="مثال: أربعينيات القرن الماضي"
              />
            </Field>
            <div className="md:col-span-2">
              <Field label="التفاصيل *">
                <Textarea value={form.description} onChange={set("description")} rows={6} maxLength={4000} />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="المصدر أو سياق المعلومة">
                <Textarea
                  value={form.source_context}
                  onChange={set("source_context")}
                  rows={3}
                  maxLength={1000}
                  placeholder="من أين المعلومة؟ كتاب، وثيقة، أو رواية عن شخص…"
                />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="مرفقات (صور أو وثائق — حتى ٥ ملفات، ١٥ ميجابايت للملف)">
                <Input
                  type="file"
                  multiple
                  accept="image/*,application/pdf,.doc,.docx,.txt"
                  onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                />
              </Field>
              {files.length > 0 ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  {files.length.toLocaleString("ar-EG")} ملف محدد
                </p>
              ) : null}
            </div>
          </div>

          <Button className="mt-6" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? "جارٍ الإرسال…" : "إرسال المساهمة"}
          </Button>
        </div>
      </div>
    </SiteLayout>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label className="text-sm text-foreground">{label}</Label>
      {children}
    </div>
  );
}
