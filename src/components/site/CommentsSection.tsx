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
  body: z.string().trim().min(2, "التعليق قصير جدًا").max(2000, "التعليق طويل جدًا"),
});

type CommentRow = {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
  parent_id: string | null;
};

export function CommentsSection({
  targetType,
  targetId,
}: {
  targetType: "article" | "event" | "location" | "person" | "archive";
  targetId: string;
}) {
  const qc = useQueryClient();
  const queryKey = ["comments", targetType, targetId];

  const { data: comments = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("id, author_name, body, created_at, parent_id")
        .eq("target_type", targetType)
        .eq("target_id", targetId)
        .eq("status", "approved")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as CommentRow[];
    },
  });

  const roots = comments.filter((c) => !c.parent_id);
  const repliesOf = (id: string) => comments.filter((c) => c.parent_id === id);

  return (
    <section className="mt-14 border-t border-border pt-10">
      <h2 className="text-xl font-bold text-foreground">التعليقات والمشاركات</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        شارك ذكرياتك أو معلوماتك — يظهر تعليقك فوراً للجميع.
      </p>

      <div className="mt-6">
        <CommentForm targetType={targetType} targetId={targetId} queryKey={queryKey} />
      </div>

      <div className="mt-8 grid gap-5">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">جارٍ التحميل…</p>
        ) : roots.length === 0 ? (
          <p className="text-sm text-muted-foreground">كن أول من يعلّق.</p>
        ) : (
          roots
            .slice()
            .reverse()
            .map((c) => (
              <CommentThread
                key={c.id}
                comment={c}
                replies={repliesOf(c.id)}
                targetType={targetType}
                targetId={targetId}
                queryKey={queryKey}
              />
            ))
        )}
      </div>
    </section>
  );
}

type TargetType = "article" | "event" | "location" | "person" | "archive";

function CommentThread({
  comment,
  replies,
  targetType,
  targetId,
  queryKey,
}: {
  comment: CommentRow;
  replies: CommentRow[];
  targetType: TargetType;
  targetId: string;
  queryKey: unknown[];
}) {
  const [replying, setReplying] = useState(false);

  return (
    <article className="rounded-lg border border-border bg-card p-4">
      <CommentBody comment={comment} />
      <button
        type="button"
        onClick={() => setReplying((r) => !r)}
        className="mt-2 text-xs font-medium text-primary hover:underline"
      >
        {replying ? "إلغاء" : "رد"}
      </button>

      {replying ? (
        <div className="mt-3 border-t border-border pt-3">
          <CommentForm
            targetType={targetType}
            targetId={targetId}
            parentId={comment.id}
            queryKey={queryKey}
            onSubmitted={() => setReplying(false)}
            compact
          />
        </div>
      ) : null}

      {replies.length > 0 ? (
        <div className="mt-4 grid gap-3 border-r-2 border-border pr-4">
          {replies.map((r) => (
            <div key={r.id} className="rounded-md bg-secondary/30 p-3">
              <CommentBody comment={r} />
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
}

function CommentBody({ comment }: { comment: CommentRow }) {
  return (
    <>
      <div className="flex items-center justify-between gap-3">
        <p className="font-semibold text-foreground">{comment.author_name}</p>
        <time className="text-xs text-muted-foreground">
          {new Date(comment.created_at).toLocaleDateString("ar-EG")}
        </time>
      </div>
      <p className="mt-2 whitespace-pre-line text-sm leading-7 text-muted-foreground">
        {comment.body}
      </p>
    </>
  );
}

function CommentForm({
  targetType,
  targetId,
  parentId,
  queryKey,
  onSubmitted,
  compact,
}: {
  targetType: "article" | "event" | "location" | "person" | "archive";
  targetId: string;
  parentId?: string;
  queryKey: unknown[];
  onSubmitted?: () => void;
  compact?: boolean;
}) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [body, setBody] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const parsed = schema.safeParse({ author_name: name, body });
      if (!parsed.success) throw new Error(parsed.error.issues[0]!.message);
      const { error } = await supabase.from("comments").insert({
        target_type: targetType,
        target_id: targetId,
        author_name: parsed.data.author_name,
        body: parsed.data.body,
        parent_id: parentId ?? null,
        status: "approved",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setBody("");
      toast.success(parentId ? "تم نشر ردّك." : "تم نشر تعليقك.");
      qc.invalidateQueries({ queryKey });
      onSubmitted?.();
    },
    onError: (e: Error) => toast.error(e.message || "تعذّر الإرسال."),
  });

  return (
    <div
      className={compact ? "grid gap-2" : "grid gap-3 rounded-lg border border-border bg-card p-4"}
    >
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="الاسم"
        maxLength={80}
      />
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder={parentId ? "اكتب ردّك…" : "اكتب تعليقك هنا…"}
        rows={compact ? 2 : 4}
        maxLength={2000}
      />
      <div>
        <Button
          size={compact ? "sm" : "default"}
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "جارٍ الإرسال…" : parentId ? "إرسال الرد" : "إرسال التعليق"}
        </Button>
      </div>
    </div>
  );
}
