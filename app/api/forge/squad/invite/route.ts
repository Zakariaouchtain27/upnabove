import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { squadId, inviteIds } = await req.json();

    if (!squadId || !inviteIds?.length) {
      return NextResponse.json({ error: "Missing dispatch parameters." }, { status: 400 });
    }

    // Resolve invited candidates (email is a direct column on candidates)
    const { data: candidates, error } = await supabase
      .from("candidates")
      .select("id, first_name, last_name, email")
      .in("id", inviteIds);

    if (error || !candidates) {
      return NextResponse.json({ error: "Candidate resolution failed." }, { status: 404 });
    }

    // Resolve squad + inviting leader's name
    const { data: squad } = await supabase
      .from("forge_squads")
      .select("name, tagline")
      .eq("id", squadId)
      .single();

    if (!squad) {
      return NextResponse.json({ error: "Squad not found." }, { status: 404 });
    }

    const { data: leader } = await supabase
      .from("candidates")
      .select("first_name, last_name")
      .eq("id", user.id)
      .single();

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://upnabove.work";
    let dispatched = 0;

    for (const candidate of candidates) {
      if (!candidate.email) continue;

      const html = `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #eaeaea;border-radius:10px;">
          <h2 style="color:#F59E0B;margin-bottom:4px;">Squad Invitation ⚔️</h2>
          <p style="color:#333;font-size:16px;">Hi ${candidate.first_name},</p>
          <p style="color:#555;font-size:15px;line-height:1.6;">
            <strong>${leader?.first_name ?? "A Forge member"} ${leader?.last_name ?? ""}</strong> has drafted you to join
            <strong>${squad.name}</strong>${squad.tagline ? ` — "${squad.tagline}"` : ""}.
          </p>
          <p style="color:#555;font-size:15px;">Squad up, share streaks, and dominate the leaderboard together.</p>
          <div style="margin-top:24px;">
            <a href="${baseUrl}/dashboard/squad"
               style="background:#F59E0B;color:#000;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">
              Accept or Decline Invite
            </a>
          </div>
          <hr style="border:none;border-top:1px solid #eaeaea;margin:28px 0 16px;" />
          <p style="color:#999;font-size:12px;">You are receiving this because another candidate on UpnAbove invited you to their squad.</p>
        </div>
      `;

      if (resend) {
        await resend.emails.send({
          from: "The Forge <arena@forge.upnabove.com>",
          to: candidate.email,
          subject: `You've been drafted to ${squad.name} on The Forge`,
          html,
        });
        dispatched++;
      } else {
        console.log(`[DEV] Squad invite email would be sent to: ${candidate.email}`);
        dispatched++;
      }
    }

    return NextResponse.json({ success: true, dispatched });
  } catch (error: any) {
    console.error("[Forge Squad Invite Dispatch Failed]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
