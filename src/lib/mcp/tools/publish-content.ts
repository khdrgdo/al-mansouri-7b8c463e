import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { CONTENT, setPublished, type ContentType } from "@/lib/services/content-service";
import { runTool } from "../context";

const TYPES = Object.keys(CONTENT).filter((t) => CONTENT[t as ContentType].publishable) as [
  ContentType,
  ...ContentType[],
];

export default defineTool({
  name: "publish_content",
  title: "نشر عنصر",
  description:
    "نشر (أو إلغاء نشر) عنصر واحد ليظهر في الموقع العام. متاح لأي عميل MCP مصادق عندما يكون الحساب بدور المشرف وتكون قدرة «publish» مفعّلة.",
  inputSchema: {
    type: z.enum(TYPES),
    id: z.string().uuid(),
    published: z.boolean().default(true),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) =>
    runTool(ctx, "publish_content", async (actor) => {
      return {
        result: await setPublished(actor, input.type, input.id, input.published, "publish_content"),
      };
    }),
});
