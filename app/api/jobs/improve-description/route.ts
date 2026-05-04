import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { title, description, requirements } = await req.json();

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required." }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AI features not configured." }, { status: 503 });
    }

    const prompt = `You are an expert HR copywriter. Improve the following job description to be more compelling, clear, and attractive to top candidates. Keep it concise (under 300 words), professional, and honest. Do not invent requirements or benefits that weren't implied. Return ONLY the improved description text — no commentary, no headers, no markdown.

Job Title: ${title}
${requirements ? `Key Requirements: ${requirements}` : ""}

Current Description:
${description}`;

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 600,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[Improve Description] Anthropic API error:", err);
      return NextResponse.json({ error: "AI service error." }, { status: 502 });
    }

    const data = await res.json();
    const improved = data.content?.[0]?.type === "text" ? data.content[0].text.trim() : null;

    if (!improved) {
      return NextResponse.json({ error: "AI returned an empty response." }, { status: 500 });
    }

    return NextResponse.json({ description: improved });
  } catch (err: any) {
    console.error("[Improve Description Error]:", err);
    return NextResponse.json({ error: err.message || "Failed to improve description." }, { status: 500 });
  }
}
