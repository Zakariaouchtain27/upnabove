import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    const supabase = await createClient();

    // Call an RPC function if available, otherwise just fetch and increment (subject to race conditions, but fine for simple views tracking)
    // To do it properly without an RPC, we fetch current views and add 1
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
      .update({ views: (job.views || 0) + 1 })
      .eq('id', jobId);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true, views: (job.views || 0) + 1 });
  } catch (err: any) {
    console.error("View tracking error:", err);
    return NextResponse.json({ error: "Failed to track view" }, { status: 500 });
  }
}
