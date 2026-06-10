import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

/**
 * Records that a logged-in candidate clicked through to an external job
 * posting. Stored in `applications` with status "redirected" so the job
 * shows up in their dashboard, but it is NOT a real submission — the user
 * completes the application on the company's site.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    // Anonymous click-throughs are fine — nothing to record
    if (!user) return NextResponse.json({ success: true, tracked: false });

    const db = createAdminClient();

    const { data: candidate } = await db
      .from("candidates")
      .select("id, resume_url")
      .eq("id", user.id)
      .single();
    if (!candidate) return NextResponse.json({ success: true, tracked: false });

    const { error } = await db.from("applications").insert({
      job_id: jobId,
      candidate_id: candidate.id,
      resume_url: candidate.resume_url ?? "",
      status: "redirected",
    });

    // 23505 = already tracked; not an error for the client
    if (error && error.code !== "23505") {
      console.error("track-apply insert error:", error.message);
      return NextResponse.json({ success: true, tracked: false });
    }

    return NextResponse.json({ success: true, tracked: true });
  } catch {
    return NextResponse.json({ success: true, tracked: false });
  }
}
