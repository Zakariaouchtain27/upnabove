import { MetadataRoute } from 'next';
import { createClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://upnabove.work';
  const supabase = await createClient();

  // 1. Fetch all publicly accessible and active/scheduled/completed challenges
  const { data: challenges } = await supabase
    .from('forge_challenges')
    .select('id, created_at, updated_at')
    .in('status', ['scheduled', 'live', 'judging', 'completed'])
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  const challengeUrls = (challenges || []).map((challenge) => ({
    url: `${baseUrl}/forge/${challenge.id}`,
    lastModified: new Date(challenge.updated_at || challenge.created_at || new Date()),
    changeFrequency: 'hourly' as const,
    priority: 0.8,
  }));

  // 2. Map Static & Category Routes
  const staticRoutes = [
    '',
    '/forge',
    '/forge/leaderboard',
    '/forge/press',
    '/forge/design',
    '/forge/code',
    '/forge/strategy',
    '/forge/writing'
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route.includes('/forge/press') ? 0.6 : (route === '' ? 1.0 : 0.9),
  }));

  return [...staticRoutes, ...challengeUrls];
}
