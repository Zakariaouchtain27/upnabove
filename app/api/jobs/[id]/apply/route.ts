import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    const supabase = await createClient();
    const db = createAdminClient();

    // 1. Verify user identity with the user client
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. External (aggregated) jobs cannot be applied to in-platform —
    //    the company never sees in-platform applications for those.
    const { data: job, error: jobErr } = await db
      .from('jobs')
      .select('id, source, external_apply_url')
      .eq('id', jobId)
      .single();

    if (jobErr || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    if (job.source && job.external_apply_url) {
      return NextResponse.json({
        error: "This job is hosted externally. Apply on the company's site.",
        external_apply_url: job.external_apply_url,
      }, { status: 400 });
    }

    // 3. Get candidate profile via admin client (bypasses RLS)
    const { data: candidate, error: candErr } = await db
      .from('candidates')
      .select('id, resume_url')
      .eq('id', user.id)
      .single();

    if (candErr || !candidate) {
      return NextResponse.json({ error: "Candidate profile not found" }, { status: 404 });
    }

    if (!candidate.resume_url) {
      return NextResponse.json({ error: "No CV found in your profile. Please upload one first." }, { status: 400 });
    }

    // 4. Insert application via admin client
    const { error: appErr } = await db.from('applications').insert({
      job_id: jobId,
      candidate_id: candidate.id,
      resume_url: candidate.resume_url
    });

    if (appErr) {
      if (appErr.code === '23505') {
        return NextResponse.json({ error: "You have already applied for this job." }, { status: 400 });
      }
      throw appErr;
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Apply API Error:", err);
    return NextResponse.json({ error: err.message || "Failed to submit application" }, { status: 500 });
  }
}
