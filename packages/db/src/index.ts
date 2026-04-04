import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types/supabase.js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ DB: Missing Supabase credentials in process.env");
}
if (!supabaseServiceRoleKey) {
  console.warn(
    "⚠️ DB: SUPABASE_SERVICE_ROLE_KEY not found. Admin client will be disabled.",
  );
}

type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Standard client for basic low-privilege operations
 */
export const supabase: TypedSupabaseClient = (
  supabaseUrl && supabaseAnonKey
    ? createClient<Database>(supabaseUrl, supabaseAnonKey)
    : null
) as TypedSupabaseClient;

/**
 * Admin client for service-role operations (bypass RLS)
 */
export const supabaseAdmin: TypedSupabaseClient | null = (
  supabaseUrl && supabaseServiceRoleKey
    ? createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null
) as TypedSupabaseClient | null;

export type { Database, Json } from "./types/supabase.js";
