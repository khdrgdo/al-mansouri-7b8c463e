import type { Actor } from "./types";
import { ServiceError } from "./types";
import { requirePermission } from "./permissions";
import { recordAudit } from "./audit";

type ModerationTarget = "comment" | "submission" | "advertisement";

const TARGETS: Record<ModerationTarget, { table: "comments" | "submissions" | "advertisements"; label: string; select: string }> = {
  comment: {
    table: "comments",
    label: "تعليق",
    select: "id, author_name, body, status, target_type, target_id, reported, created_at",
  },
  submission: {
    table: "submissions",
    label: "مساهمة",
    select:
      "id, contributor_name, content_type, title, description, location_text, approx_date, source_context, status, admin_notes, created_at",
  },
  advertisement: {
    table: "advertisements",
    label: "إعلان",
    select: "id, advertiser_name, title, description, status, admin_notes, created_at",
  },
};

export async function moderate(
  actor: Actor,
  target: ModerationTarget,
  id: string,
  status: "approved" | "rejected" | "pending",
  toolName: string,
  notes?: string | undefined,
) {
  await requirePermission(actor, "moderate");
  const cfg = TARGETS[target];

  const { data: before, error: beforeError } = await actor.client
    .from(cfg.table)
    .select(cfg.select)
    .eq("id", id)
    .maybeSingle();
  if (beforeError) throw new ServiceError("failed", beforeError.message);
  if (!before) throw new ServiceError("not_found", `لا يوجد ${cfg.label} بالمعرّف ${id}.`);

  const values: Record<string, unknown> = { status };
  if (notes && cfg.table !== "comments") values["admin_notes"] = notes;

  const { data, error } = await actor.client
    .from(cfg.table)
    .update(values as never)
    .eq("id", id)
    .select(cfg.select)
    .single();

  if (error) {
    await recordAudit(actor, {
      toolName,
      action: `moderate_${status}`,
      contentType: target,
      contentId: id,
      result: "error",
      errorMessage: error.message,
      newValues: values,
    });
    throw new ServiceError("failed", error.message);
  }

  await recordAudit(actor, {
    toolName,
    action: `moderate_${status}`,
    contentType: target,
    contentId: id,
    previousValues: { status: (before as Record<string, unknown>)["status"] },
    newValues: values,
  });

  return data as Record<string, unknown>;
}
