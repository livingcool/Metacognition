import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceRoleKey!);

async function checkSchema() {
  console.log('--- Checking cognitive_profiles schema ---');
  const { data, error } = await supabase
    .from('cognitive_profiles')
    .select('*')
    .limit(1);

  if (error) {
    console.error('Error fetching profile:', error);
  } else {
    console.log('Successfully fetched profile. Columns present:');
    if (data && data[0]) {
      console.log(Object.keys(data[0]));
    } else {
      console.log('No data in table to inspect columns.');
    }
  }
}

checkSchema();
