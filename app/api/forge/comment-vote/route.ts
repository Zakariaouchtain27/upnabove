import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { commentId, vote } = await request.json(); // vote: 1, -1, or 0 (remove)
    if (!commentId || vote === undefined) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return NextResponse.json({ error: 'Must be signed in' }, { status: 401 });

    const candidateId = authData.user.id;

    if (vote === 0) {
      // Remove vote
      const { data: existing } = await supabase
        .from('forge_comment_votes')
        .select('id, vote')
        .eq('comment_id', commentId)
        .eq('candidate_id', candidateId)
        .single();

      if (existing) {
        await supabase.from('forge_comment_votes').delete().eq('id', existing.id);
        const field = existing.vote === 1 ? 'upvotes' : 'downvotes';
        // Manually decrement (no RPC needed)
        const { data: c } = await supabase.from('forge_comments').select(field).eq('id', commentId).single();
        if (c) await supabase.from('forge_comments').update({ [field]: Math.max(0, (c as any)[field] - 1) }).eq('id', commentId);
      }
    } else {
      // Upsert vote
      const { data: existing } = await supabase
        .from('forge_comment_votes')
        .select('id, vote')
        .eq('comment_id', commentId)
        .eq('candidate_id', candidateId)
        .single();

      if (existing) {
        // Switch vote direction
        if (existing.vote !== vote) {
          await supabase.from('forge_comment_votes').update({ vote }).eq('id', existing.id);
          const add = vote === 1 ? 'upvotes' : 'downvotes';
          const sub = vote === 1 ? 'downvotes' : 'upvotes';
          const { data: c } = await supabase.from('forge_comments').select('upvotes, downvotes').eq('id', commentId).single();
          if (c) {
            await supabase.from('forge_comments').update({
              [add]: (c as any)[add] + 1,
              [sub]: Math.max(0, (c as any)[sub] - 1),
            }).eq('id', commentId);
          }
        }
      } else {
        await supabase.from('forge_comment_votes').insert({ comment_id: commentId, candidate_id: candidateId, vote });
        const field = vote === 1 ? 'upvotes' : 'downvotes';
        const { data: c } = await supabase.from('forge_comments').select(field).eq('id', commentId).single();
        if (c) await supabase.from('forge_comments').update({ [field]: (c as any)[field] + 1 }).eq('id', commentId);
      }
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
