import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile } from "@/types/database.types";

export interface CurrentUser {
  id: string;
  email: string;
  profile: Profile | null;
  isAdmin: boolean;
}

// Central place that decides who counts as an admin:
//   1. their email is in the admin_emails table, OR
//   2. their email matches the ADMIN_EMAIL server environment variable.
// Either method is enough on its own - see README "Admin setup".
//
// Important: database policies (RLS) can only see method 1 - Postgres has
// no way to read a Next.js environment variable. So when someone qualifies
// only via ADMIN_EMAIL, we best-effort sync them into admin_emails here
// using the service-role client, so their admin actions (approve/reject a
// job, etc.) actually pass RLS too. If SUPABASE_SERVICE_ROLE_KEY isn't
// configured, that sync is skipped and they'll see the admin dashboard but
// get a clear error if they try to act - see dashboard/admin/actions.ts.
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const envAdmin =
    !!process.env.ADMIN_EMAIL &&
    process.env.ADMIN_EMAIL.trim().toLowerCase() === user.email.toLowerCase();

  let tableAdmin = false;
  if (!envAdmin) {
    const { data: adminRow } = await supabase
      .from("admin_emails")
      .select("email")
      .eq("email", user.email)
      .maybeSingle();
    tableAdmin = !!adminRow;
  } else {
    // Best-effort sync so RLS-gated actions work too. Never throws - this
    // is a convenience, not a requirement.
    const adminClient = createAdminClient();
    if (adminClient) {
      await adminClient
        .from("admin_emails")
        .upsert({ email: user.email }, { onConflict: "email" });
    }
  }

  return {
    id: user.id,
    email: user.email,
    profile: profile ?? null,
    isAdmin: envAdmin || tableAdmin,
  };
}

export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Not authenticated");
  }
  return user;
}
