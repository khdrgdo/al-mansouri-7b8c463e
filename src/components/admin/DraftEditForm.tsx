import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function DraftEditForm({ table, id, initial, onCancel, onSave }: any) {
  const [form, setForm] = useState<any>({});

  // initialize basic fields
  const title = initial?.title ?? initial?.name ?? "";

  function handleChange(key: string, value: any) {
    setForm((f: any) => ({ ...f, [key]: value }));
  }

  function handleSave() {
    const payload: any = {};
    if (table === "articles") {
      payload.title = form.title ?? title;
      payload.content = form.content ?? initial.content;
      payload.excerpt = form.excerpt ?? initial.excerpt;
      payload.sources = form.sources ?? initial.sources;
    } else if (table === "historical_events") {
      payload.title = form.title ?? title;
      payload.description = form.description ?? initial.description;
      payload.summary = form.summary ?? initial.summary;
      payload.sources = form.sources ?? initial.sources;
    } else if (table === "locations") {
      payload.name = form.name ?? title;
      payload.history = form.history ?? initial.history;
      payload.description = form.description ?? initial.description;
      payload.sources = form.sources ?? initial.sources;
    } else if (table === "people") {
      payload.name = form.name ?? title;
      payload.biography = form.biography ?? initial.biography;
      payload.contribution = form.contribution ?? initial.contribution;
      payload.sources = form.sources ?? initial.sources;
    } else if (table === "archive_items") {
      payload.title = form.title ?? title;
      payload.description = form.description ?? initial.description;
      payload.contributor = form.contributor ?? initial.contributor;
      payload.source = form.source ?? initial.source;
    } else if (table === "documents") {
      payload.title = form.title ?? title;
      payload.description = form.description ?? initial.description;
      payload.source = form.source ?? initial.source;
    }

    onSave(payload);
  }

  return (
    <div className="mt-2 grid gap-2">
      {/* render a few common fields */}
      <div>
        <label className="text-xs font-medium">العنوان</label>
        <input
          className="mt-1 w-full rounded border bg-input px-3 py-2 text-sm"
          defaultValue={title}
          onChange={(e) => handleChange(table === "locations" || table === "people" ? "name" : "title", e.target.value)}
        />
      </div>

      <div>
        <label className="text-xs font-medium">المحتوى</label>
        <textarea
          className="mt-1 w-full rounded border bg-input px-3 py-2 text-sm"
          defaultValue={
            table === "articles"
              ? initial?.content ?? initial?.excerpt
              : table === "historical_events"
              ? initial?.description ?? initial?.summary
              : table === "locations"
              ? initial?.history ?? initial?.description
              : table === "people"
              ? initial?.biography
              : initial?.description
          }
          onChange={(e) => handleChange("content", e.target.value)}
          rows={8}
        />
      </div>

      <div>
        <label className="text-xs font-medium">المصادر</label>
        <input
          className="mt-1 w-full rounded border bg-input px-3 py-2 text-sm"
          defaultValue={initial?.sources ?? initial?.source ?? ""}
          onChange={(e) => handleChange("sources", e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave}>حفظ</Button>
        <Button size="sm" variant="outline" onClick={onCancel}>إلغاء</Button>
      </div>
    </div>
  );
}
