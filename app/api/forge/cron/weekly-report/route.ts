import { NextResponse } from 'next/server';
import { createClient as createAdminClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

// Initialize Resend
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FOUNDER_EMAIL = process.env.ADMIN_EMAIL || 'founder@upnabove.work';

export async function GET(req: Request) {
  try {
    // 1. Auth check: verify Vercel Cron Secret
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV !== 'development') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Calculate dates for previous week
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const dateQueryStr = oneWeekAgo.toISOString();

    // 2. Fetch Data
    const [challengesRes, entriesRes, hiresRes] = await Promise.all([
       supabaseAdmin
         .from('forge_challenges')
         .select('id, title, status, payment_amount, employers(company_name)')
         .gte('created_at', dateQueryStr),
       supabaseAdmin
         .from('forge_entries')
         .select('id, candidate_id, candidates(first_name, last_name, email)')
         .gte('entered_at', dateQueryStr),
       supabaseAdmin
         .from('forge_entries')
         .select('id, candidate_id, challenge_id')
         .eq('status', 'hired')
         .gte('revealed_at', dateQueryStr) // Assuming revealed_at/hired falls in this period roughly
    ]);

    const weeklyChallenges = challengesRes.data || [];
    const weeklyEntries = entriesRes.data || [];
    const weeklyHires = hiresRes.data || [];

    const revenue = weeklyChallenges.reduce((acc, c) => acc + (Number(c.payment_amount) || 0), 0);

    // Find "Top Challenge" by entry count (quick derived logic)
    // First, fetch all entries for just these challenges so we can compare
    const activeChallengeIds = weeklyChallenges.map(c => c.id);
    let topChallengeName = "No active drops";
    if (activeChallengeIds.length > 0) {
       const { data: popularEntries } = await supabaseAdmin
         .from('forge_entries')
         .select('challenge_id')
         .in('challenge_id', activeChallengeIds);
         
       const groups: Record<string, number> = {};
       popularEntries?.forEach(e => {
          groups[e.challenge_id] = (groups[e.challenge_id] || 0) + 1;
       });

       const topId = Object.keys(groups).sort((a,b) => groups[b] - groups[a])[0];
       const topChal = weeklyChallenges.find(c => c.id === topId);
       if (topChal) {
           const emp = topChal.employers as any;
           const companyName = Array.isArray(emp) ? emp[0]?.company_name : emp?.company_name;
           topChallengeName = `${topChal.title} by ${companyName || 'Unknown Company'}`;
       }
    }

    // 3. Compile HTML
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #7C3AED; text-transform: uppercase;">The Forge Weekly Pulse</h1>
        <p>Here is your high-level overview of The Forge operations from the last 7 days.</p>
        
        <div style="background: #111; color: white; padding: 20px; border-radius: 12px; margin-top: 20px;">
           <h2 style="margin-top: 0;">Velocity Metrics</h2>
           <ul style="list-style: none; padding: 0;">
             <li style="margin-bottom: 10px;"><strong>Revenue Generated:</strong> <span style="color:#10B981;">$${revenue.toFixed(2)}</span></li>
             <li style="margin-bottom: 10px;"><strong>New Challenges Dropped:</strong> ${weeklyChallenges.length}</li>
             <li style="margin-bottom: 10px;"><strong>New Submissions Captured:</strong> ${weeklyEntries.length}</li>
             <li style="margin-bottom: 10px;"><strong>Total Executed Hires:</strong> ${weeklyHires.length}</li>
           </ul>
        </div>

        <div style="background: #f4f4f5; padding: 20px; border-radius: 12px; margin-top: 20px;">
           <h2 style="margin-top: 0;">Highlights</h2>
           <ul style="list-style: none; padding: 0;">
             <li style="margin-bottom: 10px;"><strong>Top Challenge:</strong> ${topChallengeName}</li>
           </ul>
        </div>
      </div>
    `;

    // 4. Send
    if (resend) {
       await resend.emails.send({
          from: 'The Forge <notifications@forge.upnabove.com>',
          to: FOUNDER_EMAIL,
          subject: 'Weekly Forge Report 📈',
          html
       });
       console.log('Weekly pulse sent to', FOUNDER_EMAIL);
    } else {
       console.log("No RESEND_API_KEY found. Simulation complete.");
    }

    return NextResponse.json({ success: true, revenue, challenges: weeklyChallenges.length });

  } catch (err: any) {
    console.error("[Weekly Report Error]", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
