import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const VALID_STATUSES = ['pending', 'reviewing', 'interviewing', 'shortlisted', 'hired', 'rejected'];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: applicationId } = await params;
    const { status } = await req.json();

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` }, { status: 400 });
    }

    const supabase = await createClient();
    const db = createAdminClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Ownership check via job → employer
    const { data: app } = await db
      .from('applications')
      .select('id, jobs(employer_id)')
      .eq('id', applicationId)
      .single();

    if (!app) return NextResponse.json({ error: "Application not found." }, { status: 404 });

    const job = Array.isArray(app.jobs) ? app.jobs[0] : app.jobs;
    if ((job as any)?.employer_id !== user.id) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 403 });
    }

    const { error } = await db
      .from('applications')
      .update({ status })
      .eq('id', applicationId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Unexpected error." }, { status: 500 });
  }
}
