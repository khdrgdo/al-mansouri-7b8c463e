import type { Actor } from "./types";

export type AuditEntry = {
  toolName: string;
  action: string;
  contentType?: string | null;
  contentId?: string | null;
  result?: "success" | "error";
  errorMessage?: string | null;
  previousValues?: Record<string, unknown> | null;
  newValues?: Record<string, unknown> | null;
  source?: string;
};

/** Records every write performed through MCP (or any other service caller). */
export async function recordAudit(actor: Actor, entry: AuditEntry): Promise<void> {
  try {
    await actor.client.from("audit_logs").insert({
      actor_id: actor.userId ?? null,
      actor_email: actor.email ?? null,
      actor_client: actor.clientId ?? null,
      source: entry.source ?? "mcp",
      tool_name: entry.toolName,
      action: entry.action,
      content_type: entry.contentType ?? null,
      content_id: entry.contentId ?? null,
      result: entry.result ?? "success",
      error_message: entry.errorMessage ?? null,
      previous_values: (entry.previousValues ?? null) as never,
      new_values: (entry.newValues ?? null) as never,
    });
  } catch (error) {
    console.error("[audit] failed to record entry", error);
  }
}
