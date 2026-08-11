import type { Actor } from "./types";
import { ServiceError } from "./types";
import { requirePermission } from "./permissions";
import { recordAudit } from "./audit";

export type ContentType =
  | "article"
  | "historical_event"
  | "location"
  | "person"
  | "archive_item"
  | "document"
  | "advertisement";

type ContentConfig = {
  table:
    | "articles"
    | "historical_events"
    | "locations"
    | "people"
    | "archive_items"
    | "documents"
    | "advertisements";
  label: string;
  slugField: boolean;
  titleField: "title" | "name";
  /** Fields an MCP client may write. Anything else is rejected. */
  writable: string[];
  /** Fields returned to AI clients on read (no private/admin columns). */
  publicSelect: string;
  /** Public URL builder for the live site. */
  urlPath?: string;
  requiresSource: boolean;
  publishable: boolean;
};

export const CONTENT: Record<ContentType, ContentConfig> = {
  article: {
    table: "articles",
    label: "مقال",
    slugField: true,
    titleField: "title",
    writable: [
      "slug",
      "title",
      "excerpt",
      "content",
      "cover_image_url",
      "author",
      "category_id",
      "published_at",
      "sources",
      "verification",
      "published",
      "seo_title",
      "seo_description",
    ],
    publicSelect:
      "id, slug, title, excerpt, content, cover_image_url, author, category_id, published_at, sources, verification, published, created_at, updated_at",
    urlPath: "/articles/",
    requiresSource: true,
    publishable: true,
  },
  historical_event: {
    table: "historical_events",
    label: "حدث تاريخي",
    slugField: true,
    titleField: "title",
    writable: [
      "slug",
      "title",
      "period",
      "event_date",
      "sort_order",
      "summary",
      "description",
      "cover_image_url",
      "images",
      "sources",
      "references_text",
      "verification",
      "published",
      "seo_title",
      "seo_description",
    ],
    publicSelect:
      "id, slug, title, period, event_date, summary, description, cover_image_url, images, sources, references_text, verification, published, created_at, updated_at",
    urlPath: "/history/",
    requiresSource: true,
    publishable: true,
  },
  location: {
    table: "locations",
    label: "موقع",
    slugField: true,
    titleField: "name",
    writable: [
      "slug",
      "name",
      "kind",
      "description",
      "history",
      "address",
      "latitude",
      "longitude",
      "cover_image_url",
      "images",
      "sources",
      "verification",
      "published",
      "seo_title",
      "seo_description",
    ],
    publicSelect:
      "id, slug, name, kind, description, history, address, latitude, longitude, cover_image_url, images, sources, verification, published, created_at, updated_at",
    urlPath: "/locations/",
    requiresSource: false,
    publishable: true,
  },
  person: {
    table: "people",
    label: "شخصية",
    slugField: true,
    titleField: "name",
    writable: [
      "slug",
      "name",
      "photo_url",
      "biography",
      "birth_info",
      "death_info",
      "role_title",
      "location_id",
      "contribution",
      "sources",
      "verification",
      "published",
      "seo_title",
      "seo_description",
    ],
    publicSelect:
      "id, slug, name, photo_url, biography, birth_info, death_info, role_title, location_id, contribution, sources, verification, published, created_at, updated_at",
    urlPath: "/people/",
    requiresSource: true,
    publishable: true,
  },
  archive_item: {
    table: "archive_items",
    label: "مادة أرشيفية",
    slugField: true,
    titleField: "title",
    writable: [
      "slug",
      "title",
      "description",
      "media_url",
      "media_type",
      "file_name",
      "alt_text",
      "caption",
      "item_date",
      "location_id",
      "category_id",
      "source",
      "contributor",
      "verification",
      "published",
    ],
    publicSelect:
      "id, slug, title, description, media_url, media_type, alt_text, caption, item_date, location_id, category_id, source, contributor, verification, published, created_at, updated_at",
    urlPath: "/archive",
    requiresSource: true,
    publishable: true,
  },
  document: {
    table: "documents",
    label: "وثيقة",
    slugField: false,
    titleField: "title",
    writable: [
      "title",
      "description",
      "file_url",
      "file_name",
      "file_type",
      "file_size",
      "source",
      "verification",
      "published",
    ],
    publicSelect:
      "id, title, description, file_url, file_name, file_type, source, verification, published, created_at, updated_at",
    requiresSource: true,
    publishable: true,
  },
  advertisement: {
    table: "advertisements",
    label: "إعلان",
    slugField: false,
    titleField: "title",
    writable: [
      "advertiser_name",
      "title",
      "description",
      "category_id",
      "category_slug",
      "phone",
      "location_text",
      "image_url",
      "website",
      "start_date",
      "end_date",
      "status",
      "admin_notes",
    ],
    publicSelect:
      "id, advertiser_name, title, description, category_slug, phone, location_text, image_url, website, start_date, end_date, status, created_at, updated_at",
    urlPath: "/ads",
    requiresSource: false,
    publishable: false,
  },
};

