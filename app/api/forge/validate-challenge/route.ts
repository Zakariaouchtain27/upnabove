import { NextRequest, NextResponse } from "next/server";
// import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.json();

    // Resolve validation cleanly so progression functions as normal without AI
    return NextResponse.json({ warnings: [] });

  } catch (error: any) {
    console.error("[Forge Validate Challenge API Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
