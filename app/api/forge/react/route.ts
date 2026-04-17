import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { entryId, reactionType } = await request.json();
    if (!entryId || !reactionType) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const supabase = await createClient();
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    const { data: authData } = await supabase.auth.getUser();

    const { error } = await supabase.from('forge_reactions').insert({
      entry_id: entryId,
      voter_ip: ip,
      candidate_id: authData.user?.id || null,
      reaction_type: reactionType,
    });

    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'Already reacted' }, { status: 409 });
      return NextResponse.json({ error: 'Failed to save reaction' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
