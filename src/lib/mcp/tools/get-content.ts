import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { CONTENT, publicUrl, type ContentType } from "@/lib/services/content-service";
import { ServiceError } from "@/lib/services/types";
import { runTool } from "../context";

const TYPES = Object.keys(CONTENT) as [ContentType, ...ContentType[]];

const RELATIONS: Partial<Record<ContentType, { table: string; column: string; label: string }[]>> =
  {
    location: [
      { table: "archive_items", column: "location_id", label: "archive_items" },
      { table: "people", column: "location_id", label: "people" },
    ],
  };

export default defineTool({
  name: "get_content",
  title: "قراءة عنصر محتوى",
  description: "إرجاع سجل واحد بمعرّفه مع علاقاته الأساسية ورابطه العام على الموقع. قراءة فقط.",
  inputSchema: {
    type: z.enum(TYPES).describe("نوع المحتوى."),
    id: z.string().uuid().describe("معرّف السجل."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (input, ctx) =>
    runTool(ctx, "get_content", async (actor) => {
      const cfg = CONTENT[input.type];
      const { data, error } = await actor.client
        .from(cfg.table)
        .select(cfg.publicSelect)
        .eq("id", input.id)
        .maybeSingle();
      if (error) throw new ServiceError("failed", error.message);
      if (!data) throw new ServiceError("not_found", `لا يوجد ${cfg.label} بالمعرّف ${input.id}.`);

      const row = data as unknown as Record<string, unknown>;
      const relations: Record<string, unknown> = {};
      for (const rel of RELATIONS[input.type] ?? []) {
        const { data: relData } = await actor.client
          .from(rel.table as never)
          .select("id")
          .eq(rel.column as never, input.id as never)
          .limit(25);
        relations[rel.label] = relData ?? [];
      }

      return { type: input.type, record: row, relations, public_url: publicUrl(input.type, row) };
    }),
});
