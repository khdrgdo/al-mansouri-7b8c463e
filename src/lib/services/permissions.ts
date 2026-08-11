import type { Actor, AppClient, Permission } from "./types";
import { ServiceError } from "./types";

const ROLE_PERMISSIONS: Record<Actor["role"], Permission[]> = {
  admin: ["read", "create", "update", "publish", "moderate", "delete", "manage_settings"],
  editor: ["read", "create", "update", "publish", "moderate"],
  guest: ["read"],
};

/** Resolve the acting user's role from the existing user_roles table (RLS-scoped client). */
export async function resolveActor(
  client: AppClient,
  identity: { userId?: string | undefined; email?: string | undefined; clientId?: string | undefined },
): Promise<Actor> {
  let role: Actor["role"] = "guest";

  if (identity.userId) {
    const { data } = await client
      .from("user_roles")
      .select("role")
      .eq("user_id", identity.userId);
    const roles = (data ?? []).map((r) => r.role as string);
    if (roles.includes("admin")) role = "admin";
    else if (roles.includes("editor")) role = "editor";
  }

  return {
    client,
    userId: identity.userId,
    email: identity.email,
    clientId: identity.clientId,
    role,
    permissions: ROLE_PERMISSIONS[role],
  };
}

/** Capability switches an administrator can toggle from Admin → MCP. */
export async function capabilityEnabled(client: AppClient, key: Permission): Promise<boolean> {
  const { data, error } = await client
    .from("mcp_capabilities")
    .select("enabled")
    .eq("key", key)
    .maybeSingle();
  // Unknown/unreadable capability rows default to enabled only for reads.
  if (error || !data) return key === "read";
  return data.enabled;
}

export async function requirePermission(actor: Actor, permission: Permission): Promise<void> {
  if (!actor.userId) {
    throw new ServiceError("forbidden", "هذه العملية تتطلب تسجيل الدخول عبر OAuth.");
  }
  if (!actor.permissions.includes(permission)) {
    throw new ServiceError(
      "forbidden",
      `صلاحية «${permission}» غير متاحة لحسابك (الدور الحالي: ${actor.role}).`,
    );
  }
  if (permission !== "read" && !(await capabilityEnabled(actor.client, permission))) {
    throw new ServiceError(
      "disabled",
      `قدرة «${permission}» معطّلة حاليًا من لوحة الإدارة (Admin → MCP).`,
    );
  }
}
