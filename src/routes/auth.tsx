import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  async function submit() {
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
        toast.success("تم إنشاء الحساب. يمكنك الدخول الآن.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/admin" });
      }
    } catch (e) {
      toast.error((e as Error).message || "تعذّر تنفيذ العملية.");
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
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
            />
          </div>
          <Button onClick={submit} disabled={busy}>
            {busy ? "جارٍ…" : mode === "signin" ? "تسجيل الدخول" : "إنشاء حساب الإدارة"}
          </Button>
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-primary"
            onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          >
            {mode === "signin" ? "إنشاء حساب الإدارة لأول مرة" : "لدي حساب — تسجيل الدخول"}
          </button>
        </div>
      </div>
    </SiteLayout>
  );
}
