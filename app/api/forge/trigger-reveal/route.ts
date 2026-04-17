import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Initialize Resend
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: Request) {
  try {
    const { challengeId } = await req.json();

    if (!challengeId) {
      return NextResponse.json({ error: 'Challenge ID is required' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // 1. Authenticate user and verify they are an employer
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify it's the exact employer who owns this challenge
    const { data: challenge, error: challengeError } = await supabase
      .from('forge_challenges')
      .select('*, employers(company_name, contact_email)')
      .eq('id', challengeId)
      .eq('employer_id', user.id)
      .single();

    if (challengeError || !challenge) {
      return NextResponse.json({ error: 'Challenge not found or unauthorized' }, { status: 404 });
    }

    // Create Admin Client to bypass RLS for modifying other users' entries
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 2. Update Challenge Status
    await supabaseAdmin
      .from('forge_challenges')
      .update({ status: 'completed' })
      .eq('id', challengeId);

    // 3. Get Top 3 Entries
    const { data: entries } = await supabaseAdmin
      .from('forge_entries')
      .select('*, candidates(first_name, email)')
      .eq('challenge_id', challengeId)
      .not('ai_score', 'is', null)
      .order('rank', { ascending: true })
      .limit(3);

    if (entries && entries.length > 0) {
       // 4. Promote to Revealed
       const entryIds = entries.map(e => e.id);
       await supabaseAdmin
         .from('forge_entries')
         .update({ 
           is_revealed: true, 
           revealed_at: new Date().toISOString(),
           status: 'revealed'
         })
         .in('id', entryIds);

       // 5. Send Resend Emails to the Winners
       if (resend) {
         const companyName = challenge.employers?.company_name || "The Employer";
         
         // Send to Candidates
         const emailPromises = entries.map(entry => {
            if (!entry.candidates?.email) return Promise.resolve();

            const html = `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #7C3AED;">You made it — you're revealed on The Forge</h1>
                <p>Congratulations ${entry.candidates.first_name},</p>
                <p>Your entry for <strong>${challenge.title}</strong> by ${companyName} has just been revealed!</p>
                <div style="background: #f4f4f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <ul style="list-style: none; padding: 0;">
                    <li><strong>Final Rank:</strong> #${entry.rank}</li>
                    <li><strong>AI Score:</strong> ${entry.ai_score}/100</li>
                    <li><strong>Community Votes:</strong> ${entry.vote_count}</li>
                  </ul>
                </div>
                <p>The employer will review the top revealed profiles and may reach out shortly with an interview invite.</p>
                <a href="https://upnabove.work/forge/${challenge.id}/reveal" style="display:inline-block; background:#7C3AED; color:white; padding:12px 24px; text-decoration:none; border-radius:6px; font-weight:bold;">
                  View Leaderboard & Share
                </a>
              </div>
            `;

            return resend.emails.send({
              from: 'The Forge <notifications@forge.upnabove.com>',
              to: entry.candidates.email,
              subject: `You made it — you're revealed on The Forge`,
              html
            });
         });

         // Send Summary to Employer
         const employerEmail = challenge.employers?.contact_email;
         if (employerEmail) {
            const empHtml = `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #10B981;">Results are Live!</h1>
                <p>You have successfully revealed the winners for <strong>${challenge.title}</strong>.</p>
                <p>The top 3 candidates have been notified and their identities are now visible in your dashboard.</p>
                <a href="https://upnabove.work/employer/forge/${challenge.id}/analytics" style="display:inline-block; background:#10B981; color:white; padding:12px 24px; text-decoration:none; border-radius:6px; font-weight:bold;">
                  View Winners & Send Invites
                </a>
              </div>
            `;
            emailPromises.push(resend.emails.send({
               from: 'The Forge <notifications@forge.upnabove.com>',
               to: employerEmail,
               subject: `Forge Challenge Complete: ${challenge.title}`,
               html: empHtml
            }));
         }

         await Promise.allSettled(emailPromises);
       } else {
         console.log("No RESEND_API_KEY found, simulating email sending...");
       }
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("[Trigger Reveal Error]", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
