import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { scoreSubmission } from "@/lib/forge-scorer";

export const dynamic = "force-dynamic";
export const maxDuration = 60; // Vercel max: allow up to 60s for Claude call

export async function POST(request: NextRequest) {
  try {
    // Verify the request is authorised — accept either CRON_SECRET or SUPABASE_SERVICE_ROLE
    const auth = request.headers.get("authorization");
    const isService = auth === `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`;
    const isCron    = auth === `Bearer ${process.env.CRON_SECRET}`;
    if (!isService && !isCron) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { entryId } = await request.json();
    if (!entryId) return NextResponse.json({ error: "Missing entryId" }, { status: 400 });

    // Use service-role client to bypass RLS
    const supabase = await createClient();

    // 1. Fetch the entry + challenge details
    const { data: entry, error: entryErr } = await supabase
      .from("forge_entries")
      .select(`
        id, submission_text, submission_url, codename,
        forge_challenges (
          title, description, challenge_type, difficulty, judging_criteria
        )
      `)
      .eq("id", entryId)
      .single();

    if (entryErr || !entry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    const challenge = entry.forge_challenges as any;

    if (!entry.submission_text && !entry.submission_url) {
      return NextResponse.json({ error: "No submission content to score" }, { status: 422 });
    }

    // 2. Mark as processing in queue
    await supabase
      .from("forge_scoring_queue")
      .update({ status: "processing" })
      .eq("entry_id", entryId);

    // 3. Call the scoring engine
    const result = await scoreSubmission({
      submissionText: entry.submission_text || "",
      submissionUrl:  entry.submission_url,
      challengeTitle: challenge.title,
      challengeDescription: challenge.description,
      challengeType: challenge.challenge_type,
      difficulty: challenge.difficulty,
      criteria: Array.isArray(challenge.judging_criteria) ? challenge.judging_criteria : [],
    });

    // 4. Persist ai_score + ai_feedback to forge_entries
    const feedbackJson = JSON.stringify({
      summary:          result.summary,
      standout_factor:  result.standout_factor,
      strengths:        result.strengths,
      improvements:     result.improvements,
      criterion_scores: result.criterion_scores,
    });

    const { error: updateErr } = await supabase
      .from("forge_entries")
      .update({
        ai_score:    result.total_score,
        ai_feedback: feedbackJson,
        status:      "scored",
      })
      .eq("id", entryId);

    if (updateErr) throw new Error(`Failed to persist score: ${updateErr.message}`);

    // 5. Mark queue item as done
    await supabase
      .from("forge_scoring_queue")
      .update({ status: "done", processed_at: new Date().toISOString() })
      .eq("entry_id", entryId);

    return NextResponse.json({ success: true, score: result.total_score });
  } catch (err: any) {
    console.error("[AI Score Error]", err);

    // Mark queue item as failed
    const body = await request.clone().json().catch(() => ({}));
    if (body.entryId) {
      const supabase = await createClient();
      await supabase
        .from("forge_scoring_queue")
        .update({ status: "failed", error: err.message })
        .eq("entry_id", body.entryId);
    }

    return NextResponse.json({ error: "Scoring failed", detail: err.message }, { status: 500 });
  }
}
