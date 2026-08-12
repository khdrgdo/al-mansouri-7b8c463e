// Gate for every /admin* route. Two checks, not one:
//  1. Is there a signed-in user at all?
//  2. Does that user actually hold the admin or editor role?
// (2) matters because there is no public self-registration gap to rely on
// here in principle, but defense in depth costs nothing: even if an
// authenticated-but-unprivileged account exists for any reason, it must
// not be able to reach the moderation queue (which surfaces contributors'
// private contact details) or any admin action — RLS already blocks the
// actions, this additionally blocks the page from loading at all.
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async ({ location }) => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      throw redirect({ to: "/auth", search: { redirect: location.href } });
    }

    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", data.user.id);

    const isStaff =
      !rolesError && (roles ?? []).some((r) => r.role === "admin" || r.role === "editor");
    if (!isStaff) {
      await supabase.auth.signOut();
      throw redirect({ to: "/auth", search: { redirect: location.href } });
    }

    return { user: data.user };
  },
  component: () => <Outlet />,
});
