import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { title, description, challenge_type, difficulty, judging_criteria } = await req.json();

    if (!title || !description) {
      return NextResponse.json({ error: "title and description are required" }, { status: 400 });
    }

    const criteriaText = Array.isArray(judging_criteria) && judging_criteria.length > 0
      ? judging_criteria.map((c: any) => `- ${c.name} (${c.weight}%): ${c.description}`).join("\n")
      : "None specified";

    const prompt = `You are an expert at writing compelling, clear, and fair challenge briefs for developer competitions. Improve the following challenge brief to make it more engaging, unambiguous, and exciting for candidates. Keep the core intent intact.

Challenge title: ${title}
Type: ${challenge_type}
Difficulty: ${difficulty}

Current description:
${description}

Judging criteria:
${criteriaText}

Return ONLY valid JSON with this shape:
{
  "improved_title": "<improved title, max 80 chars>",
  "improved_description": "<improved markdown description, 150-400 words, engaging and precise>",
  "improvement_notes": "<1-2 sentences explaining the key changes you made>"
}`;

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const raw = (message.content[0] as { type: string; text: string }).text.trim();
    const jsonText = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const result = JSON.parse(jsonText);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[Forge Improve Brief API Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
