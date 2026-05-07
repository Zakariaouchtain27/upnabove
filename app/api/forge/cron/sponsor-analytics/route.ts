import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { challenge_id } = await req.json();
    if (!challenge_id) return NextResponse.json({ error: "challenge_id is required" }, { status: 400 });

    const supabase = await createClient();

    // Fetch challenge details and sponsoring employer
    const { data: challenge, error: challengeErr } = await supabase
      .from('forge_challenges')
      .select('id, title, employer_id, expires_at')
      .eq('id', challenge_id)
      .single();

    if (challengeErr || !challenge) {
      return NextResponse.json({ error: "Challenge not found" }, { status: 404 });
    }

    // Fetch employer email
    const { data: employer } = challenge.employer_id
      ? await supabase
          .from('employers')
          .select('email, company_name')
          .eq('id', challenge.employer_id)
          .single()
      : { data: null };

    if (!employer?.email) {
      return NextResponse.json({ error: "No sponsor email on file for this challenge" }, { status: 422 });
    }

    // Aggregate real stats from forge_entries
    const { data: entries } = await supabase
      .from('forge_entries')
      .select('ai_score, candidate_id, codename, final_rank')
      .eq('challenge_id', challenge_id);

    const totalEntries = entries?.length ?? 0;
    const scoredEntries = entries?.filter(e => e.ai_score !== null) ?? [];
    const avgScore = scoredEntries.length > 0
      ? Math.round(scoredEntries.reduce((sum, e) => sum + (e.ai_score ?? 0), 0) / scoredEntries.length * 10) / 10
      : null;
    const topEntry = entries?.find(e => e.final_rank === 1);

    const statsHtml = `
      <tr><td style="padding:8px 0;color:#555;">Total Entries</td><td style="padding:8px 0;font-weight:bold;color:#111;">${totalEntries}</td></tr>
      <tr><td style="padding:8px 0;color:#555;">Average AI Score</td><td style="padding:8px 0;font-weight:bold;color:#111;">${avgScore !== null ? `${avgScore}/100` : 'N/A'}</td></tr>
      ${topEntry ? `<tr><td style="padding:8px 0;color:#555;">Top Submission</td><td style="padding:8px 0;font-weight:bold;color:#111;">${topEntry.codename} (Rank #1)</td></tr>` : ''}
    `;

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://upnabove.work';

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #eaeaea;border-radius:10px;">
        <h2 style="color:#7C3AED;margin-bottom:4px;">Your Forge Drop Analytics 📈</h2>
        <p style="color:#555;font-size:14px;">Challenge: <strong>${challenge.title}</strong></p>
        <table style="width:100%;border-collapse:collapse;margin-top:20px;">
          <tbody>${statsHtml}</tbody>
        </table>
        <div style="margin-top:28px;">
          <a href="${baseUrl}/employer/forge/${challenge.id}/analytics"
             style="background:#7C3AED;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">
            View Full Analytics
          </a>
        </div>
        <hr style="border:none;border-top:1px solid #eaeaea;margin:28px 0 16px;" />
        <p style="color:#999;font-size:12px;">You are receiving this as the sponsor of a Forge challenge on UpnAbove.</p>
      </div>
    `;

    if (resend) {
      await resend.emails.send({
        from: 'The Forge <analytics@forge.upnabove.com>',
        to: employer.email,
        subject: `Your Forge Drop Analytics: ${challenge.title}`,
        html,
      });
    } else {
      console.log('[DEV] Sponsor analytics email would be sent to:', employer.email);
    }

    return NextResponse.json({ success: true, message: "Analytics email dispatched.", totalEntries, avgScore });
  } catch (error: any) {
    console.error("[Forge Sponsor Analytics API Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
