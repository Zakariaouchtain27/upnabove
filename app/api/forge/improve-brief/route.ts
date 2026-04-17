import { NextRequest, NextResponse } from "next/server";
// import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: NextRequest) {
  try {
    const { title, description, challenge_type, difficulty, judging_criteria } = await req.json();

    // Gracefully handle AI replacement placeholder
    return NextResponse.json({ error: "AI Features disabled temporarily." }, { status: 503 });

  } catch (error: any) {
    console.error("[Forge Improve Brief API Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
