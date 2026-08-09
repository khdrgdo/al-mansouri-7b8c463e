import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
              <Button variant="outline" size="sm" className="border-nile-foreground/40 bg-transparent text-nile-foreground hover:bg-nile-foreground/10">
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
            <TabsTrigger value="comments">التعليقات</TabsTrigger>
            <TabsTrigger value="submissions">المساهمات</TabsTrigger>
            <TabsTrigger value="ads">الإعلانات</TabsTrigger>
          </TabsList>

          <TabsContent value="comments" className="mt-6 grid gap-3">
            {(comments.data ?? []).map((c) => (
              <Row
                key={c.id}
                title={c.author_name}
                subtitle={c.body}
                status={c.status}
                onApprove={() => setStatus.mutate({ table: "comments", id: c.id, status: "approved" })}
                onReject={() => setStatus.mutate({ table: "comments", id: c.id, status: "rejected" })}
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
                onApprove={() => setStatus.mutate({ table: "submissions", id: s.id, status: "approved" })}
                onReject={() => setStatus.mutate({ table: "submissions", id: s.id, status: "rejected" })}
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
                onApprove={() => setStatus.mutate({ table: "advertisements", id: a.id, status: "approved" })}
                onReject={() => setStatus.mutate({ table: "advertisements", id: a.id, status: "rejected" })}
              />
            ))}
          </TabsContent>
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
