const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function test() {
  const { data, error } = await supabase.from('jobs').upsert({
    external_id: '5693335630',
    title: 'Registered Manager - Children\'s Homes',
    description: 'Test description',
    location: 'Buttershaw, Bradford',
    job_type: 'Full-time',
    salary_range: '$46k+',
    category: 'Social work Jobs',
    company_name: 'Witherslack Group',
    external_apply_url: 'https://example.com',
    source: 'adzuna',
    is_active: true
  }, { onConflict: 'external_id' });
  
  console.log('Error:', error);
}
test();
