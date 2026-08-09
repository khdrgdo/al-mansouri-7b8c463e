import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  author_name: z.string().trim().min(2, "الاسم قصير جدًا").max(80, "الاسم طويل جدًا"),
  body: z.string().trim().min(5, "التعليق قصير جدًا").max(1500, "التعليق طويل جدًا"),
});

export function CommentsSection({
  targetType,
  targetId,
}: {
  targetType: "article" | "event" | "location" | "person" | "archive";
  targetId: string;
}) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [body, setBody] = useState("");

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["comments", targetType, targetId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("id, author_name, body, created_at")
        .eq("target_type", targetType)
        .eq("target_id", targetId)
        .eq("status", "approved")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const parsed = schema.safeParse({ author_name: name, body });
      if (!parsed.success) throw new Error(parsed.error.issues[0]!.message);
      const { error } = await supabase.from("comments").insert({
        target_type: targetType,
        target_id: targetId,
        author_name: parsed.data.author_name,
        body: parsed.data.body,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setBody("");
      toast.success("تم إرسال تعليقك وسيظهر بعد مراجعة الإدارة.");
      qc.invalidateQueries({ queryKey: ["comments", targetType, targetId] });
    },
    onError: (e: Error) => toast.error(e.message || "تعذّر إرسال التعليق."),
  });

  return (
    <section className="mt-14 border-t border-border pt-10">
      <h2 className="text-xl font-bold text-foreground">التعليقات والمشاركات</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        شارك ذكرياتك أو معلوماتك. تُنشر التعليقات بعد مراجعة الإدارة.
      </p>

      <div className="mt-6 grid gap-3 rounded-lg border border-border bg-card p-4">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="الاسم"
          maxLength={80}
        />
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="اكتب تعليقك هنا…"
          rows={4}
          maxLength={1500}
        />
        <div>
          <Button onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending ? "جارٍ الإرسال…" : "إرسال التعليق"}
          </Button>
        </div>
      </div>

      <div className="mt-8 grid gap-4">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">جارٍ التحميل…</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">لا توجد تعليقات منشورة بعد.</p>
        ) : (
          comments.map((c) => (
            <article key={c.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-foreground">{c.author_name}</p>
                <time className="text-xs text-muted-foreground">
                  {new Date(c.created_at).toLocaleDateString("ar-EG")}
                </time>
              </div>
              <p className="mt-2 whitespace-pre-line text-sm leading-7 text-muted-foreground">
                {c.body}
              </p>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
