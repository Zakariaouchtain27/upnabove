import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: NextRequest) {
  try {
    const { candidate_id, challenge_id, prize_value, prize_description } = await req.json();

    if (!candidate_id || !challenge_id) {
      return NextResponse.json({ error: "candidate_id and challenge_id are required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Fetch candidate email and name
    const { data: candidate, error: candidateErr } = await supabase
      .from("candidates")
      .select("email, first_name, last_name")
      .eq("id", candidate_id)
      .single();

    if (candidateErr || !candidate?.email) {
      return NextResponse.json({ error: "Candidate not found or missing email" }, { status: 404 });
    }

    const { data: challenge } = await supabase
      .from("forge_challenges")
      .select("title")
      .eq("id", challenge_id)
      .single();

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://upnabove.work";
    const claimUrl = `${baseUrl}/forge/${challenge_id}`;

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #eaeaea;border-radius:10px;">
        <h2 style="color:#7C3AED;margin-bottom:4px;">You Won! Claim Your Prize 🏆</h2>
        <p style="color:#333;font-size:16px;">Hi ${candidate.first_name},</p>
        <p style="color:#555;font-size:15px;line-height:1.6;">
          Congratulations — you placed first in <strong>${challenge?.title ?? `Challenge #${challenge_id}`}</strong>.
        </p>
        ${prize_description ? `
          <div style="margin:20px 0;padding:16px;background:#f5f3ff;border-radius:8px;border:1px solid #ddd6fe;">
            <p style="margin:0;font-weight:bold;color:#5B21B6;">Prize: ${prize_description}${prize_value ? ` ($${prize_value})` : ""}</p>
          </div>
        ` : ""}
        <div style="margin-top:24px;">
          <a href="${claimUrl}"
             style="background:#7C3AED;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">
            View Your Result
          </a>
        </div>
        <hr style="border:none;border-top:1px solid #eaeaea;margin:28px 0 16px;" />
        <p style="color:#999;font-size:12px;">You are receiving this because you won a Forge challenge on UpnAbove.</p>
      </div>
    `;

    if (resend) {
      await resend.emails.send({
        from: "The Forge <arena@forge.upnabove.com>",
        to: candidate.email,
        subject: `You won "${challenge?.title ?? "a Forge challenge"}" — claim your prize!`,
        html,
      });
    } else {
      console.log(`[DEV] Prize claim email would be sent to: ${candidate.email}`);
    }

    return NextResponse.json({ success: true, message: "Prize claim email sent to candidate." });
  } catch (error: any) {
    console.error("[Forge Prize Claim API Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