export const VERIFICATION_VALUES = ["verified", "oral", "unverified"] as const;

export function publicUrl(type: ContentType, row: Record<string, unknown>): string | null {
  const cfg = CONTENT[type];
  if (!cfg.urlPath) return null;
  if (!cfg.slugField) return cfg.urlPath;
  return `${cfg.urlPath}${String(row["slug"] ?? "")}`;
}

function slugify(input: string): string {
  return (
    input
      .trim()
      .replace(/[^\p{L}\p{N}]+/gu, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase()
      .slice(0, 80) || `item-${Date.now()}`
  );
}

function pickWritable(type: ContentType, input: Record<string, unknown>) {
  const cfg = CONTENT[type];
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(input)) {
    if (v === undefined) continue;
    if (!cfg.writable.includes(k)) {
      throw new ServiceError("invalid", `الحقل «${k}» غير قابل للكتابة على ${cfg.label}.`);
    }
    out[k] = v;
  }
  return out;
}

export async function createContent(
  actor: Actor,
  type: ContentType,
  input: Record<string, unknown>,
  toolName: string,
) {
  await requirePermission(actor, "create");
  const cfg = CONTENT[type];
  const values = pickWritable(type, input);

  if (cfg.slugField && !values["slug"]) {
    values["slug"] = slugify(String(values[cfg.titleField] ?? ""));
  }
  if (cfg.requiresSource) {
    const hasSource = Boolean(values["sources"] ?? values["source"] ?? values["references_text"]);
    const verification = String(values["verification"] ?? "unverified");
    if (!hasSource && verification === "verified") {
      throw new ServiceError(
        "invalid",
        "لا يمكن تعليم المحتوى كـ«موثّق» بدون ذكر المصدر (sources/source).",
      );
    }
    if (!values["verification"]) values["verification"] = hasSource ? "verified" : "unverified";
  }
  // Publishing is a separate, permission-gated action.
  if (cfg.publishable && values["published"] === true) {
    await requirePermission(actor, "publish");
  }

  const { data, error } = await actor.client
    .from(cfg.table)
    .insert(values as never)
    .select(cfg.publicSelect)
    .single();

  if (error) {
    await recordAudit(actor, {
      toolName,
      action: "create",
      contentType: type,
      result: "error",
      errorMessage: error.message,
      newValues: values,
    });
    throw new ServiceError("failed", error.message);
  }

  const row = data as Record<string, unknown>;
  await recordAudit(actor, {
    toolName,
    action: "create",
    contentType: type,
    contentId: String(row["id"]),
    newValues: values,
  });
  return { ...row, public_url: publicUrl(type, row) };
}

