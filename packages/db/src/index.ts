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
export const supabaseAdmin = (
  supabaseUrl && supabaseServiceRoleKey
    ? createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : null
) as TypedSupabaseClient | null;

/**
 * Creates a client scoped to a specific user's JWT.
 * This is the standard way to enforce RLS with external providers.
 */
export const getAuthenticatedClient = (token: string) => {
  return createClient<Database>(supabaseUrl!, supabaseAnonKey!, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
};

<<<<<<< Updated upstream
/**
 * Sets the user context in the database session.
 * Used for session-variable based RLS fallback.
 */
export const setAuthContext = async (client: TypedSupabaseClient, userId: string) => {
  return (client as any).rpc("set_mirror_user", { uid: userId });
};

export type { Database, Json } from "./types/supabase.js";
=======
export * from './types/supabase.js';
>>>>>>> Stashed changes
