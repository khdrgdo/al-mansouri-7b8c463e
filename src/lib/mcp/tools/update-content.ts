import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { CONTENT, updateContent, type ContentType } from "@/lib/services/content-service";
import { recordAudit } from "@/lib/services/audit";
import { getActor, ok } from "../context";
import { ServiceError } from "@/lib/services/types";

const TYPES = Object.keys(CONTENT) as [ContentType, ...ContentType[]];

export default defineTool({
  name: "update_content",
  title: "تعديل محتوى",
  description:
    "تعديل حقول سجل قائم. أي محاولة لتغيير حقل published تُرفض صراحة — النشر يتم عبر publish_content أو publish_batch فقط. يتطلب دور محرّر فأعلى ومفتاح القدرة «update».",
  inputSchema: {
    type: z.enum(TYPES),
    id: z.string().uuid(),
    values: z.record(z.unknown()).describe("الحقول المراد تعديلها (بدون published)."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    const actor = await getActor(ctx);
    const values = { ...(input.values as Record<string, unknown>) };
    if ("published" in values) {
      await recordAudit(actor, {
        toolName: "update_content",
        action: "rejected",
        contentType: input.type,
        contentId: input.id,
        result: "rejected",
        errorMessage: "محاولة تعديل حقل published عبر update_content",
      });
      throw new ToolError(
        "لا يمكن تعديل حالة النشر (published) عبر update_content. استخدم أداة publish_content أو publish_batch — وهما مقصورتان على لوحة الإدارة الداخلية ودور المشرف.",
      );
    }
    try {
      return ok({
        updated: await updateContent(actor, input.type, input.id, values, "update_content"),
      });
    } catch (error) {
      if (error instanceof ServiceError) throw new ToolError(error.message);
      throw new ToolError(`فشل التعديل: ${(error as Error).message}`);
    }
  },
});
