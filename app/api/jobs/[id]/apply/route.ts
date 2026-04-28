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

    // 2. Get candidate profile via admin client (bypasses RLS)
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

    // 3. Insert application via admin client
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
