import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { CONTENT, setPublished, type ContentType } from "@/lib/services/content-service";
import { runTool, requireInternalAdminClient } from "../context";

const TYPES = Object.keys(CONTENT).filter((t) => CONTENT[t as ContentType].publishable) as [
  ContentType,
  ...ContentType[],
];

export default defineTool({
  name: "publish_content",
  title: "نشر عنصر",
  description:
    "نشر (أو إلغاء نشر) عنصر واحد. مقصور على دور المشرف، ومفتاح القدرة «publish»، وعلى عميل لوحة الإدارة الداخلية المسجَّل فقط.",
  inputSchema: {
    type: z.enum(TYPES),
    id: z.string().uuid(),
    published: z.boolean().default(true),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) =>
    runTool(ctx, "publish_content", async (actor) => {
      await requireInternalAdminClient(actor, "publish_content");
      return {
        result: await setPublished(actor, input.type, input.id, input.published, "publish_content"),
      };
    }),
});
