import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';
  const type = searchParams.get('type') || 'title'; // 'title' or 'location'

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
      .ilike('location', `${q}%`)
      .eq('is_active', true)
      .limit(20);

    const unique = Array.from(new Set((data || []).map(j => j.location))).filter(Boolean);
    return NextResponse.json({ suggestions: unique.slice(0, 5) });
  } else {
    const { data } = await supabase
      .from('jobs')
      .select('title')
      .ilike('title', `%${q}%`)
      .eq('is_active', true)
      .limit(20);

    const unique = Array.from(new Set((data || []).map(j => j.title))).filter(Boolean);
    return NextResponse.json({ suggestions: unique.slice(0, 6) });
  }
}
