import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { CONTENT, createContent, type ContentType } from "@/lib/services/content-service";
import { runTool } from "../context";

const TYPES = Object.keys(CONTENT) as [ContentType, ...ContentType[]];

export default defineTool({
  name: "create_content",
  title: "إنشاء مسودة محتوى",
  description:
    "إنشاء سجل جديد كمسودة غير منشورة. النشر غير ممكن من هنا إطلاقًا — يُفرض published=false دائمًا. يتطلب دور محرّر فأعلى ومفتاح القدرة «create».",
  inputSchema: {
    type: z.enum(TYPES),
    values: z.record(z.unknown()).describe("حقول المحتوى القابلة للكتابة (بدون published)."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) =>
    runTool(ctx, "create_content", async (actor) => {
      // Hard invariant: MCP never creates live content.
      const values = { ...(input.values as Record<string, unknown>) };
      delete values["published"];
      if (CONTENT[input.type].publishable) values["published"] = false;
      const row = await createContent(actor, input.type, values, "create_content");
      return { created: row, note: "تم الإنشاء كمسودة غير منشورة. استخدم publish_content للنشر." };
    }),
});
