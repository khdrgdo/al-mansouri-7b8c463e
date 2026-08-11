// Shared types for the application service layer (used by the Admin Dashboard
// and by the MCP server — business logic lives here, never in the transport).
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type AppClient = SupabaseClient<Database>;

export type Permission =
  | "read"
  | "create"
  | "update"
  | "publish"
  | "moderate"
  | "delete"
  | "manage_settings";

export type Actor = {
  client: AppClient;
  userId?: string | undefined;
  email?: string | undefined;
  clientId?: string | undefined;
  role: "admin" | "editor" | "guest";
  permissions: Permission[];
};

export class ServiceError extends Error {
  code: "forbidden" | "not_found" | "invalid" | "disabled" | "failed";
  constructor(code: ServiceError["code"], message: string) {
    super(message);
    this.code = code;
  }
}
