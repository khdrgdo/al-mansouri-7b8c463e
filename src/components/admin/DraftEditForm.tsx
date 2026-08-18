import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { DraftTable } from "./DraftReviewDrawer";

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

export default function DraftEditForm({
  table,
  initial,
  onCancel,
  onSave,
}: {
  table: DraftTable;
  id: string;
  initial: Record<string, unknown>;
  onCancel: () => void;
  onSave: (payload: Record<string, unknown>) => void;
}) {
  const [form, setForm] = useState<Record<string, unknown>>({});

  // initialize basic fields
  const title = str(initial?.["title"] ?? initial?.["name"]);

  // Was hardcoded to "content" for every table, but only `articles` has a
  // `content` column — every other type's body lives in a different
  // column, so edits to it were silently dropped on save.
  const bodyField =
    table === "articles"
      ? "content"
      : table === "historical_events"
        ? "description"
        : table === "locations"
          ? "history"
          : table === "people"
            ? "biography"
            : "description"; // archive_items, documents

  function handleChange(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSave() {
    const payload: Record<string, unknown> = {};
    if (table === "articles") {
      payload["title"] = form["title"] ?? title;
      payload["content"] = form[bodyField] ?? initial["content"];
      payload["excerpt"] = form["excerpt"] ?? initial["excerpt"];
      payload["sources"] = form["sources"] ?? initial["sources"];
    } else if (table === "historical_events") {
      payload["title"] = form["title"] ?? title;
      payload["description"] = form[bodyField] ?? initial["description"];
      payload["summary"] = form["summary"] ?? initial["summary"];
      payload["sources"] = form["sources"] ?? initial["sources"];
    } else if (table === "locations") {
      payload["name"] = form["name"] ?? title;
      payload["history"] = form[bodyField] ?? initial["history"];
      payload["description"] = form["description"] ?? initial["description"];
      payload["sources"] = form["sources"] ?? initial["sources"];
    } else if (table === "people") {
      payload["name"] = form["name"] ?? title;
      payload["biography"] = form[bodyField] ?? initial["biography"];
      payload["contribution"] = form["contribution"] ?? initial["contribution"];
      payload["sources"] = form["sources"] ?? initial["sources"];
    } else if (table === "archive_items") {
      payload["title"] = form["title"] ?? title;
      payload["description"] = form[bodyField] ?? initial["description"];
      payload["contributor"] = form["contributor"] ?? initial["contributor"];
      payload["source"] = form["source"] ?? initial["source"];
    } else if (table === "documents") {
      payload["title"] = form["title"] ?? title;
      payload["description"] = form[bodyField] ?? initial["description"];
      payload["source"] = form["source"] ?? initial["source"];
    }

    onSave(payload);
  }

  const bodyDefault =
    table === "articles"
      ? str(initial?.["content"] ?? initial?.["excerpt"])
      : table === "historical_events"
        ? str(initial?.["description"] ?? initial?.["summary"])
        : table === "locations"
          ? str(initial?.["history"] ?? initial?.["description"])
          : table === "people"
            ? str(initial?.["biography"])
            : str(initial?.["description"]);

  return (
    <div className="mt-2 grid gap-2">
      {/* render a few common fields */}
      <div>
        <label className="text-xs font-medium">العنوان</label>
        <input
          className="mt-1 w-full rounded border bg-input px-3 py-2 text-sm"
          defaultValue={title}
          onChange={(e) =>
            handleChange(
              table === "locations" || table === "people" ? "name" : "title",
              e.target.value,
            )
          }
        />
      </div>

      <div>
        <label className="text-xs font-medium">المحتوى</label>
        <textarea
          className="mt-1 w-full rounded border bg-input px-3 py-2 text-sm"
          defaultValue={bodyDefault}
          onChange={(e) => handleChange(bodyField, e.target.value)}
          rows={8}
        />
      </div>

      <div>
        <label className="text-xs font-medium">المصادر</label>
        <input
          className="mt-1 w-full rounded border bg-input px-3 py-2 text-sm"
          defaultValue={str(initial?.["sources"] ?? initial?.["source"])}
          onChange={(e) => handleChange("sources", e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave}>
          حفظ
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}>
          إلغاء
        </Button>
      </div>
    </div>
  );
}
