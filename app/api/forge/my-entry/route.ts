import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const challengeId = searchParams.get('challengeId');
  if (!challengeId) return NextResponse.json({ error: 'Missing challengeId' }, { status: 400 });

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return NextResponse.json({ error: 'Unauthenticated' }, { status: 401 });

  const { data } = await supabase
    .from('forge_entries')
    .select('id')
    .eq('challenge_id', challengeId)
    .eq('candidate_id', authData.user.id)
    .single();

  if (!data) return NextResponse.json({ id: null });
  return NextResponse.json({ id: data.id });
}
