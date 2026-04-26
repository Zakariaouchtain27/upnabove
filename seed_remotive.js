const { createClient } = require('@supabase/supabase-js');

async function seed() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
  console.log("Fetching Remotive Jobs...");
  
  const remotiveUrl = 'https://remotive.com/api/remote-jobs?limit=50';
  const remotiveRes = await fetch(remotiveUrl);
  const remotiveData = await remotiveRes.json();
  const remotiveJobs = remotiveData.jobs || [];
  
  let inserted = 0;
  for (const job of remotiveJobs) {
    let cleanDesc = job.description || '';
    cleanDesc = cleanDesc.replace(/<\/?(p|div|li|br|h[1-6])[^>]*>/gi, '\n');
    cleanDesc = cleanDesc.replace(/<[^>]+>/g, '');
    cleanDesc = cleanDesc.replace(/\n\s*\n/g, '\n\n').trim(); 

    const jobToUpsert = {
      external_id: job.id.toString(),
      title: job.title,
      description: cleanDesc,
      location: job.candidate_required_location || 'Remote',
      job_type: (() => {
        const type = job.job_type;
        if (type === 'part_time') return 'part-time';
        if (type === 'contract') return 'contract';
        if (type === 'freelance') return 'contract';
        return 'full-time'; // Default
      })(),
      salary_range: job.salary || null,
      category: job.category,
      company_name: job.company_name || 'Confidential',
      external_apply_url: job.url,
      source: 'remotive',
      is_active: true
    };

    const { error } = await supabase.from('jobs').upsert(jobToUpsert, { onConflict: 'external_id' });
    if (!error) inserted++;
  }
  console.log(`Successfully seeded ${inserted} Remotive jobs directly to your database!`);
}

seed();
