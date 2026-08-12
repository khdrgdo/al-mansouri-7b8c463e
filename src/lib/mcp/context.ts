// Shared MCP tool context: identity resolution, capability gating, audit-aware
// error handling. Every tool goes through here so behaviour stays identical to
// the Admin Dashboard (same service layer, same RLS, same audit trail).
import { ToolError, type ToolContext } from "@lovable.dev/mcp-js";
import { resolveActor } from "@/lib/services/permissions";
import { recordAudit } from "@/lib/services/audit";
import { ServiceError, type Actor } from "@/lib/services/types";
import { runtimeEnv, supabaseForUser } from "./supabase";

export type ToolResult = {
  content: { type: "text"; text: string }[];
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
};

export function ok(payload: unknown): ToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
    structuredContent: (payload && typeof payload === "object" && !Array.isArray(payload)
      ? (payload as Record<string, unknown>)
      : { result: payload }) as Record<string, unknown>,
  };
}

/** Builds an RLS-scoped actor from the verified OAuth token. */
export async function getActor(ctx: ToolContext): Promise<Actor> {
  if (!ctx.isAuthenticated() || !ctx.getUserId()) {
    throw new ToolError("هذه الأداة تتطلب تسجيل الدخول عبر OAuth بحساب من فريق «ذاكرة المناصير».");
  }
  const claims = ctx.getClaims() as Record<string, unknown> | undefined;
  const email = ctx.getUserEmail() ?? (claims?.["email"] as string | undefined);
  return resolveActor(supabaseForUser(ctx), {
    userId: ctx.getUserId(),
    email,
    clientId: ctx.getClientId(),
  });
}

/**
 * Publishing tools (publish_content, publish_batch, rollback_last_publish_batch)
 * are restricted to the registered *internal admin dashboard* OAuth client.
 * Any other OAuth client — including general-purpose external AI clients — is
 * rejected even when the signed-in user is an admin. The allowed client id is
 * configured in the `MCP_INTERNAL_CLIENT_ID` secret.
 */
export async function requireInternalAdminClient(actor: Actor, toolName: string): Promise<void> {
  const allowed = runtimeEnv("MCP_INTERNAL_CLIENT_ID")?.trim();
  const clientId = actor.clientId?.trim();
  if (!allowed || !clientId || clientId !== allowed) {
    await recordAudit(actor, {
      toolName,
      action: "client_denied",
      result: "rejected",
      errorMessage: `client_id=${clientId ?? "unknown"}`,
    });
    throw new ToolError(
      "أدوات النشر مقصورة على عميل «لوحة الإدارة الداخلية» المسجَّل فقط. هذا العميل غير مصرّح له بالنشر حتى لو كان الحساب مشرفًا.",
    );
  }
}

const CODE_PREFIX: Record<ServiceError["code"], string> = {
  forbidden: "مرفوض",
  not_found: "غير موجود",
  invalid: "مدخلات غير صالحة",
  disabled: "قدرة معطّلة",
  failed: "فشل التنفيذ",
};

/** Wraps a tool handler: converts ServiceError → ToolError (Arabic) and logs rejections. */
export async function runTool(
  ctx: ToolContext,
  toolName: string,
  fn: (actor: Actor) => Promise<unknown>,
): Promise<ToolResult> {
  const actor = await getActor(ctx);
  try {
    return ok(await fn(actor));
  } catch (error) {
    if (error instanceof ServiceError) {
      await recordAudit(actor, {
        toolName,
        action: "rejected",
        result: "rejected",
        errorMessage: error.message,
      });
      throw new ToolError(`${CODE_PREFIX[error.code]}: ${error.message}`);
    }
    if (error instanceof ToolError) throw error;
    await recordAudit(actor, {
      toolName,
      action: "error",
      result: "error",
      errorMessage: (error as Error).message,
    });
    throw new ToolError(`فشل تنفيذ الأداة: ${(error as Error).message}`);
  }
}

export function requireStaff(actor: Actor, toolName: string) {
  if (actor.role === "guest") {
    throw new ToolError(
      `الأداة «${toolName}» متاحة لفريق التحرير والإدارة فقط (الدور الحالي: زائر).`,
    );
  }
}
