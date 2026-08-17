import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { slugify, slugWithSuffix } from "@/lib/slugify";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ContentType = "article" | "archive" | "location" | "person";

const TYPE_LABELS: Record<ContentType, string> = {
  article: "مقال",
  archive: "عنصر أرشيف (صورة/وثيقة)",
  location: "موقع",
  person: "شخصية",
};

const VERIFICATION_OPTIONS: { value: string; label: string }[] = [
  { value: "verified", label: "موثّق بمصدر" },
  { value: "oral", label: "رواية شفهية" },
  { value: "unverified", label: "قيد التوثيق" },
];

async function insertWithUniqueSlugRetry<T extends { error: { code?: string } | null }>(
  insertFn: (slug: string) => PromiseLike<T>,
  baseSlug: string,
): Promise<T> {
  const first = await insertFn(baseSlug);
  if (!first.error) return first;
  if (first.error.code === "23505") return insertFn(slugWithSuffix(baseSlug));
  return first;
}

export function ComposeTab({ currentUserId }: { currentUserId: string }) {
  const qc = useQueryClient();
  const [type, setType] = useState<ContentType>("article");
  const [attributeToMe, setAttributeToMe] = useState(true);

  const profile = useQuery({
    queryKey: ["admin", "my-profile", currentUserId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("display_name")
        .eq("user_id", currentUserId)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const [form, setForm] = useState({
    title: "",
    body: "",
    excerpt: "",
    imageUrl: "",
    kind: "قرية",
    latitude: "",
    longitude: "",
    roleTitle: "",
    source: "",
    verification: "unverified",
    categoryId: "",
    mediaType: "photo",
    itemDate: "",
  });

  const categories = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .eq("kind", "article");
      if (error) throw error;
      return data;
    },
    enabled: type === "article",
  });

  function resetForm() {
    setForm({
      title: "",
      body: "",
      excerpt: "",
      imageUrl: "",
      kind: "قرية",
      latitude: "",
      longitude: "",
      roleTitle: "",
      source: "",
      verification: "unverified",
      categoryId: "",
      mediaType: "photo",
      itemDate: "",
    });
  }

  const publish = useMutation({
    mutationFn: async () => {
      const displayName = (profile.data?.display_name || "").trim();
      const attribution = attributeToMe && displayName ? displayName : null;
      const title = form.title.trim();
      if (!title) throw new Error("العنوان مطلوب.");
      const baseSlug = slugify(title);

      if (type === "article") {
        return insertWithUniqueSlugRetry(
          (slug) =>
            supabase.from("articles").insert({
              title,
              slug,
              content: form.body || null,
              excerpt: form.excerpt || null,
              cover_image_url: form.imageUrl || null,
              category_id: form.categoryId || null,
              author: attribution,
              verification: form.verification,
              published: true,
              published_at: new Date().toISOString(),
            }),
          baseSlug,
        );
      }
      if (type === "archive") {
        return insertWithUniqueSlugRetry(
          (slug) =>
            supabase.from("archive_items").insert({
              title,
              slug,
              media_url: form.imageUrl || null,
              media_type: form.mediaType,
              caption: form.excerpt || null,
              description: form.body || null,
              item_date: form.itemDate || null,
              source: form.source || null,
              contributor: attribution,
              verification: form.verification,
              published: true,
            }),
          baseSlug,
        );
      }
      if (type === "location") {
        return insertWithUniqueSlugRetry(
          (slug) =>
            supabase.from("locations").insert({
              name: title,
              slug,
              kind: form.kind,
              description: form.excerpt || null,
              history: form.body || null,
              cover_image_url: form.imageUrl || null,
              latitude: form.latitude ? Number(form.latitude) : null,
              longitude: form.longitude ? Number(form.longitude) : null,
              sources: form.source || null,
              verification: form.verification,
              published: true,
            }),
          baseSlug,
        );
      }
      return insertWithUniqueSlugRetry(
        (slug) =>
          supabase.from("people").insert({
            name: title,
            slug,
            role_title: form.roleTitle || null,
            biography: form.body || null,
            photo_url: form.imageUrl || null,
            sources: form.source || null,
            verification: form.verification,
            published: true,
          }),
        baseSlug,
      );
    },
    onSuccess: (res) => {
      if (res.error) throw res.error;
      toast.success("تم النشر مباشرة على الموقع.");
      resetForm();
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (e: Error) => toast.error(e.message || "تعذّر النشر — تأكد من صلاحياتك."),
  });

  return (
    <div className="mt-6 grid max-w-2xl gap-6">
      <div className="grid gap-2">
        <Label>نوع المحتوى</Label>
        <Select value={type} onValueChange={(v) => setType(v as ContentType)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(TYPE_LABELS) as ContentType[]).map((t) => (
              <SelectItem key={t} value={t}>
                {TYPE_LABELS[t]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label>{type === "location" || type === "person" ? "الاسم" : "العنوان"}</Label>
        <Input
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        />
      </div>

      <div className="grid gap-2">
        <Label>رابط الصورة {type === "archive" ? "(أو الوثيقة)" : "(اختياري)"}</Label>
        <Input
          value={form.imageUrl}
          onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
          placeholder="https://…"
          dir="ltr"
        />
      </div>

      {type === "archive" ? (
        <div className="grid gap-2">
          <Label>نوع الوسيط</Label>
          <Select
            value={form.mediaType}
            onValueChange={(v) => setForm((f) => ({ ...f, mediaType: v }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="photo">صورة</SelectItem>
              <SelectItem value="document">وثيقة</SelectItem>
              <SelectItem value="manuscript">مخطوطة</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {type === "article" ? (
        <div className="grid gap-2">
          <Label>التصنيف (اختياري)</Label>
          <Select
            {...(form.categoryId ? { value: form.categoryId } : {})}
            onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="بلا تصنيف" />
            </SelectTrigger>
            <SelectContent>
              {(categories.data ?? []).map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {type === "location" ? (
        <>
          <div className="grid gap-2">
            <Label>نوع الموقع</Label>
            <Select value={form.kind} onValueChange={(v) => setForm((f) => ({ ...f, kind: v }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="منطقة">منطقة</SelectItem>
                <SelectItem value="قرية">قرية</SelectItem>
                <SelectItem value="موضع">موضع</SelectItem>
                <SelectItem value="معلم">معلم</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>خط العرض (اختياري)</Label>
              <Input
                dir="ltr"
                value={form.latitude}
                onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label>خط الطول (اختياري)</Label>
              <Input
                dir="ltr"
                value={form.longitude}
                onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
              />
            </div>
          </div>
        </>
      ) : null}

      {type === "person" ? (
        <div className="grid gap-2">
          <Label>الصفة/الدور (اختياري)</Label>
          <Input
            value={form.roleTitle}
            onChange={(e) => setForm((f) => ({ ...f, roleTitle: e.target.value }))}
          />
        </div>
      ) : null}

      {type === "archive" ? (
        <div className="grid gap-2">
          <Label>تاريخ المادة (اختياري)</Label>
          <Input
            value={form.itemDate}
            onChange={(e) => setForm((f) => ({ ...f, itemDate: e.target.value }))}
            placeholder="مثلًا: حوالي 1965"
          />
        </div>
      ) : null}

      <div className="grid gap-2">
        <Label>{type === "archive" ? "وصف مختصر (caption)" : "ملخص مختصر (اختياري)"}</Label>
        <Textarea
          value={form.excerpt}
          onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
          rows={2}
        />
      </div>

      <div className="grid gap-2">
        <Label>
          {type === "article"
            ? "النص الكامل"
            : type === "archive"
              ? "تفاصيل إضافية (اختياري)"
              : type === "location"
                ? "نبذة تاريخية (اختياري)"
                : "نبذة / سيرة (اختياري)"}
        </Label>
        <Textarea
          value={form.body}
          onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
          rows={8}
        />
      </div>

      <div className="grid gap-2">
        <Label>المصدر (اختياري، إن لم يكن رواية شفهية)</Label>
        <Textarea
          value={form.source}
          onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))}
          rows={2}
        />
      </div>

      <div className="grid gap-2">
        <Label>حالة التوثيق</Label>
        <Select
          value={form.verification}
          onValueChange={(v) => setForm((f) => ({ ...f, verification: v }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {VERIFICATION_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <Checkbox checked={attributeToMe} onCheckedChange={(c) => setAttributeToMe(c === true)} />
        نشر باسمي {profile.data?.display_name ? `(${profile.data.display_name})` : ""}
      </label>

      <Button
        size="lg"
        disabled={publish.isPending || !form.title.trim()}
        onClick={() => publish.mutate()}
        className="justify-self-start"
      >
        {publish.isPending ? "جارٍ النشر…" : "نشر الآن على الموقع"}
      </Button>
      <p className="-mt-3 text-xs text-muted-foreground">
        ينشر مباشرة وفوراً على الموقع العام — هذا مسار منفصل عن مراجعة مسودات AI في تبويب
        "المسودات".
      </p>
    </div>
  );
}
