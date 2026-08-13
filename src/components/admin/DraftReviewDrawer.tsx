import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import DraftEditForm from "./DraftEditForm";
import RejectModal from "./RejectModal";

export default function DraftReviewDrawer({ table, id, onClose }: { table: string; id: string; onClose: () => void }) {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  const content = useQuery({
    queryKey: ["admin", "draft", table, id],
    queryFn: async () => {
      const { data, error } = await supabase.from(table).select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });

  const logs = useQuery({
    queryKey: ["admin", "audit", table, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select("id, action, actor_email, created_at, new_values, result, error_message")
        .eq("content_type", table)
        .eq("content_id", id)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      // Keep published field unchanged; only update provided fields
      const { error } = await supabase.from(table).update(payload).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم حفظ التعديلات (المسودة لم تُنشر).");
      qc.invalidateQueries({ queryKey: ["admin", "draft", table, id] });
      qc.invalidateQueries({ queryKey: ["admin", "drafts_v2"] });
    },
    onError: (e: Error) => toast.error(e.message || "تعذّر حفظ التغييرات."),
  });

  if (!content.data && content.isLoading) {
    return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="rounded-lg border border-border bg-card p-6">جارٍ تحميل المحتوى…</div>
      </div>,
      document.body,
    );
  }

  if (!content.data && content.isError) {
    return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="rounded-lg border border-border bg-card p-6 text-destructive">تعذّر جلب المحتوى.</div>
      </div>,
      document.body,
    );
  }

  const row: any = content.data;

  function renderBody() {
    if (table === "articles") return row.content ?? row.excerpt ?? "";
    if (table === "historical_events") return row.description ?? row.summary ?? "";
    if (table === "locations") return row.history ?? row.description ?? "";
    if (table === "people") return row.biography ?? row.contribution ?? "";
    if (table === "archive_items") return row.description ?? row.caption ?? "";
    if (table === "documents") return row.description ?? "";
    return "";
  }

  function renderTitle() {
    if (table === "locations") return row.name;
    if (table === "people") return row.name;
    return row.title ?? row.name ?? "";
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1" onClick={onClose} />
      <aside className="w-full max-w-3xl overflow-auto border-l border-border bg-background p-6 rtl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">مراجعة المسودة</h2>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>إغلاق</Button>
          </div>
        </div>

        <div className="mt-4 grid gap-4">
          <div>
            <h3 className="text-sm font-medium">العنوان</h3>
            <p className="mt-1 text-foreground">{renderTitle()}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium">المحتوى</h3>
            {!editing && (
              <div className="mt-2 prose max-w-none">
                <div>{renderBody()}</div>
              </div>
            )}

            {editing && (
              <DraftEditForm
                table={table}
                id={id}
                initial={row}
                onCancel={() => setEditing(false)}
                onSave={async (payload: any) => {
                  await saveMutation.mutateAsync(payload);
                  setEditing(false);
                }}
              />
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium">المصادر</h3>
            <p className="mt-1 text-sm text-muted-foreground">{row.sources ?? row.source ?? "غير متوفر"}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium">بيانات</h3>
            <p className="mt-1 text-xs text-muted-foreground">تم الإنشاء: {new Date(row.created_at).toLocaleString("ar")}</p>
            {row.updated_at ? (
              <p className="mt-1 text-xs text-muted-foreground">آخر تعديل: {new Date(row.updated_at).toLocaleString("ar")}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setEditing(true)}>تعديل المسودة</Button>
            <Button size="sm" variant="outline" onClick={() => setShowReject(true)}>رفض المسودة</Button>
            <Button size="sm" variant="secondary" onClick={() => setPreviewMode((p) => !p)}>عرض معاينة</Button>

            {/* Approve & Publish — invokes canonical MCP publish_content tool */}
            <Button
              size="sm"
              className="ml-auto"
              onClick={async () => {
                // confirmation
                if (!confirm("هل أنت متأكد من اعتماد ونشر هذه المسودة؟")) return;

                // Map table -> MCP content type
                const map: Record<string, string> = {
                  articles: "article",
                  historical_events: "historical_event",
                  locations: "location",
                  people: "person",
                  archive_items: "archive_item",
                  documents: "document",
                };
                const mcpType = map[table];
                if (!mcpType) {
                  toast.error("نوع المحتوى غير مدعوم للنشر.");
                  return;
                }

                try {
                  const resp = await fetch("/.mcp/invoke-tool/publish_content", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ input: { type: mcpType, id, published: true } }),
                  });

                  const json = await resp.json().catch(() => null);
                  if (!resp.ok) {
                    const message = json?.message || json?.error || resp.statusText || "خطأ غير معروف";
                    toast.error(`تعذّر نشر المسودة: ${message}`);
                    return;
                  }

                  // MCP returns tool result structure — treat non-OK tool responses as errors
                  if (json && json.error) {
                    toast.error(`تعذّر نشر المسودة: ${json.error}`);
                    return;
                  }

                  // Success
                  toast.success("تم نشر المسودة وأصبحت ظاهرة في الموقع العام.");
                  qc.invalidateQueries({ queryKey: ["admin", "drafts_v2"] });
                  qc.invalidateQueries({ queryKey: ["admin", "draft", table, id] });
                  onClose();
                } catch (err: any) {
                  toast.error(`تعذّر نشر المسودة: ${err?.message ?? String(err)}`);
                }
              }}
            >
              اعتماد ونشر
            </Button>
          </div>

          {previewMode && (
            <div className="mt-4 rounded border border-border bg-card p-4">
              <h3 className="text-sm font-medium">معاينة المحتوى</h3>
              <div className="mt-3 prose max-w-none">{renderBody()}</div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-medium">سجل التدقيق (أحدث 50)</h3>
            <div className="mt-2 grid gap-2">
              {(logs.data ?? []).map((l: any) => (
                <div key={l.id} className="rounded-lg border border-border bg-card p-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-foreground">{l.action}</span>
                    <span className="text-xs text-muted-foreground">{new Date(l.created_at).toLocaleString("ar")}</span>
                  </div>
                  {l.new_values ? (
                    <p className="mt-1 text-xs text-muted-foreground">{JSON.stringify(l.new_values)}</p>
                  ) : null}
                  {l.error_message ? (
                    <p className="mt-1 text-xs text-destructive">{l.error_message}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>

        {showReject && (
          <RejectModal
            table={table}
            id={id}
            onClose={() => setShowReject(false)}
            onRejected={() => {
              setShowReject(false);
              qc.invalidateQueries({ queryKey: ["admin", "audit", table, id] });
              qc.invalidateQueries({ queryKey: ["admin", "drafts_v2"] });
              onClose();
            }}
          />
        )}
      </aside>
    </div>,
    document.body,
  );
}
