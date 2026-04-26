const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data, error } = await supabase.from('jobs').select('*').limit(1);
  if (error) console.error("SELECT ERROR:", error);
  else console.log("DATA:", data);
}
test();
