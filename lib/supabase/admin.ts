import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { Database } from "../database.types";

/**
 * Service-role Supabase client — bypasses RLS.
 * Only use this in Server Components / API Routes where ownership
 * has already been verified via the user's auth session.
 * NEVER expose this to the browser.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
