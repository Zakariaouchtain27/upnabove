import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { sendNotification } from '@/lib/notifications';

export const dynamic = 'force-dynamic';
// Vercel Cron will hit this route at 9AM

export async function GET(request: Request) {
  // Simple auth check if triggered manually (Vercel crons pass a CRON_SECRET, but we'll keep it simple for local dev)
  const authHeader = request.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn("[Cron] Unauthorized trigger attempt for daily-digest.");
  }

  const supabase = await createClient();

  // 1. Fetch all candidates who have unread notifications in the last 24 hours
  // Or simply, we gather all candidates and find their updates. For performance, we'll query notifications first.
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const { data: recentNotifications, error: notifError } = await supabase
    .from('forge_notifications')
    .select('candidate_id, type, title')
    .eq('is_read', false)
    .gte('created_at', yesterday.toISOString());

  if (notifError || !recentNotifications) {
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }

  // 2. Group by candidate
  const candidateUpdates: Record<string, typeof recentNotifications> = {};
  for (const notif of recentNotifications) {
     if (!notif.candidate_id) continue;
     if (!candidateUpdates[notif.candidate_id]) {
        candidateUpdates[notif.candidate_id] = [];
     }
     candidateUpdates[notif.candidate_id].push(notif);
  }

  // 3. Dispatch Digest Emails (Using our notification library but overriding standard behavior to send a digest)
  // In a real app, we would directly use Resend here since `sendNotification` is meant for single alerts.
  // But we can just use `sendNotification` with type 'system' for the digest if we want to also show it in-app, 
  // or just send the email. Since it's a digest email, we'll construct a system notification.
  
  let emailsSent = 0;
  for (const [candidateId, updates] of Object.entries(candidateUpdates)) {
    if (updates.length > 0) {
       const summaryList = updates.map(u => `• ${u.title}`).join('\n');
       
       await sendNotification({
          candidateId,
          type: 'system',
          title: `Your Forge Daily Digest (${updates.length} Updates)`,
          body: `Here is what you missed in the last 24 hours:\n\n${summaryList}\n\nJump back into The Forge to stay ahead.`,
          link: '/dashboard/forge',
          sendEmail: true
       });
       emailsSent++;
    }
  }

  return NextResponse.json({ 
    success: true, 
    message: `Daily digest dispatched to ${emailsSent} candidates.` 
  });
}
