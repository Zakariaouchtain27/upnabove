const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function test() {
  const types = ['full-time', 'Full-time', 'part-time', 'Part-time', 'contract', 'Contract'];
  
  for (const type of types) {
    console.log(`Testing job_type: "${type}"...`);
    const { error } = await supabase.from('jobs').insert({
      title: 'Test Job Type: ' + type,
      description: 'Testing constraint',
      location: 'Test',
      job_type: type,
      is_active: true,
      employer_id: 'd957d903-8869-4299-8472-886b4f7e2a9a' // Use an existing employer ID or omit if source=adzuna
    });
    
    if (error) {
      console.log(`❌ Failed: ${error.message}`);
    } else {
      console.log(`✅ Success!`);
    }
  }
}

test();
