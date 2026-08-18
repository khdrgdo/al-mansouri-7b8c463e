import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

/**
 * A throwaway client with persistSession/autoRefreshToken off. signUp() on
 * the *shared* app client would replace the admin's own active session with
 * the newly-created sub-admin's session — this avoids that entirely, and
 * never touches localStorage.
 */
function createEphemeralClient() {
  const url = import.meta.env["VITE_SUPABASE_URL"];
  const key = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"];
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
  });
}

type TeamMember = {
  id: string;
  user_id: string;
  email: string | null;
  display_name: string | null;
};

export function TeamTab({ currentUserId }: { currentUserId: string }) {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");

  const team = useQuery({
    queryKey: ["admin", "team"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("id, user_id, email, display_name")
        .eq("role", "editor")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as TeamMember[];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const trimmedEmail = email.trim();
      const trimmedName = displayName.trim();
      if (!trimmedEmail) throw new Error("البريد الإلكتروني مطلوب.");
      if (!trimmedName) throw new Error("اسم العرض مطلوب.");
      if (password.length < 6) throw new Error("كلمة المرور يجب ألا تقل عن 6 أحرف.");

      const ephemeral = createEphemeralClient();
      const { data, error } = await ephemeral.auth.signUp({ email: trimmedEmail, password });
      if (error || !data.user) throw new Error(error?.message || "تعذّر إنشاء الحساب.");

      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: data.user.id,
        role: "editor",
        email: trimmedEmail,
        display_name: trimmedName,
      });
      if (roleError) throw roleError;

      return { needsEmailConfirm: !data.session };
    },
    onSuccess: ({ needsEmailConfirm }) => {
      toast.success(
        needsEmailConfirm
          ? "تم إنشاء الحساب. قد يحتاج المساعد لتأكيد بريده الإلكتروني (رابط سيصله بالإيميل) قبل أول تسجيل دخول."
          : "تم إنشاء الحساب ويمكنه تسجيل الدخول مباشرة.",
      );
      setEmail("");
      setDisplayName("");
      setPassword("");
      qc.invalidateQueries({ queryKey: ["admin", "team"] });
    },
    onError: (e: Error) => toast.error(e.message || "تعذّر إنشاء الحساب."),
  });

  const revoke = useMutation({
    mutationFn: async (row: TeamMember) => {
      const { error } = await supabase.from("user_roles").delete().eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم سحب صلاحية النشر. حساب الدخول نفسه يبقى موجودًا بلا أي صلاحية.");
      qc.invalidateQueries({ queryKey: ["admin", "team"] });
    },
    onError: (e: Error) => toast.error(e.message || "تعذّر السحب."),
  });

  return (
    <div className="mt-6 grid gap-10">
      <section>
        <h2 className="mb-1 text-sm font-semibold text-foreground">إضافة مساعد (سب أدمن)</h2>
        <p className="mb-4 text-xs text-muted-foreground">
          يمكنه نشر مقالات وأرشيف ومواقع وشخصيات مباشرة، مثل صلاحياتك تمامًا في النشر — لكن لا يمكنه
          إدارة الفريق أو حذف مساعدين آخرين. اختر له بريدًا وكلمة مرور وأرسلهما إليه مباشرة.
        </p>
        <div className="grid max-w-md gap-3 rounded-lg border border-border bg-card p-4">
          <div className="grid gap-2">
            <Label>البريد الإلكتروني</Label>
            <Input
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
            />
          </div>
          <div className="grid gap-2">
            <Label>اسم العرض (يظهر للزوار عند النشر باسمه)</Label>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>كلمة المرور (6 أحرف على الأقل)</Label>
            <Input
              dir="ltr"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button
            disabled={
              create.isPending || !email.trim() || !displayName.trim() || password.length < 6
            }
            onClick={() => create.mutate()}
            className="justify-self-start"
          >
            {create.isPending ? "جارٍ الإنشاء…" : "إنشاء حساب مساعد"}
          </Button>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-sm font-semibold text-foreground">المساعدون الحاليون</h2>
        {(team.data ?? []).length === 0 ? (
          <p className="text-sm text-muted-foreground">لا يوجد مساعدون بعد.</p>
        ) : (
          <div className="grid gap-2">
            {team.data!.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {m.display_name || "بلا اسم"}
                  </p>
                  <p className="text-xs text-muted-foreground" dir="ltr">
                    {m.email}
                  </p>
                </div>
                {m.user_id !== currentUserId ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={revoke.isPending}
                    onClick={() => revoke.mutate(m)}
                  >
                    سحب الصلاحية
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
