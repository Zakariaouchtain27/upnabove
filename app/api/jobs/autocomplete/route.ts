import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export interface Suggestion {
  value: string;
  type: 'title' | 'company' | 'category' | 'location';
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  const type = searchParams.get('type') || 'mixed'; // 'mixed' | 'location'

  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  if (type === 'location') {
    const { data } = await supabase
      .from('jobs')
      .select('location')
      .ilike('location', `%${q}%`)
      .eq('is_active', true)
      .limit(30);

    const unique = Array.from(new Set((data || []).map(j => j.location))).filter(Boolean);
    const suggestions: Suggestion[] = unique.slice(0, 6).map(value => ({ value, type: 'location' }));
    return NextResponse.json({ suggestions });
  }

  // Mixed mode: search titles, companies, and categories in parallel
  const [titlesRes, companiesRes, categoriesRes] = await Promise.all([
    supabase
      .from('jobs')
      .select('title')
      .ilike('title', `%${q}%`)
      .eq('is_active', true)
      .limit(30),
    supabase
      .from('jobs')
      .select('company_name')
      .ilike('company_name', `%${q}%`)
      .eq('is_active', true)
      .limit(15),
    supabase
      .from('jobs')
      .select('category')
      .ilike('category', `%${q}%`)
      .eq('is_active', true)
      .limit(15),
  ]);

  const dedupe = (vals: (string | null)[]) =>
    Array.from(new Set(vals.filter((v): v is string => !!v)));

  const titles     = dedupe((titlesRes.data     || []).map(j => j.title)).slice(0, 5);
  const companies  = dedupe((companiesRes.data  || []).map(j => j.company_name)).slice(0, 3);
  const categories = dedupe((categoriesRes.data || []).map(j => j.category)).slice(0, 2);

  const suggestions: Suggestion[] = [
    ...titles.map(value => ({ value, type: 'title' as const })),
    ...companies.map(value => ({ value, type: 'company' as const })),
    ...categories.map(value => ({ value, type: 'category' as const })),
  ];

  return NextResponse.json({ suggestions });
}
