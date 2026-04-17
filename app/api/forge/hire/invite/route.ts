import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { sendNotification } from '@/lib/notifications';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: Request) {
  try {
    const { entryId, challengeId, message, proposedTimes } = await req.json();

    if (!entryId || !challengeId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify ownership of challenge
    const { data: challenge } = await supabase
      .from('forge_challenges')
      .select('*, employers(company_name)')
      .eq('id', challengeId)
      .eq('employer_id', user.id)
      .single();

    if (!challenge) {
      return NextResponse.json({ error: 'Unauthorized employer' }, { status: 404 });
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get candidate info for the invite
    const { data: entry } = await supabaseAdmin
      .from('forge_entries')
      .select('*, candidates(id, email, first_name)')
      .eq('id', entryId)
      .single();

    if (!entry || !entry.candidates) {
      return NextResponse.json({ error: 'Entry or candidate not found' }, { status: 404 });
    }

    // Update entry status
    await supabaseAdmin
      .from('forge_entries')
      .update({ status: 'contacted' })
      .eq('id', entryId);

    // Dispatch email
    const companyName = challenge.employers?.company_name || 'An employer';
    if (resend) {
      const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #7C3AED;">Interview Invite from ${companyName}</h1>
          <p>Hi ${entry.candidates.first_name},</p>
          <p>Congratulations, your performance in the <strong>${challenge.title}</strong> Forge challenge caught their eye!</p>
          <div style="background: #f4f4f5; padding: 15px; border-radius: 8px; margin: 20px 0; font-style: italic;">
            "${message.replace(/\n/g, '<br/>')}"
          </div>
          <p><strong>Proposed Times:</strong></p>
          <p style="white-space: pre-wrap;">${proposedTimes}</p>
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
          <p>Please reply directly to this email or reach out to the employer to confirm a time.</p>
        </div>
      `;
      
      try {
        await resend.emails.send({
          from: 'The Forge <interviews@forge.upnabove.com>',
          to: entry.candidates.email,
          subject: `Interview Invite: ${companyName}`,
          html
        });
      } catch (err) {
        console.error("Resend delivery failed", err);
      }
    }

    // Dispatch in-app notification
    await sendNotification({
       candidateId: entry.candidates.id,
       type: 'system',
       title: 'New Interview Invite!',
       body: `${companyName} wants to interview you for the ${challenge.title} challenge. Check your email to confirm a time!`,
       link: `/forge/${challengeId}`,
       sendEmail: false
    });

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("[Invite Error]", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
