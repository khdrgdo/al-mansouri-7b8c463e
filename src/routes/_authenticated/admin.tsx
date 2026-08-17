import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ComposeTab } from "@/components/admin/ComposeTab";
import { TeamTab } from "@/components/admin/TeamTab";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "لوحة الإدارة | ذاكرة المناصير" },
      { name: "description", content: "لوحة إدارة ومراجعة محتوى منصة ذاكرة المناصير." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const me = useQuery({
    queryKey: ["admin", "me"],
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return null;
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.user.id)
        .eq("role", "admin")
        .maybeSingle();
      return { id: userData.user.id, isAdmin: !!roleRow };
    },
  });

  const comments = useQuery({
    queryKey: ["admin", "comments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("id, author_name, body, status, target_type, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const submissions = useQuery({
    queryKey: ["admin", "submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("submissions")
        .select("id, contributor_name, title, content_type, description, status, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const ads = useQuery({
    queryKey: ["admin", "ads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("advertisements")
        .select("id, advertiser_name, title, description, status, created_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data;
    },
  });

  const drafts = useQuery({
    queryKey: ["admin", "drafts"],
    queryFn: async () => {
      const queries = [
        supabase.from("articles").select("id, title, created_at").eq("published", false),
        supabase.from("historical_events").select("id, title, created_at").eq("published", false),
        supabase.from("locations").select("id, name, created_at").eq("published", false),
        supabase.from("people").select("id, name, created_at").eq("published", false),
        supabase.from("archive_items").select("id, title, created_at").eq("published", false),
        supabase.from("documents").select("id, title, created_at").eq("published", false),
      ] as const;
      const results = await Promise.all(queries);
      const error = results.find((result) => result.error)?.error;
      if (error) throw error;
      const types = [
        "articles",
        "historical_events",
        "locations",
        "people",
        "archive_items",
        "documents",
      ] as const;
      return results
        .flatMap((result, index) =>
          (result.data ?? []).map((row) => {
            const item = row as { id: string; title?: string; name?: string; created_at: string };
            return {
              id: item.id,
              title: item.title ?? item.name ?? "مسودة بلا عنوان",
              table: types[index]!,
              created_at: item.created_at,
            };
          }),
        )
        .sort((a, b) => b.created_at.localeCompare(a.created_at));
    },
  });

  const capabilities = useQuery({
    queryKey: ["admin", "mcp_capabilities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mcp_capabilities")
        .select("key, label, enabled, sort_order")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const auditLog = useQuery({
    queryKey: ["admin", "audit_logs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audit_logs")
        .select(
          "id, actor_email, actor_client, tool_name, action, content_type, result, error_message, created_at",
        )
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const toggleCapability = useMutation({
    mutationFn: async ({ key, enabled }: { key: string; enabled: boolean }) => {
      const { error } = await supabase.from("mcp_capabilities").update({ enabled }).eq("key", key);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم تحديث صلاحية MCP.");
      qc.invalidateQueries({ queryKey: ["admin", "mcp_capabilities"] });
    },
    onError: (e: Error) => toast.error(e.message || "تعذّر التحديث — تأكد من صلاحيات حسابك."),
  });

  const setStatus = useMutation({
    mutationFn: async ({
      table,
      id,
      status,
    }: {
      table: "comments" | "submissions" | "advertisements";
      id: string;
      status: string;
    }) => {
      const { error } = await supabase.from(table).update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم تحديث الحالة.");
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
    onError: (e: Error) => toast.error(e.message || "تعذّر التحديث — تأكد من صلاحيات حسابك."),
  });

  const publishDraft = useMutation({
    mutationFn: async ({
      table,
      id,
    }: {
      table:
        "articles" | "historical_events" | "locations" | "people" | "archive_items" | "documents";
      id: string;
    }) => {
      const { error } = await supabase.from(table).update({ published: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("تم نشر المسودة وأصبحت ظاهرة في الموقع العام.");
      qc.invalidateQueries({ queryKey: ["admin", "drafts"] });
    },
    onError: (e: Error) => toast.error(e.message || "تعذّر نشر المسودة."),
  });

  async function signOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-nile text-nile-foreground">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <h1 className="text-lg font-bold">لوحة الإدارة</h1>
          <div className="flex items-center gap-2">
            <Link to="/">
              <Button
                variant="outline"
                size="sm"
                className="border-nile-foreground/40 bg-transparent text-nile-foreground hover:bg-nile-foreground/10"
              >
                الموقع
              </Button>
            </Link>
            <Button size="sm" variant="secondary" onClick={signOut}>
              خروج
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10">
        <Tabs defaultValue="comments" dir="rtl">
          <TabsList>
            <TabsTrigger value="compose">نشر محتوى</TabsTrigger>
            <TabsTrigger value="comments">التعليقات</TabsTrigger>
            <TabsTrigger value="submissions">المساهمات</TabsTrigger>
            <TabsTrigger value="ads">الإعلانات</TabsTrigger>
            <TabsTrigger value="drafts">المسودات</TabsTrigger>
            <TabsTrigger value="mcp">MCP</TabsTrigger>
            {me.data?.isAdmin ? <TabsTrigger value="team">الفريق</TabsTrigger> : null}
          </TabsList>

          <TabsContent value="compose">
            {me.data ? <ComposeTab currentUserId={me.data.id} /> : null}
          </TabsContent>

          <TabsContent value="comments" className="mt-6 grid gap-3">
            {(comments.data ?? []).map((c) => (
              <Row
                key={c.id}
                title={c.author_name}
                subtitle={c.body}
                status={c.status}
                onApprove={() =>
                  setStatus.mutate({ table: "comments", id: c.id, status: "approved" })
                }
                onReject={() =>
                  setStatus.mutate({ table: "comments", id: c.id, status: "rejected" })
                }
              />
            ))}
          </TabsContent>

          <TabsContent value="submissions" className="mt-6 grid gap-3">
            {(submissions.data ?? []).map((s) => (
              <Row
                key={s.id}
                title={`${s.title} — ${s.contributor_name}`}
                subtitle={s.description}
                status={s.status}
                onApprove={() =>
                  setStatus.mutate({ table: "submissions", id: s.id, status: "approved" })
                }
                onReject={() =>
                  setStatus.mutate({ table: "submissions", id: s.id, status: "rejected" })
                }
              />
            ))}
          </TabsContent>

          <TabsContent value="ads" className="mt-6 grid gap-3">
            {(ads.data ?? []).map((a) => (
              <Row
                key={a.id}
                title={`${a.title} — ${a.advertiser_name}`}
                subtitle={a.description}
                status={a.status}
                onApprove={() =>
                  setStatus.mutate({ table: "advertisements", id: a.id, status: "approved" })
                }
                onReject={() =>
                  setStatus.mutate({ table: "advertisements", id: a.id, status: "rejected" })
                }
              />
            ))}
          </TabsContent>
          <TabsContent value="drafts" className="mt-6 grid gap-3">
            {(drafts.data ?? []).map((draft) => (
              <div
                key={`${draft.table}-${draft.id}`}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-foreground">{draft.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {draft.table} · {new Date(draft.created_at).toLocaleString("ar")}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    disabled={publishDraft.isPending}
                    onClick={() => publishDraft.mutate({ table: draft.table, id: draft.id })}
                  >
                    نشر الآن
                  </Button>
                </div>
              </div>
            ))}
            {drafts.data && drafts.data.length === 0 ? (
              <p className="text-sm text-muted-foreground">لا توجد مسودات غير منشورة.</p>
            ) : null}
          </TabsContent>
          <TabsContent value="mcp" className="mt-6 grid gap-8">
            <section>
              <h2 className="mb-3 text-sm font-semibold text-foreground">قدرات MCP</h2>
              <p className="mb-3 text-xs text-muted-foreground">
                التحكم بما يُسمح لعملاء MCP (مثل Claude) فعله على المحتوى. التعطيل هنا يمنع القدرة
                فورًا لكل العملاء، بصرف النظر عن دورهم.
              </p>
              <div className="grid gap-2">
                {(capabilities.data ?? []).map((c) => (
                  <div
                    key={c.key}
                    className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
                  >
                    <span className="text-sm text-foreground">{c.label}</span>
                    <Switch
                      checked={c.enabled}
                      onCheckedChange={(checked) =>
                        toggleCapability.mutate({ key: c.key, enabled: checked })
                      }
                    />
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-sm font-semibold text-foreground">
                سجل التدقيق (آخر 50 عملية)
              </h2>
              <div className="grid gap-2">
                {(auditLog.data ?? []).map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-lg border border-border bg-card p-3 text-sm"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-foreground">
                        {entry.tool_name} — {entry.action}
                      </span>
                      <span
                        className={
                          entry.result === "success"
                            ? "rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                            : "rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive"
                        }
                      >
                        {entry.result}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {entry.actor_email ?? "غير معروف"}
                      {entry.content_type ? ` · ${entry.content_type}` : ""} ·{" "}
                      {new Date(entry.created_at).toLocaleString("ar")}
                    </p>
                    {entry.error_message ? (
                      <p className="mt-1 text-xs text-destructive">{entry.error_message}</p>
                    ) : null}
                  </div>
                ))}
                {auditLog.data && auditLog.data.length === 0 ? (
                  <p className="text-sm text-muted-foreground">لا توجد عمليات مسجّلة بعد.</p>
                ) : null}
              </div>
            </section>
          </TabsContent>

          {me.data?.isAdmin ? (
            <TabsContent value="team">
              <TeamTab currentUserId={me.data.id} />
            </TabsContent>
          ) : null}
        </Tabs>
      </main>
    </div>
  );
}

function Row({
  title,
  subtitle,
  status,
  onApprove,
  onReject,
}: {
  title: string;
  subtitle: string | null;
  status: string;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-semibold text-foreground">{title}</p>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground">
          {status}
        </span>
      </div>
      {subtitle ? (
        <p className="mt-2 line-clamp-3 text-sm leading-7 text-muted-foreground">{subtitle}</p>
      ) : null}
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={onApprove}>
          اعتماد
        </Button>
        <Button size="sm" variant="outline" onClick={onReject}>
          رفض
        </Button>
      </div>
    </div>
  );
}
