import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: jobId } = await params;
    const supabase = await createClient();

    const { error } = await supabase.rpc("increment_job_views", { job_id: jobId });
    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("View tracking error:", err);
    return NextResponse.json({ error: "Failed to track view" }, { status: 500 });
  }
}
