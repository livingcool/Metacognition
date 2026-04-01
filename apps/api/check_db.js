require('dotenv').config({ path: '../../.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.from('research_chunks').select('id, embedding').limit(1);
  if (error) {
    console.error("Error:", error);
  } else {
    console.log("Data exists?", data.length > 0);
    if (data.length > 0) {
      console.log("Vector dimensions:", data[0].embedding ? data[0].embedding.slice(1, -1).split(',').length : 0);
    }
  }
}
check();
