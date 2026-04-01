import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../apps/api/.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing Supabase Connection...');
console.log('URL:', supabaseUrl);
console.log('Key Length:', supabaseServiceRoleKey?.length);

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function test() {
  const { data, error } = await supabase.from('sessions').select('*').limit(1);
  if (error) {
    console.error('Connection Error:', error);
  } else {
    console.log('Connection Successful! Sessions found:', data.length);
  }
}

test();
