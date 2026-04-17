import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { entryId, body } = await request.json();
    if (!entryId || !body?.trim()) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    if (body.length > 1000) return NextResponse.json({ error: 'Comment too long' }, { status: 400 });

    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return NextResponse.json({ error: 'Must be signed in to comment' }, { status: 401 });

    // Verify the entry is for a completed challenge with top-3 revealed entry
    const { data: entry } = await supabase
      .from('forge_entries')
      .select('rank, is_revealed, forge_challenges(status)')
      .eq('id', entryId)
      .single();

    if (!entry) return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    if ((entry.forge_challenges as any)?.status !== 'completed')
      return NextResponse.json({ error: 'Comments only open for completed challenges' }, { status: 403 });
    if (!entry.is_revealed || !entry.rank || entry.rank > 3)
      return NextResponse.json({ error: 'Comments only available for revealed top-3 entries' }, { status: 403 });

    const { error } = await supabase.from('forge_comments').insert({
      entry_id: entryId,
      candidate_id: authData.user.id,
      body: body.trim(),
    });

    if (error) return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
