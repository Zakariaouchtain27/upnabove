import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

// Initialize Resend safely so it doesn't crash if env var is missing during local dev
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export type NotificationType = 
  | 'challenge_live'
  | 'rank_change'
  | 'vote_milestone'
  | 'revealed'
  | 'hired'
  | 'squad_invite'
  | 'streak_reminder'
  | 'badge_earned'
  | 'system';

interface NotificationPayload {
  candidateId: string;
  type: NotificationType;
  title: string;
  body: string;
  link?: string;
  sendEmail?: boolean;
}

/**
 * Dispatch an in-app notification (saved to DB and broadcast via Realtime).
 * Optionally triggers a Resend email if `sendEmail` is true.
 */
export async function sendNotification({
  candidateId,
  type,
  title,
  body,
  link,
  sendEmail = false
}: NotificationPayload) {
  const supabase = await createClient();

  // 1. Insert In-App Notification (this triggers Supabase Realtime automatically)
  const { error: dbError } = await supabase
    .from('forge_notifications')
    .insert({
      candidate_id: candidateId,
      type,
      title,
      body,
      link: link || null,
      is_read: false
    });

  if (dbError) {
    console.error(`[Notifications] Failed to insert in-app notification for ${candidateId}:`, dbError);
    // Continue execution to try sending email even if DB fails
  }

  // 2. Dispatch Email (if requested)
  if (sendEmail) {
    // We need the candidate's email address first
    const { data: candidate, error: fetchError } = await supabase
      .from('candidates')
      .select('email, first_name')
      .eq('id', candidateId)
      .single();

    if (fetchError || !candidate?.email) {
      console.error(`[Notifications] Failed to fetch email for candidate ${candidateId} to send email alert.`);
      return;
    }

    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
        <h2 style="color: #7C3AED; margin-bottom: 5px;">${title}</h2>
        <p style="color: #333; font-size: 16px; line-height: 1.5;">Hi ${candidate.first_name},</p>
        <p style="color: #555; font-size: 15px; line-height: 1.6;">${body}</p>
        ${link ? `
          <div style="margin-top: 25px;">
            <a href="https://upnabove.work${link}" style="background-color: #7C3AED; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              View Details in The Forge
            </a>
          </div>
        ` : ''}
        <hr style="border: none; border-top: 1px solid #eaeaea; margin-top: 30px; margin-bottom: 20px;" />
        <p style="color: #999; font-size: 12px;">You are receiving this because you are an active candidate on UpnAbove.</p>
      </div>
    `;

    if (resend) {
      try {
        await resend.emails.send({
          from: 'The Forge <notifications@forge.upnabove.com>',
          to: candidate.email,
          subject: title,
          html: htmlContent,
        });
        console.log(`[Notifications] Sent Resend email successfully to ${candidate.email}`);
      } catch (emailError) {
        console.error(`[Notifications] Resend API failed for ${candidate.email}:`, emailError);
      }
    } else {
      console.log('----------------------------------------------------');
      console.log(`[DEV MODE] Captured Email Request (No RESEND_API_KEY):`);
      console.log(`To: ${candidate.email}`);
      console.log(`Subject: ${title}`);
      console.log(`Body: ${body}`);
      console.log('----------------------------------------------------');
    }
  }
}
