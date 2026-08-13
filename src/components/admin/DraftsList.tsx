import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import DraftReviewDrawer from "./DraftReviewDrawer";

export default function DraftsList() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<null | { table: string; id: string }>(null);

  const drafts = useQuery({
    queryKey: ["admin", "drafts_v2"],
    queryFn: async () => {
      const queries = [
        supabase.from("articles").select("id, title, excerpt, created_at, author, sources").eq("published", false),
        supabase.from("historical_events").select("id, title, summary, created_at, event_date, sources").eq("published", false),
        supabase.from("locations").select("id, name, description, created_at, sources").eq("published", false),
        supabase.from("people").select("id, name, biography, created_at, sources").eq("published", false),
        supabase.from("archive_items").select("id, title, description, created_at, contributor, source").eq("published", false),
        supabase.from("documents").select("id, title, description, created_at, source").eq("published", false),
      ] as const;
      const results = await Promise.all(queries);
      const error = results.find((r) => (r as any).error)?.error;
      if (error) throw error;
      const types = [
        "articles",
        "historical_events",
        "locations",
        "people",
        "archive_items",
        "documents",
      ] as const;
      const rows: Array<any> = results.flatMap((result, index) =>
        (result.data ?? []).map((row: any) => ({
          id: row.id,
          table: types[index],
          title: row.title ?? row.name ?? "مسودة بلا عنوان",
          subtitle:
            row.excerpt ?? row.summary ?? row.description ?? row.biography ?? row.contributor ?? null,
          created_at: row.created_at,
          meta: {
            author: row.author ?? row.contributor ?? null,
            event_date: row.event_date ?? null,
            sources: row.sources ?? row.source ?? null,
          },
        })),
      );
      rows.sort((a, b) => b.created_at.localeCompare(a.created_at));
      return rows;
    },
  });

  const audit = useQuery({
    queryKey: ["admin", "drafts_audit"],
    enabled: Boolean(drafts.data && drafts.data.length > 0),
    queryFn: async () => {
      const ids = (drafts.data ?? []).map((d: any) => d.id);
      if (ids.length === 0) return [];
      const { data, error } = await supabase
        .from("audit_logs")
        .select("id, action, content_type, content_id, actor_email, created_at, new_values, result")
        .in("content_id", ids)
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data;
    },
  });

  function getRejectFor(draft: any) {
    if (!audit.data) return null;
    return audit.data.find((a: any) => a.content_id === draft.id && a.content_type === draft.table && a.action === "reject");
  }

  return (
    <div className="grid gap-3">
      {drafts.isLoading ? (
        <div className="rounded-lg border border-border bg-card p-4">جارٍ تحميل المسودات…</div>
      ) : drafts.isError ? (
        <div className="rounded-lg border border-border bg-card p-4 text-destructive">حدث خطأ أثناء جلب المسودات.</div>
      ) : drafts.data && drafts.data.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-4">لا توجد مسودات غير منشورة.</div>
      ) : (
        (drafts.data ?? []).map((d: any) => (
          <div key={`${d.table}-${d.id}`} className="rounded-lg border border-border bg-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-foreground">{d.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {d.table} · {new Date(d.created_at).toLocaleString("ar")}
                </p>
                {d.subtitle ? (
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{d.subtitle}</p>
                ) : null}
                {getRejectFor(d) ? (
                  <p className="mt-2 text-xs text-destructive">مرفوض — {new Date(getRejectFor(d).created_at).toLocaleString("ar")}</p>
                ) : null}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setSelected({ table: d.table, id: d.id })}>
                  مراجعة
                </Button>
              </div>
            </div>
          </div>
        ))
      )}

      {selected ? (
        <DraftReviewDrawer
          table={selected.table}
          id={selected.id}
          onClose={() => {
            setSelected(null);
            qc.invalidateQueries({ queryKey: ["admin", "drafts_v2"] });
            qc.invalidateQueries({ queryKey: ["admin", "drafts_audit"] });
          }}
        />
      ) : null}
    </div>
  );
}
