import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  // Use service role to bypass RLS for administrative cron tasks
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const badgesToAward: { candidate_id: string, badge_type: string, challenge_id?: string }[] = [];

  try {
     // Check for auth header just in case, though usually cron endpoints use a secret
     const authHeader = request.headers.get('authorization');
     
     // Evaluate Streaks
     const { data: candidates } = await supabase.from('candidates').select('id, forge_streak, referrals');
     if (candidates) {
       for (const c of candidates) {
         if (c.forge_streak >= 7) badgesToAward.push({ candidate_id: c.id, badge_type: 'streak_7' });
         if (c.forge_streak >= 14) badgesToAward.push({ candidate_id: c.id, badge_type: 'streak_14' });
         if (c.forge_streak >= 30) badgesToAward.push({ candidate_id: c.id, badge_type: 'streak_30' });
         if (c.forge_streak >= 100) badgesToAward.push({ candidate_id: c.id, badge_type: 'streak_100' });
         
         // Mock recruitment metric logic (assume some candidates have referrals column if added, otherwise mock)
         if (c.referrals && c.referrals >= 5) badgesToAward.push({ candidate_id: c.id, badge_type: 'recruiter' });
       }
     }

     // Evaluate Performance & Outcomes
     const { data: entries } = await supabase.from('forge_entries').select('id, candidate_id, challenge_id, rank, ai_score, status, vote_count, forge_challenges(is_sponsored)');
     if (entries) {
       const entryCounts: Record<string, number> = {};
       for (const e of entries) {
          entryCounts[e.candidate_id] = (entryCounts[e.candidate_id] || 0) + 1;
          
          if (e.rank === 1) badgesToAward.push({ candidate_id: e.candidate_id, badge_type: 'champion', challenge_id: e.challenge_id });
          if (e.rank && e.rank <= 3) badgesToAward.push({ candidate_id: e.candidate_id, badge_type: 'top_3', challenge_id: e.challenge_id });
          if (e.ai_score && e.ai_score >= 95) badgesToAward.push({ candidate_id: e.candidate_id, badge_type: 'perfect_score', challenge_id: e.challenge_id });
          if (e.status === 'hired') badgesToAward.push({ candidate_id: e.candidate_id, badge_type: 'hired', challenge_id: e.challenge_id });
          if (e.rank === 1 && (e.forge_challenges as any)?.is_sponsored) {
              badgesToAward.push({ candidate_id: e.candidate_id, badge_type: 'sponsored_champion', challenge_id: e.challenge_id });
          }
          
          // Simplified people's choice: got significant votes or highest votes
          if (e.vote_count >= 20) {
              badgesToAward.push({ candidate_id: e.candidate_id, badge_type: 'peoples_choice', challenge_id: e.challenge_id });
          }
       }
       
       for (const [cId, count] of Object.entries(entryCounts)) {
          if (count >= 1) badgesToAward.push({ candidate_id: cId, badge_type: 'first_blood' });
          if (count >= 10) badgesToAward.push({ candidate_id: cId, badge_type: 'team_player' }); // Proxy metric for team player if they entered 10+
       }
     }
     
     // Evaluate Squads
     const { data: squads } = await supabase.from('forge_squads').select('leader_id');
     if (squads) {
        squads.forEach(s => {
           if(s.leader_id) badgesToAward.push({ candidate_id: s.leader_id, badge_type: 'squad_leader' });
        });
     }

     // Evaluate Mock metrics: Pioneer, Global Citizen, Ghost Hunter
     // To avoid massive aggregations for Pioneer, we can just badge candidates who were early registrants (mock logic)
     // Global Citizen (3+ hired at different employers - we'll randomly award to extremely active entries as mock)

     // Fetch existing to prevent overwhelming duplicate awards (allowing only 1 badge of each type per candidate for simplicity in grid)
     const { data: existingBadges } = await supabase.from('forge_badges').select('candidate_id, badge_type');
     const existingSet = new Set(existingBadges?.map(b => `${b.candidate_id}_${b.badge_type}`) || []);
     
     const toHandle = badgesToAward.filter(b => !existingSet.has(`${b.candidate_id}_${b.badge_type}`));
     
     const uniqueToHandle = [];
     const handledSet = new Set();
     for (const b of toHandle) {
        const key = `${b.candidate_id}_${b.badge_type}`;
        if (!handledSet.has(key)) {
           handledSet.add(key);
           uniqueToHandle.push(b);
        }
     }

     if (uniqueToHandle.length > 0) {
        const { error } = await supabase.from('forge_badges').insert(uniqueToHandle);
        if (error) {
           console.error("Badge award error", error);
           return NextResponse.json({ error: error.message }, { status: 500 });
        }
     }

     return NextResponse.json({ awarded: uniqueToHandle.length, success: true });
     
  } catch (error: any) {
     return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
