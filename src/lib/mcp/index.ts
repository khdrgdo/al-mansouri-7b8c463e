// MCP server entrypoint. The Vite plugin (`mcpPlugin()` in vite.config.ts)
// reads this default export at build time and emits the TanStack routes for
// the MCP protocol endpoint, the REST tool-listing companions, and the
// OAuth protected-resource metadata document.
//
// Auth: tokens are verified against this project's own Supabase Auth
// instance acting as an OAuth 2.1 authorization server (RFC 9728). Every
// tool call still goes through the caller's RLS-scoped Supabase client
// (see src/lib/mcp/supabase.ts) — the OAuth layer only establishes *who*
// is calling; row-level security and the capability/permission checks in
// src/lib/services decide *what* they can do.
import { auth, defineMcp } from "@lovable.dev/mcp-js";
import { supabaseProjectUrl } from "./supabase";

import createContent from "./tools/create-content";
import getContent from "./tools/get-content";
import publishContent from "./tools/publish-content";
import searchContent from "./tools/search-content";
import updateContent from "./tools/update-content";

export default defineMcp({
  name: "al-mansouri-memory",
  version: "1.0.0",
  title: "ذاكرة المناصير",
  instructions:
    "أدوات القراءة والكتابة على محتوى منصة «ذاكرة المناصير» (مقالات، أحداث تاريخية، مواقع، شخصيات، أرشيف، وثائق، إعلانات) — بمصادقة OAuth ونطاق RLS على مستوى المستخدم. استخدم search_content وget_content للقراءة، وcreate_content/update_content لتحرير المسودات، ثم publish_content لنشرها وإظهارها في الموقع العام. النشر متاح للحسابات ذات دور admin فقط عندما تكون قدرة publish مفعّلة.",
  auth: auth.oauth.issuer({
    // This project's Supabase Auth instance is the OAuth 2.1 issuer.
    // Its JWKS/discovery documents live at the standard well-known paths
    // under the same origin, so no separate jwksUri is needed.
    issuer: `${supabaseProjectUrl()}/auth/v1`,
    // Supabase mints a project-wide `aud: "authenticated"` claim, not a
    // per-resource one (per the SDK's own guidance) — so audience
    // acceptance is checked against that fixed value, and actual
    // per-caller authorization happens downstream in src/lib/services
    // (via ctx.getClaims()/getClientId()), not via audience matching.
    acceptedAudiences: "authenticated",
    resourceName: "ذاكرة المناصير",
  }),
  tools: [
    createContent,
    getContent,
    publishContent,
    searchContent,
    updateContent,
  ] as unknown as Parameters<typeof defineMcp>[0]["tools"],
});
