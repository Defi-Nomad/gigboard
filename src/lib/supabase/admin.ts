import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

// Only used server-side, only when SUPABASE_SERVICE_ROLE_KEY is set, to
// bypass RLS for the single narrow purpose of syncing ADMIN_EMAIL into the
// admin_emails table. Never imported from client code. Safe to leave unset:
// everything falls back to the admin_emails table alone (see lib/auth.ts).
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;

  return createSupabaseClient<Database>(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
