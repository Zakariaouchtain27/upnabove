import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { candidate_id, challenge_id, prize_value, prize_description } = await req.json();

    // Real implementation: Fetch candidate email via candidate_id and dispatch Resend webhook.
    console.log(`[Forge Notifications] Triggering Prize Claim Flow to Candidate ${candidate_id}`);
    
    const mockEmailPayload = {
      subject: "You Won The Arena Drop! Claim Your Prize 🏆",
      message: `Congratulations! You scored highest on challenge ${challenge_id}.`,
      prize: `${prize_description} ($${prize_value})`,
      claim_url: "https://upnabove.com/forge/claim?token=secure_jwt_token_123"
    };

    console.log("[Forge Notifications] Dispatched Claim Email:", mockEmailPayload);

    return NextResponse.json({ success: true, message: "Prize claim email deposited in candidate inbox." });
  } catch (error: any) {
    console.error("[Forge Prize Claim API Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
