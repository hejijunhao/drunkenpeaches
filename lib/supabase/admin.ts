import { createClient } from "@supabase/supabase-js";

// Service-role client: bypasses RLS. Server-side only — never import from
// client components. Used for privileged operations (club creation, invites,
// cross-tenant cron).
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
