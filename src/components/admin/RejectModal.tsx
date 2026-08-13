import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export default function RejectModal({ table, id, onClose, onRejected }: any) {
  const [reason, setReason] = useState("");

  const reject = useMutation({
    mutationFn: async ({ reason }: { reason: string }) => {
      // gather actor info from session
      const session = await supabase.auth.getSession();
      const user = (session as any).data?.session?.user ?? null;
      const actor_email = user?.email ?? null;
      const actor_id = user?.id ?? null;

      const payload = {
        action: "reject",
        content_type: table,
        content_id: id,
        actor_email,
        actor_id,
        new_values: { rejection_reason: reason },
        result: "rejected",
        tool_name: "admin-dashboard",
        source: "admin",
      } as any;

      const { error } = await supabase.from("audit_logs").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم رفض المسودة وتسجيل السبب في سجل التدقيق.");
      onRejected?.();
    },
    onError: (e: Error) => toast.error(e.message || "تعذّر تسجيل الرفض."),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative rounded-lg border border-border bg-card p-6 w-full max-w-lg rtl">
        <h3 className="text-lg font-semibold">رفض المسودة</h3>
        <p className="mt-2 text-sm text-muted-foreground">أدخل سبب الرفض (اختياري) ليظهر في سجل التدقيق.</p>
        <textarea
          rows={5}
          className="mt-3 w-full rounded border bg-input px-3 py-2 text-sm"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="mt-4 flex gap-2">
          <Button size="sm" onClick={() => reject.mutate({ reason })}>تأكيد الرفض</Button>
          <Button size="sm" variant="outline" onClick={onClose}>إلغاء</Button>
        </div>
      </div>
    </div>
  );
}
