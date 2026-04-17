// /lib/forge.ts
import { createClient } from '@/lib/supabase/server'; 

export type ChallengeStatus = 'draft' | 'scheduled' | 'live' | 'judging' | 'completed' | 'cancelled';

/**
 * Invokes the database RPC to generate a unique codename.
 */
export async function generateCodename(challengeId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('generate_codename', { p_challenge_id: challengeId });
  if (error) throw error;
  return data;
}

/**
 * Calculates and updates final rankings via RPC and returns new state.
 */
export async function calculateFinalRankings(challengeId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('calculate_final_rankings', { p_challenge_id: challengeId });
  if (error) throw error;
  return data;
}

/**
 * Reveals top entries and returns their complete data structures.
 */
export async function revealTopEntries(challengeId: string, topN: number = 3) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('reveal_top_entries', { p_challenge_id: challengeId, p_top_n: topN });
  if (error) throw error;
  return data;
}

// ========================================================
// CRON HELPERS - typically called inside /api/forge/cron/*
// ========================================================

/**
 * Sets status 'live' for scheduled challenges passing drop_time.
 */
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

/**
 * Marks expired challenges to judging and immediately builds rankings.
 */
export async function closeExpiredChallenges() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('forge_challenges')
    .update({ status: 'judging' })
    .lte('expires_at', new Date().toISOString())
    .eq('status', 'live')
    .select();
  if (error) throw error;
  
  // Trigger calculate constraints
  for (const challenge of data || []) {
    await calculateFinalRankings(challenge.id);
  }
  return data;
}

/**
 * Deploys winner revealing logic on aging 'judging' states.
 */
export async function processWinnerReveals() {
  const supabase = await createClient();
  // We reveal winners exactly 2 hours after judging commenced (which was roughly ~expires_at).
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
    
    // TODO: Send winner notification emails via Resend
    // Example: sendResendWinnerNotification(challenge);
  }
  
  return judgingChallenges;
}

/**
 * Grants system awards evaluating candidate performance across constraints. 
 */
export async function awardSystemBadges() {
  const supabase = await createClient();
  // System-level logic to evaluate and INSERT into forge_badges:
  // - streak_7, streak_30
  // - first_win 
  // - hired, etc.
  
  // E.g., await supabase.from('forge_badges').insert({...})
  
  return { success: true, processed: 0 };
}
