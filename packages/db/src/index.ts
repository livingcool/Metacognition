import { createClient } from '@supabase/supabase-js';
import type { Database } from './types/supabase.js'; // We will generate these later

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ DB: Missing Supabase credentials in process.env');
}
if (!supabaseServiceRoleKey) {
  console.warn('⚠️ DB: SUPABASE_SERVICE_ROLE_KEY not found. Admin client will be disabled.');
}

/**
 * Standard client for basic low-privilege operations
 */
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey) 
  : ({} as any);

/**
 * Admin client for service-role operations (bypass RLS)
 */
export const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey 
  ? createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;


export type { Database, Json } from './types/supabase.js';
