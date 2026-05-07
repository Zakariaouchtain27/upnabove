// /lib/forge.ts
import { createClient } from '@/lib/supabase/server';
import { sendNotification } from '@/lib/notifications';

export type ChallengeStatus = 'draft' | 'scheduled' | 'live' | 'judging' | 'completed' | 'cancelled';

export async function generateCodename(challengeId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('generate_codename', { p_challenge_id: challengeId });
  if (error) throw error;
  return data;
}

export async function calculateFinalRankings(challengeId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('calculate_final_rankings', { p_challenge_id: challengeId });
  if (error) throw error;
  return data;
}

export async function revealTopEntries(challengeId: string, topN: number = 3) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('reveal_top_entries', { p_challenge_id: challengeId, p_top_n: topN });
  if (error) throw error;
  return data;
}

// ========================================================
// CRON HELPERS
// ========================================================

export async function openScheduledChallenges() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('forge_challenges')
    .update({ status: 'live' })
    .lte('drop_time', new Date().toISOString())
    .eq('status', 'scheduled')
    .select();
  if (error) throw error;
  return data;
}

export async function closeExpiredChallenges() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('forge_challenges')
    .update({ status: 'judging' })
    .lte('expires_at', new Date().toISOString())
    .eq('status', 'live')
    .select();
  if (error) throw error;

  for (const challenge of data || []) {
    await calculateFinalRankings(challenge.id);
  }
  return data;
}

export async function processWinnerReveals() {
  const supabase = await createClient();
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

  const { data: judgingChallenges, error: fetchError } = await supabase
    .from('forge_challenges')
    .select('id, title, expires_at')
    .eq('status', 'judging')
    .lte('expires_at', twoHoursAgo);

  if (fetchError) throw fetchError;

  for (const challenge of judgingChallenges || []) {
    await revealTopEntries(challenge.id, 3);
    await supabase.from('forge_challenges').update({ status: 'completed' }).eq('id', challenge.id);

    // Fetch top 3 entries with candidate IDs to notify winners
    const { data: topEntries } = await supabase
      .from('forge_entries')
      .select('candidate_id, final_rank, codename')
      .eq('challenge_id', challenge.id)
      .not('final_rank', 'is', null)
      .order('final_rank', { ascending: true })
      .limit(3);

    const rankLabels: Record<number, string> = { 1: '1st', 2: '2nd', 3: '3rd' };

    for (const entry of topEntries || []) {
      if (!entry.candidate_id) continue;
      const rank = entry.final_rank as number;
      const label = rankLabels[rank] ?? `#${rank}`;

      await sendNotification({
        candidateId: entry.candidate_id,
        type: 'revealed',
        title: `You placed ${label} in "${challenge.title}"! 🏆`,
        body: `Congratulations! Your submission as ${entry.codename} finished ${label} place in the Forge challenge "${challenge.title}". Employers can now view your profile.`,
        link: `/forge/${challenge.id}`,
        sendEmail: true,
      });
    }
  }

  return judgingChallenges;
}

export async function awardSystemBadges() {
  const supabase = await createClient();
  let processed = 0;

  // --- streak_7: candidates with forge_streak >= 7 who don't have the badge yet ---
  const { data: streak7Candidates } = await supabase
    .from('candidates')
    .select('id')
    .gte('forge_streak', 7);

  for (const candidate of streak7Candidates || []) {
    const { data: existing } = await supabase
      .from('forge_badges')
      .select('id')
      .eq('candidate_id', candidate.id)
      .eq('badge_id', 'streak_7')
      .maybeSingle();

    if (!existing) {
      await supabase.from('forge_badges').insert({ candidate_id: candidate.id, badge_id: 'streak_7' });
      await sendNotification({
        candidateId: candidate.id,
        type: 'badge_earned',
        title: 'Badge Unlocked: 7-Day Streak! 🔥',
        body: 'You\'ve entered the Forge 7 days in a row. Keep the momentum going!',
        link: '/dashboard/forge',
        sendEmail: false,
      });
      processed++;
    }
  }

  // --- streak_30: candidates with forge_streak >= 30 ---
  const { data: streak30Candidates } = await supabase
    .from('candidates')
    .select('id')
    .gte('forge_streak', 30);

  for (const candidate of streak30Candidates || []) {
    const { data: existing } = await supabase
      .from('forge_badges')
      .select('id')
      .eq('candidate_id', candidate.id)
      .eq('badge_id', 'streak_30')
      .maybeSingle();

    if (!existing) {
      await supabase.from('forge_badges').insert({ candidate_id: candidate.id, badge_id: 'streak_30' });
      await sendNotification({
        candidateId: candidate.id,
        type: 'badge_earned',
        title: 'Badge Unlocked: 30-Day Legend! 🏅',
        body: 'An incredible 30-day streak. You are a Forge Legend.',
        link: '/dashboard/forge',
        sendEmail: true,
      });
      processed++;
    }
  }

  // --- first_win: candidates who placed 1st in any challenge and don't have the badge ---
  const { data: firstWinEntries } = await supabase
    .from('forge_entries')
    .select('candidate_id')
    .eq('final_rank', 1)
    .not('candidate_id', 'is', null);

  const firstWinIds = [...new Set((firstWinEntries || []).map(e => e.candidate_id as string))];

  for (const candidateId of firstWinIds) {
    const { data: existing } = await supabase
      .from('forge_badges')
      .select('id')
      .eq('candidate_id', candidateId)
      .eq('badge_id', 'first_win')
      .maybeSingle();

    if (!existing) {
      await supabase.from('forge_badges').insert({ candidate_id: candidateId, badge_id: 'first_win' });
      await sendNotification({
        candidateId,
        type: 'badge_earned',
        title: 'Badge Unlocked: First Win! 🥇',
        body: 'You\'ve won your first Forge challenge. The leaderboard knows your name.',
        link: '/dashboard/forge',
        sendEmail: true,
      });
      processed++;
    }
  }

  return { success: true, processed };
}