export async function updateContent(
  actor: Actor,
  type: ContentType,
  id: string,
  input: Record<string, unknown>,
  toolName: string,
  action = "update",
) {
  await requirePermission(actor, action === "update" ? "update" : "publish");
  const cfg = CONTENT[type];
  const values = pickWritable(type, input);
  if (Object.keys(values).length === 0) {
    throw new ServiceError("invalid", "لم يتم تمرير أي حقل للتعديل.");
  }
  if (cfg.publishable && "published" in values) {
    await requirePermission(actor, "publish");
  }

  const { data: before, error: beforeError } = await actor.client
    .from(cfg.table)
    .select(cfg.publicSelect)
    .eq("id", id)
    .maybeSingle();
  if (beforeError) throw new ServiceError("failed", beforeError.message);
  if (!before) throw new ServiceError("not_found", `لا يوجد ${cfg.label} بالمعرّف ${id}.`);

  const { data, error } = await actor.client
    .from(cfg.table)
    .update(values as never)
    .eq("id", id)
    .select(cfg.publicSelect)
    .single();

  if (error) {
    await recordAudit(actor, {
      toolName,
      action,
      contentType: type,
      contentId: id,
      result: "error",
      errorMessage: error.message,
      newValues: values,
    });
    throw new ServiceError("failed", error.message);
  }

  const previous: Record<string, unknown> = {};
  for (const key of Object.keys(values)) {
    previous[key] = (before as Record<string, unknown>)[key] ?? null;
  }

  await recordAudit(actor, {
    toolName,
    action,
    contentType: type,
    contentId: id,
    previousValues: previous,
    newValues: values,
  });

  const row = data as Record<string, unknown>;
  return { ...row, public_url: publicUrl(type, row) };
}

/**
 * Controlled delete. Default behaviour is a soft delete (unpublish + archive
 * marker in the audit log); hard deletion requires an explicit confirmation.
 */
export async function deleteContent(
  actor: Actor,
  type: ContentType,
  id: string,
  mode: "soft" | "permanent",
  toolName: string,
) {
  await requirePermission(actor, "delete");
  const cfg = CONTENT[type];

  const { data: before, error: beforeError } = await actor.client
    .from(cfg.table)
    .select(cfg.publicSelect)
    .eq("id", id)
    .maybeSingle();
  if (beforeError) throw new ServiceError("failed", beforeError.message);
  if (!before) throw new ServiceError("not_found", `لا يوجد ${cfg.label} بالمعرّف ${id}.`);

  if (mode === "soft") {
    const values = cfg.publishable ? { published: false } : { status: "paused" };
    const { error } = await actor.client
      .from(cfg.table)
      .update(values as never)
      .eq("id", id);
    if (error) throw new ServiceError("failed", error.message);
    await recordAudit(actor, {
      toolName,
      action: "soft_delete",
      contentType: type,
      contentId: id,
      previousValues: before as Record<string, unknown>,
      newValues: values,
    });
    return { id, mode, message: `تمت أرشفة ${cfg.label} (إخفاء من الموقع دون حذف نهائي).` };
  }

  const { error } = await actor.client.from(cfg.table).delete().eq("id", id);
  if (error) {
    await recordAudit(actor, {
      toolName,
      action: "delete",
      contentType: type,
      contentId: id,
      result: "error",
      errorMessage: error.message,
    });
    throw new ServiceError("failed", error.message);
  }
  await recordAudit(actor, {
    toolName,
    action: "delete",
    contentType: type,
    contentId: id,
    previousValues: before as Record<string, unknown>,
  });
  return { id, mode, message: `تم حذف ${cfg.label} نهائيًا.` };
}

export async function setPublished(
  actor: Actor,
  type: ContentType,
  id: string,
  published: boolean,
  toolName: string,
) {
  const cfg = CONTENT[type];
  if (!cfg.publishable) {
    throw new ServiceError("invalid", `${cfg.label} لا يستخدم حالة النشر — استخدم أدوات المراجعة.`);
  }
  return updateContent(actor, type, id, { published }, toolName, published ? "publish" : "unpublish");
}
