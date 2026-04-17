import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendNotification } from '@/lib/notifications';
import { headers } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { entryId } = await request.json();
    if (!entryId) return NextResponse.json({ error: "Missing entry ID" }, { status: 400 });

    const supabase = await createClient();
    const reqHeaders = await headers();
    const clientIp = reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip") || "127.0.0.1";

    // 1. RATE LIMIT CHECK: Max 10 votes per hour globally per IP
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const { count: globalVotes, error: countError } = await supabase
      .from('forge_votes')
      .select('id', { count: 'exact', head: true })
      .eq('voter_ip', clientIp)
      .gte('created_at', oneHourAgo.toISOString());

    if (!countError && globalVotes && globalVotes >= 10) {
      return NextResponse.json({ error: "Rate limit exceeded. You can only cast 10 votes per hour." }, { status: 429 });
    }

    // 2. INSERT VOTE
    const { error: insertError } = await supabase.from("forge_votes").insert({
      entry_id: entryId,
      voter_ip: clientIp,
    });

    if (insertError) {
      if (insertError.code === "23505") { // Unique violation
        return NextResponse.json({ error: "You already voted for this ghost." }, { status: 409 });
      }
      return NextResponse.json({ error: "Voting failed. Please try again." }, { status: 500 });
    }

    // 3. SECURE VOTE INCREMENT & RETRIEVE NEW COUNT
    let currentVoteCount = 1;
    // Using RPC to increment if available, else manual fallback
    const { data: rpcData, error: rpcError } = await supabase.rpc('increment_vote', { row_id: entryId });
    if (rpcError) {
      // Manual fallback
      const { data: entryData } = await supabase.from('forge_entries').select('vote_count, candidate_id').eq('id', entryId).single();
      if (entryData) {
        currentVoteCount = (entryData.vote_count || 0) + 1;
        await supabase.from('forge_entries').update({ vote_count: currentVoteCount }).eq('id', entryId);
      }
    } else {
       // Assuming RPC returns the new vote count, or we fetch it
       const { data: updatedEntry } = await supabase.from('forge_entries').select('vote_count, candidate_id').eq('id', entryId).single();
       if (updatedEntry) {
          currentVoteCount = updatedEntry.vote_count;
       }
    }

    // Fetch the entry specifically for Candidate linking
    const { data: entry } = await supabase.from('forge_entries').select('candidate_id, codename').eq('id', entryId).single();

    if (entry) {
      // 4. FRAUD DETECTION: > 50 votes in 10 minutes?
      const tenMinsAgo = new Date();
      tenMinsAgo.setMinutes(tenMinsAgo.getMinutes() - 10);

      const { count: fastVotes } = await supabase
        .from('forge_votes')
        .select('id', { count: 'exact', head: true })
        .eq('entry_id', entryId)
        .gte('created_at', tenMinsAgo.toISOString());

      if (fastVotes && fastVotes > 50) {
        // Flag the entry
        await supabase.from('forge_entries').update({ is_flagged: true }).eq('id', entryId);
        console.warn(`[Anti-Fraud] Flagged Entry ${entryId} for receiving ${fastVotes} votes in under 10 minutes.`);
      }

      // 5. MILESTONE NOTIFICATIONS
      const milestones = [10, 50, 100];
      if (milestones.includes(currentVoteCount) && entry.candidate_id) {
         await sendNotification({
            candidateId: entry.candidate_id,
            type: 'vote_milestone',
            title: `Community Validated! You just hit ${currentVoteCount} votes!`,
            body: `The community is rallying behind you! Your latest Forge submission just crossed the ${currentVoteCount}-vote threshold.`,
            link: '/forge',
            sendEmail: true
         });
      }
    }

    return NextResponse.json({ success: true, count: currentVoteCount });
  } catch (err: any) {
    return NextResponse.json({ error: "An unexpected network error occurred." }, { status: 500 });
  }
}
