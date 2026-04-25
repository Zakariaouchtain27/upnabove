import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const ADZUNA_APP_ID = process.env.ADZUNA_APP_ID;
const ADZUNA_APP_KEY = process.env.ADZUNA_APP_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export async function GET(req: Request) {
  try {
    if (!ADZUNA_APP_ID || !ADZUNA_APP_KEY) {
      return NextResponse.json({ error: 'Adzuna API keys are not configured.' }, { status: 500 });
    }

    const countries = ['gb', 'us', 'ae', 'ma'];
    let totalInserted = 0;
    const errors = [];

    for (const country of countries) {
      try {
        const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${ADZUNA_APP_ID}&app_key=${ADZUNA_APP_KEY}&results_per_page=20`;
        const res = await fetch(url);
        
        if (!res.ok) {
           console.warn(`Adzuna failed for country ${country} with status ${res.status}`);
           errors.push(`Country ${country} failed: ${res.statusText}`);
           continue;
        }

        const data = await res.json();
        const results = data.results || [];

        for (const job of results) {
          // Format salary to a readable string
          let salaryRange = null;
          if (job.salary_min && job.salary_max) {
             salaryRange = `$${Math.round(job.salary_min / 1000)}k - $${Math.round(job.salary_max / 1000)}k`;
          } else if (job.salary_min) {
             salaryRange = `$${Math.round(job.salary_min / 1000)}k+`;
          }

          const { error } = await supabase.from('jobs').upsert({
            external_id: job.id, // We use external_id as unique to prevent duplicates
            title: job.title,
            description: job.description,
            location: job.location?.display_name || 'Remote',
            job_type: job.contract_time === 'part_time' ? 'Part-time' : 'Full-time',
            salary_range: salaryRange,
            category: job.category?.label,
            company_name: job.company?.display_name || 'Confidential',
            external_apply_url: job.redirect_url,
            source: 'adzuna',
            is_active: true
          }, { onConflict: 'external_id' });

          if (!error) {
            totalInserted++;
          }
        }
      } catch (err: any) {
        errors.push(`Country ${country} threw error: ${err.message}`);
      }
    }

    return NextResponse.json({ 
       message: `Seeded ${totalInserted} jobs from Adzuna.`,
       errors 
    });
  } catch (error: any) {
    console.error('Job Seed Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
