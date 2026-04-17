import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn("[Cron] Unauthorized trigger attempt for streak-reminder.");
  }

  const supabase = await createClient();

  // 1. Find all active candidates who had streaks > 0
  // Since we only track streaks on `forge_squads` in our schema currently, we will remind the squad leaders/members.
  // We'll iterate over active squads that have a streak > 0
  
  const { data: activeSquads, error: squadsError } = await supabase
    .from('forge_squads')
    .select(`
       id,
       name,
       streak,
       members:forge_squad_members ( candidate_id )
    `)
    .gt('streak', 0)
    .eq('is_active', true);

  if (squadsError || !activeSquads) {
    return NextResponse.json({ error: 'Failed to fetch squads' }, { status: 500 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let remindersSent = 0;

  for (const squad of activeSquads) {
    // Check if the squad made any entry today
    const { data: entries, error: entryError } = await supabase
      .from('forge_entries')
      .select('id')
      .eq('squad_id', squad.id)
      .gte('entered_at', today.toISOString())
      .limit(1);

    if (!entryError && entries && entries.length === 0) {
      // Squad has not entered anything today! Their streak is at risk.
      const candidateIds = squad.members.map((m: any) => m.candidate_id);
      
      for (const candidateId of candidateIds) {
        // Send urgent notification (Email + In-App)
        await sendNotification({
          candidateId,
          type: 'streak_reminder',
          title: `⚠️ Your ${squad.streak}-Day Streak is at Risk!`,
          body: `Squad ${squad.name} hasn't submitted a Forge entry today. You have until midnight to submit a solution and keep the flame alive. Don't lose your progress!`,
          link: '/forge',
          sendEmail: true
        });
        remindersSent++;
      }
    }
  }

  return NextResponse.json({ 
    success: true, 
    message: `Streak reminders dispatched to ${remindersSent} candidates across at-risk squads.` 
  });
}
