// Sign-in only. There is deliberately no public self-registration here: per
// the project's own design, only the admin/editor team needs an account —
// visitors browse, comment, and contribute without one. Accounts for staff
// are provisioned directly (Supabase Dashboard or `user_roles` insert by an
// existing admin), not through a public signup form.
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const authSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  validateSearch: (search: Record<string, unknown>) => authSearchSchema.parse(search),
  head: () => ({
    meta: [
      { title: "دخول الإدارة | ذاكرة المناصير" },
      { name: "description", content: "صفحة دخول فريق إدارة منصة ذاكرة المناصير." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "دخول الإدارة | ذاكرة المناصير" },
      { property: "og:description", content: "دخول فريق الإدارة." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- destination is a runtime path, not a typed route
      navigate({ to: (redirect && redirect.startsWith("/") ? redirect : "/admin") as any });
    } catch (e) {
      toast.error((e as Error).message || "تعذّر تسجيل الدخول.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="منطقة محمية"
        title="دخول الإدارة"
        description="هذه الصفحة مخصصة لفريق التوثيق والإدارة فقط. لا يحتاج الزوار إلى تسجيل دخول."
      />
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="grid gap-4 rounded-xl border border-border bg-card p-6">
          <div className="grid gap-2">
            <Label>البريد الإلكتروني</Label>
            <Input
              type="email"
              dir="ltr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="grid gap-2">
            <Label>كلمة المرور</Label>
            <Input
              type="password"
              dir="ltr"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <Button onClick={submit} disabled={busy}>
            {busy ? "جارٍ…" : "تسجيل الدخول"}
          </Button>
        </div>
      </div>
    </SiteLayout>
  );
}
