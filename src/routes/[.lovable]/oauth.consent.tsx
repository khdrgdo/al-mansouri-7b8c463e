// Consent screen for Supabase Auth's OAuth 2.1 server (already enabled for
// this project — confirmed directly via Lovable Cloud, which manages this
// Supabase Auth provider setting; it isn't exposed in the Cloud UI itself).
// Supabase does not host this UI itself — after `/oauth/authorize`, it
// redirects the browser to this app's own "Authorization Path" with
// `?authorization_id=...`, and this page shows the requesting client +
// scopes and records the user's decision.
//
// The Authorization Path is `/.lovable/oauth/consent` for this project
// (confirmed directly, not assumed) — hence the [.lovable] directory.
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";

const consentSearchSchema = z.object({
  authorization_id: z.string().optional(),
});

export const Route = createFileRoute("/.lovable/oauth/consent")({
  validateSearch: (search: Record<string, unknown>) => consentSearchSchema.parse(search),
  head: () => ({
    meta: [{ title: "طلب صلاحية وصول | ذاكرة المناصير" }, { name: "robots", content: "noindex" }],
  }),
  component: ConsentPage,
});

type AuthorizationDetails = {
  authorization_id: string;
  redirect_uri: string;
  scope: string;
  client: { id: string; name: string; uri: string; logo_uri: string };
  user: { id: string; email: string };
};

function ConsentPage() {
  const { authorization_id } = Route.useSearch();
  const navigate = useNavigate();

  const [status, setStatus] = useState<"loading" | "ready" | "deciding" | "error">("loading");
  const [details, setDetails] = useState<AuthorizationDetails | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!authorization_id) {
        setStatus("error");
        setErrorMessage("رابط الطلب غير مكتمل — لا يوجد معرّف تفويض.");
        return;
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        navigate({
          to: "/auth",
          search: { redirect: `/.lovable/oauth/consent?authorization_id=${authorization_id}` },
          replace: true,
        });
        return;
      }

      const { data, error } = await supabase.auth.oauth.getAuthorizationDetails(authorization_id);
      if (cancelled) return;

      if (error) {
        setStatus("error");
        setErrorMessage(error.message || "تعذّر تحميل تفاصيل الطلب.");
        return;
      }

      if ("redirect_url" in data) {
        // Already consented previously — no need to show the screen again.
        window.location.href = data.redirect_url;
        return;
      }

      setDetails(data);
      setStatus("ready");
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [authorization_id, navigate]);

  async function decide(approve: boolean) {
    if (!authorization_id) return;
    setStatus("deciding");
    const { data, error } = approve
      ? await supabase.auth.oauth.approveAuthorization(authorization_id, {
          skipBrowserRedirect: true,
        })
      : await supabase.auth.oauth.denyAuthorization(authorization_id, {
          skipBrowserRedirect: true,
        });

    if (error || !data) {
      setStatus("error");
      setErrorMessage(error?.message || "تعذّر تسجيل قرارك.");
      return;
    }
    window.location.href = data.redirect_url;
  }

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="طلب صلاحية وصول"
        title="السماح بالوصول إلى «ذاكرة المناصير»"
        description="تطبيق خارجي يطلب صلاحية العمل نيابةً عنك بحسابك الحالي."
      />
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="grid gap-4 rounded-xl border border-border bg-card p-6">
          {status === "loading" && <p className="text-sm text-muted-foreground">جارٍ التحميل…</p>}

          {status === "error" && <p className="text-sm text-destructive">{errorMessage}</p>}

          {(status === "ready" || status === "deciding") && details && (
            <>
              <div className="flex items-center gap-3">
                {details.client.logo_uri ? (
                  <img
                    src={details.client.logo_uri}
                    alt=""
                    className="h-10 w-10 rounded-md border border-border object-contain"
                  />
                ) : null}
                <div>
                  <p className="font-semibold text-foreground">{details.client.name}</p>
                  {details.client.uri ? (
                    <p className="text-xs text-muted-foreground" dir="ltr">
                      {details.client.uri}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="rounded-lg bg-secondary/50 p-3 text-sm text-foreground">
                <p className="mb-1 font-medium">سيتمكن هذا التطبيق من:</p>
                <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                  {details.scope
                    .split(" ")
                    .filter(Boolean)
                    .map((scope) => (
                      <li key={scope} dir="ltr" className="text-right" style={{ direction: "ltr" }}>
                        {scope}
                      </li>
                    ))}
                </ul>
              </div>

              <p className="text-xs text-muted-foreground">
                سيعمل هذا التطبيق باسم حسابك ({details.user.email}) وضمن صلاحياته الحالية فقط.
              </p>

              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  disabled={status === "deciding"}
                  onClick={() => decide(true)}
                >
                  السماح
                </Button>
                <Button
                  className="flex-1"
                  variant="outline"
                  disabled={status === "deciding"}
                  onClick={() => decide(false)}
                >
                  رفض
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
