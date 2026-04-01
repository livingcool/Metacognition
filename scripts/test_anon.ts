import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Using ANON key to simulate browser access
const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

// Testing for user_3Bi1H56nxpwCzJJtx5FdZWp9IQR
const testUserId = 'user_3Bi1H56nxpwCzJJtx5FdZWp9IQR';

async function testAnonAccess() {
  console.log(`--- Testing ANON access for ${testUserId} ---`);
  
  // Note: This might return empty if RLS is on, but it should NOT return 406.
  const { data, error, status, statusText } = await supabase
    .from('cognitive_profiles')
    .select('*')
    .eq('user_id', testUserId)
    .single();

  if (error) {
    console.error('Error status:', status, statusText);
    console.error('Error details:', error);
  } else {
    console.log('Success! Status:', status);
    console.log('Data:', data);
  }
}

testAnonAccess();
