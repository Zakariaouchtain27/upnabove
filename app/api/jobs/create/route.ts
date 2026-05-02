import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const db = createAdminClient();

    // 1. Verify identity server-side
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const {
      title, job_type, location, salary_range, description,
      requirements, benefits, is_active,
      country, city, work_mode,
      salary_amount, salary_currency, salary_period,
    } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // 2. Ensure an employers row exists for this user (required by FK constraint)
    const { error: employerErr } = await db
      .from("employers")
      .upsert({ 
        id: user.id,
        company_name: user.user_metadata?.company_name || user.email?.split('@')[0] || "New Employer",
        contact_email: user.email || ""
      }, { onConflict: "id", ignoreDuplicates: true });

    if (employerErr) {
      console.error("Employer upsert error:", employerErr);
      return NextResponse.json({ error: "Failed to initialize employer profile: " + employerErr.message }, { status: 500 });
    }

    // 3. Insert with admin client so employer_id is always set correctly
    const { data: job, error: insertErr } = await db.from("jobs").insert({
      employer_id: user.id,
      title,
      job_type,
      location,
      salary_range,
      description,
      requirements,
      benefits,
      is_active: is_active ?? true,
      country,
      city,
      work_mode,
      salary_amount,
      salary_currency,
      salary_period,
    }).select("id").single();

    if (insertErr) {
      console.error("Job insert error:", insertErr);
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, jobId: job.id });
  } catch (err: any) {
    console.error("Create job API error:", err);
    return NextResponse.json({ error: err.message || "Failed to create job" }, { status: 500 });
  }
}
