import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { listAds } from "@/lib/public.functions";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout, PageHeader, EmptyState } from "@/components/site/SiteLayout";
import { MediaImage } from "@/components/site/MediaImage";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { uploadMedia, validateFile } from "@/lib/media";

type AdRow = {
  id: string;
  advertiser_name: string;
  title: string;
  description: string | null;
  category_id: string | null;
  phone: string | null;
  location_text: string | null;
  image_url: string | null;
  website: string | null;
  end_date: string | null;
};
type CategoryRow = { id: string; slug: string; name: string };

export const Route = createFileRoute("/ads")({
  head: () => ({
    meta: [
      { title: "الإعلانات المحلية | ذاكرة المناصير" },
      {
        name: "description",
        content: "لوحة إعلانات محلية لأهل المنطقة: خدمات، مناسبات، وإعلانات معتمدة بعد المراجعة.",
      },
      { property: "og:title", content: "الإعلانات المحلية | ذاكرة المناصير" },
      { property: "og:description", content: "إعلانات محلية معتمدة بعد المراجعة." },
    ],
  }),
  loader: () => listAds(),
  component: AdsPage,
});

const adSchema = z.object({
  advertiser_name: z.string().trim().min(2, "اسم المعلن مطلوب").max(100),
  title: z.string().trim().min(3, "عنوان الإعلان مطلوب").max(120),
  description: z.string().trim().max(1200).optional(),
  phone: z.string().trim().max(30).optional(),
  contact_email: z.string().trim().email("بريد غير صحيح").max(255).optional().or(z.literal("")),
  location_text: z.string().trim().max(120).optional(),
  website: z.string().trim().url("رابط غير صحيح").max(255).optional().or(z.literal("")),
});

function AdsPage() {
  const { ads, categories } = Route.useLoaderData() as { ads: AdRow[]; categories: CategoryRow[] };
  const [cat, setCat] = useState<string | null>(null);
  const filtered = ads.filter((a) => !cat || a.category_id === cat);

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="المجتمع"
        title="الإعلانات المحلية"
        description="مساحة لإعلانات أهل المنطقة وخدماتهم ومناسباتهم. تُنشر الإعلانات بعد مراجعة الإدارة."
      />
      <div className="mx-auto max-w-[1400px] px-5 py-14 lg:px-10">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={cat === null ? "default" : "outline"}
            onClick={() => setCat(null)}
          >
            كل الأقسام
          </Button>
          {categories.map((c) => (
            <Button
              key={c.id}
              size="sm"
              variant={cat === c.id ? "default" : "outline"}
              onClick={() => setCat(c.id)}
            >
              {c.name}
            </Button>
          ))}
        </div>

        <div className="mt-10">
          {filtered.length === 0 ? (
            <EmptyState
              title="لا توجد إعلانات معتمدة حاليًا"
              description="يمكنك إرسال إعلانك من النموذج أدناه."
            />
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((a) => (
                <article key={a.id} className="group">
                  <MediaImage
                    path={a.image_url}
                    alt={a.title}
                    ratio="aspect-[4/3]"
                    imgClassName="group-hover:scale-[1.03]"
                  />
                  <div className="pt-4">
                    <h2 className="font-display text-lg text-foreground">{a.title}</h2>
                    <p className="mt-1 text-sm text-primary">{a.advertiser_name}</p>
                    {a.description ? (
                      <p className="mt-2 text-sm leading-7 text-muted-foreground">
                        {a.description}
                      </p>
                    ) : null}
                    <div className="mt-3 grid gap-1 text-sm text-muted-foreground">
                      {a.location_text ? <span>الموقع: {a.location_text}</span> : null}
                      {a.phone ? <span>الهاتف: {a.phone}</span> : null}
                      {a.website ? (
                        <a
                          href={a.website}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="text-primary hover:underline"
                        >
                          الموقع الإلكتروني
                        </a>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <AdForm categories={categories} />
      </div>
    </SiteLayout>
  );
}

function AdForm({ categories }: { categories: CategoryRow[] }) {
  const [form, setForm] = useState({
    advertiser_name: "",
    title: "",
    description: "",
    phone: "",
    contact_email: "",
    location_text: "",
    website: "",
    category_id: "",
  });
  const [file, setFile] = useState<File | null>(null);

  const set = (k: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const mutation = useMutation({
    mutationFn: async () => {
      const parsed = adSchema.safeParse(form);
      if (!parsed.success) throw new Error(parsed.error.issues[0]!.message);

      let imagePath: string | null = null;
      if (file) {
        const err = validateFile(file, "image");
        if (err) throw new Error(err);
        imagePath = await uploadMedia(file, "submissions/ads");
      }

      const { error } = await supabase.from("advertisements").insert({
        advertiser_name: parsed.data.advertiser_name,
        title: parsed.data.title,
        description: parsed.data.description || null,
        phone: parsed.data.phone || null,
        contact_email: parsed.data.contact_email || null,
        location_text: parsed.data.location_text || null,
        website: parsed.data.website || null,
        category_id: form.category_id || null,
        image_url: imagePath,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم استلام إعلانك وسيُنشر بعد مراجعة الإدارة.");
      setForm({
        advertiser_name: "",
        title: "",
        description: "",
        phone: "",
        contact_email: "",
        location_text: "",
        website: "",
        category_id: "",
      });
      setFile(null);
    },
    onError: (e: Error) => toast.error(e.message || "تعذّر إرسال الإعلان."),
  });

  return (
    <section id="submit-ad" className="mt-16 rounded-xl border border-border bg-card p-6 md:p-8">
      <h2 className="text-xl font-bold text-foreground">أرسل إعلانك</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        الإعلانات مجانية للمجتمع المحلي وتخضع للمراجعة قبل النشر.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Field label="اسم المعلن *">
          <Input value={form.advertiser_name} onChange={set("advertiser_name")} maxLength={100} />
        </Field>
        <Field label="عنوان الإعلان *">
          <Input value={form.title} onChange={set("title")} maxLength={120} />
        </Field>
        <Field label="رقم الهاتف">
          <Input value={form.phone} onChange={set("phone")} maxLength={30} />
        </Field>
        <Field label="البريد الإلكتروني">
          <Input value={form.contact_email} onChange={set("contact_email")} maxLength={255} />
        </Field>
        <Field label="الموقع / المنطقة">
          <Input value={form.location_text} onChange={set("location_text")} maxLength={120} />
        </Field>
        <Field label="رابط إلكتروني">
          <Input
            value={form.website}
            onChange={set("website")}
            maxLength={255}
            placeholder="https://"
          />
        </Field>
        <Field label="القسم">
          <select
            value={form.category_id}
            onChange={set("category_id")}
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">بدون قسم</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="صورة الإعلان">
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </Field>
        <div className="md:col-span-2">
          <Field label="وصف الإعلان">
            <Textarea
              value={form.description}
              onChange={set("description")}
              rows={4}
              maxLength={1200}
            />
          </Field>
        </div>
      </div>

      <Button className="mt-6" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
        {mutation.isPending ? "جارٍ الإرسال…" : "إرسال الإعلان للمراجعة"}
      </Button>
    </section>
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
