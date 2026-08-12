import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { CONTENT, publicUrl, type ContentType } from "@/lib/services/content-service";
import { runTool } from "../context";

const TYPES = Object.keys(CONTENT) as [ContentType, ...ContentType[]];

export default defineTool({
  name: "search_content",
  title: "بحث في المحتوى",
  description:
    "بحث نصي في محتوى «ذاكرة المناصير» (مقالات، أحداث، مواقع، شخصيات، أرشيف، وثائق، إعلانات) مع فلاتر للنوع وحالة النشر والتوثيق. قراءة فقط.",
  inputSchema: {
    query: z.string().trim().min(1).describe("نص البحث (عربي أو إنجليزي)."),
    types: z.array(z.enum(TYPES)).optional().describe("أنواع المحتوى المطلوب البحث فيها."),
    published: z.boolean().optional().describe("تصفية حسب حالة النشر."),
    verification: z.enum(["verified", "oral", "unverified"]).optional(),
    limit: z.number().int().min(1).max(50).default(10),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (input, ctx) =>
    runTool(ctx, "search_content", async (actor) => {
      const types = (input.types ?? TYPES) as ContentType[];
      const results: Record<string, unknown>[] = [];

      for (const type of types) {
        const cfg = CONTENT[type];
        const titleCol = cfg.titleField;
        type Loose = {
          eq: (col: string, val: unknown) => Loose;
          limit: (n: number) => Loose;
          then: never;
        };
        let q = actor.client
          .from(cfg.table)
          .select(cfg.publicSelect)
          .ilike(titleCol, `%${input.query}%`)
          .limit(input.limit) as unknown as PromiseLike<{ data: unknown[] | null; error: unknown }> &
          Pick<Loose, "eq">;
        if (input.published !== undefined && cfg.publishable) q = q.eq("published", input.published) as typeof q;
        if (input.verification && cfg.requiresSource) q = q.eq("verification", input.verification) as typeof q;
        const { data, error } = await q;
        if (error) continue; // RLS may hide a table from this role — skip silently.
        for (const raw of data ?? []) {
          const row = raw as unknown as Record<string, unknown>;
          results.push({
            type,
            id: row["id"],
            title: row[titleCol],
            published: row["published"] ?? null,
            verification: row["verification"] ?? null,
            public_url: publicUrl(type, row),
          });
        }
      }

      return { count: results.length, results: results.slice(0, input.limit * types.length) };
    }),
});
