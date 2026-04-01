import { createClient } from '@supabase/supabase-js';
import { Database } from './types/supabase'; // We will generate these later
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env from multiple potential locations
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
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
export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

/**
 * Admin client for service-role operations (bypass RLS)
 */
export const supabaseAdmin = supabaseServiceRoleKey 
  ? createClient(supabaseUrl!, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

export * from './types/supabase';
