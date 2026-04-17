import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { challengeId } = await request.json();
    if (!challengeId) return NextResponse.json({ error: "Missing challengeId" }, { status: 400 });

    const supabase = await createClient();

    // 1. Fetch all legitimate entries
    const { data: entries, error } = await supabase
      .from('forge_entries')
      .select('id, vote_count, ai_score')
      .eq('challenge_id', challengeId)
      .eq('is_flagged', false);

    if (error || !entries || entries.length === 0) {
       return NextResponse.json({ error: "No valid entries or database error." }, { status: 400 });
    }

    // 2. Find maximum vote count to normalize vote_score out of 100
    // If the top voted ghost only got 1 vote, their vote_score is 100.
    const maxVotes = Math.max(...entries.map(e => e.vote_count || 0), 1); // Avoid division by 0

    // 3. Calculate Normalized Scores
    // final_rank (internal sum) = (vote_score * 0.4) + (ai_score * 0.6)
    const scoredEntries = entries.map(entry => {
       const rawVotes = entry.vote_count || 0;
       const aiScoreInt = entry.ai_score || 0;

       const voteScore = (rawVotes / maxVotes) * 100;
       const finalScore = (voteScore * 0.4) + (aiScoreInt * 0.6);

       return {
          id: entry.id,
          vote_score: parseFloat(voteScore.toFixed(2)),
          final_score: parseFloat(finalScore.toFixed(2))
       };
    });

    // 4. Sort strictly descending by final_score to establish Rank integer
    scoredEntries.sort((a, b) => b.final_score - a.final_score);

    // 5. Bulk Update Logic back to Supabase
    // Construct individual update promises to write `vote_score`, `final_score`, and `rank`
    // (A real production codebase might use an RPC array upsert for mass performance)
    const updatePromises = scoredEntries.map((scored, index) => {
       return supabase.from('forge_entries').update({
          vote_score: scored.vote_score,
          final_score: scored.final_score,
          rank: index + 1 // 1-indexed ranks
       }).eq('id', scored.id);
    });

    await Promise.all(updatePromises);

    return NextResponse.json({ 
       success: true, 
       message: `Successfully calculated scores and finalized ranks for ${scoredEntries.length} entries.` 
    });

  } catch (err: any) {
    return NextResponse.json({ error: "Score calculation failed" }, { status: 500 });
  }
}
