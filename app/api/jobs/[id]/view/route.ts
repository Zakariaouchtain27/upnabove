import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    const supabase = await createClient();

    const { data: job, error: fetchError } = await supabase
      .from('jobs')
      .select('views')
      .eq('id', jobId)
      .single();

    if (fetchError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const { error: updateError } = await supabase
      .from('jobs')
      .update({ views: job.views + 1 })
      .eq('id', jobId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, views: job.views + 1 });
  } catch (err: unknown) {
    console.error("View tracking error:", err);
    return NextResponse.json({ error: "Failed to track view" }, { status: 500 });
  }
}
