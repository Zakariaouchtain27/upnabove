import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    const supabase = await createClient();
    const db = createAdminClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: job, error: fetchErr } = await db
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .eq('employer_id', user.id)
      .single();

    if (fetchErr || !job) {
      return NextResponse.json({ error: "Job not found or unauthorized." }, { status: 404 });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const { id: _oldId, created_at: _ca, updated_at: _ua, ...jobFields } = job;

    const { data: newJob, error: insertErr } = await db
      .from('jobs')
      .insert({
        ...jobFields,
        views: 0,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        expires_at: expiresAt.toISOString(),
      })
      .select('id')
      .single();

    if (insertErr || !newJob) {
      return NextResponse.json({ error: "Failed to repost job." }, { status: 500 });
    }

    return NextResponse.json({ success: true, jobId: newJob.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unexpected error." }, { status: 500 });
  }
}
