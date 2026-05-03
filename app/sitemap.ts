import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const BASE_URL = 'https://upnabove-zeta.vercel.app';

  // Fetch all active jobs
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, created_at')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  const jobUrls: MetadataRoute.Sitemap = (jobs || []).map(job => ({
    url: `${BASE_URL}/jobs/${job.id}`,
    lastModified: new Date(job.created_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${BASE_URL}/jobs`, lastModified: new Date(), changeFrequency: 'hourly', priority: 0.9 },
    { url: `${BASE_URL}/forge`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE_URL}/signup`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ];

  return [...staticPages, ...jobUrls];
}
