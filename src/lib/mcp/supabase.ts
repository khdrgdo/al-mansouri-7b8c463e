// Server-only Supabase client factory for the MCP layer.
// RLS is always applied: authenticated tools forward the caller's verified
// OAuth bearer token, so the database sees the real user. There is NO
// service-role client here on purpose.
import { createClient } from "@supabase/supabase-js";
import type { ToolContext } from "@lovable.dev/mcp-js";
import type { Database } from "@/integrations/supabase/types";

type RuntimeGlobals = typeof globalThis & {
  Deno?: { env?: { get?: (name: string) => string | undefined } };
  process?: { env?: Record<string, string | undefined> };
};

/**
 * `import.meta.env` is Vite's build-time-injected object — a real object in
 * the emitted bundle (not just textual substitution), so dynamic key access
 * works, and unlike `process.env` it needs no runtime platform support.
 * Checked first for exactly the reason src/integrations/supabase/client.ts
 * does: on Cloudflare Workers (this project's deploy target), `process.env`
 * is not guaranteed populated at module-evaluation time (Workers receive
 * env via per-request bindings, not a global at cold start) — reading it
 * eagerly at module scope, as this file's exports are (via defineMcp() in
 * ./index.ts), previously risked crashing the entire server bundle before
 * any request handler even ran.
 */
function importMetaEnv(name: string): string | undefined {
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  return env?.[name];
}

export function runtimeEnv(name: string): string | undefined {
  const runtime = globalThis as RuntimeGlobals;
  return importMetaEnv(name) ?? runtime.process?.env?.[name] ?? runtime.Deno?.env?.get?.(name);
}

function configuredEnv(names: readonly string[]): string | undefined {
  for (const name of names) {
    const value = runtimeEnv(name)?.trim();
    if (value) return value;
  }
  return undefined;
}

export function supabaseProjectUrl(): string {
  const url = configuredEnv(["SUPABASE_URL", "VITE_SUPABASE_URL"]);
  if (!url) throw new Error("SUPABASE_URL (or VITE_SUPABASE_URL) is required");
  return url;
}

function supabasePublishableKey(): string {
  const direct = configuredEnv(["SUPABASE_PUBLISHABLE_KEY", "VITE_SUPABASE_PUBLISHABLE_KEY"]);
  if (direct) return direct;
  const keyset = runtimeEnv("SUPABASE_PUBLISHABLE_KEYS");
  if (keyset) {
    try {
      const parsed: unknown = JSON.parse(keyset);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        const keys = parsed as Record<string, unknown>;
        const key = [keys["default"], ...Object.values(keys)]
          .find((v): v is string => typeof v === "string" && v.trim().startsWith("sb_publishable_"))
          ?.trim();
        if (key) return key;
      }
    } catch {
      /* fall through to legacy names */
    }
  }
  const legacy = configuredEnv(["SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY"]);
  if (legacy) return legacy;
  throw new Error("SUPABASE_PUBLISHABLE_KEY or SUPABASE_ANON_KEY is required");
}

function isOpaqueKey(value: string) {
  return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}

function buildFetch(apiKey: string, bearer?: string): typeof fetch {
  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );
    if (init?.headers) new Headers(init.headers).forEach((v, k) => headers.set(k, v));
    headers.set("apikey", apiKey);
    if (bearer) headers.set("Authorization", `Bearer ${bearer}`);
    else if (isOpaqueKey(apiKey) && headers.get("Authorization") === `Bearer ${apiKey}`) {
      headers.delete("Authorization");
    }
    return fetch(input, { ...init, headers });
  };
}

/** No caller identity — RLS runs as `anon` (public, published content only). */
export function supabaseAnon() {
  const key = supabasePublishableKey();
  return createClient<Database>(supabaseProjectUrl(), key, {
    global: { fetch: buildFetch(key) },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}

/** Forwards the verified OAuth bearer token so RLS runs as the signed-in user. */
export function supabaseForUser(ctx: ToolContext) {
  const token = ctx.getToken();
  if (!token) throw new Error("supabaseForUser requires a verified OAuth token");
  const key = supabasePublishableKey();
  return createClient<Database>(supabaseProjectUrl(), key, {
    global: { fetch: buildFetch(key, token) },
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });
}
