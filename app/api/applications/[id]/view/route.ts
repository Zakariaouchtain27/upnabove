import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: appId } = await params;
    const supabase = await createClient();

    // 1. Fetch application details
    const { data: app, error: appError } = await supabase
      .from('applications')
      .select(`
        id,
        employer_viewed,
        jobs (
          title,
          employer_id,
          company_name
        ),
        candidates (
          first_name,
          last_name,
          email
        )
      `)
      .eq('id', appId)
      .single();

    if (appError || !app) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    // 2. Verify caller is the employer of this job
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: employer } = await supabase
      .from('employers')
      .select('id')
      .eq('id', user.id)
      .single();

    if (!employer || !app.jobs || employer.id !== app.jobs.employer_id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3. If already viewed, we don't send another email to avoid spam
    if (app.employer_viewed) {
      return NextResponse.json({ success: true, message: "Already viewed" });
    }

    // 4. Mark as viewed
    const { error: updateError } = await supabase
      .from('applications')
      .update({ employer_viewed: true, status: 'reviewing' })
      .eq('id', appId);

    if (updateError) throw updateError;

    // 5. Send Email via Resend
    if (process.env.RESEND_API_KEY && app.candidates && app.jobs) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const companyName = app.jobs.company_name || 'An employer';
      
      await resend.emails.send({
        from: 'UpnAbove Updates <notifications@upnabove.com>', // Replace with your verified Resend domain
        to: app.candidates.email,
        subject: `Good news! ${companyName} is reviewing your application 🚀`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #FF6F61;">Application Update</h2>
            <p>Hi ${app.candidates.first_name},</p>
            <p>Great news! <strong>${companyName}</strong> is currently viewing your application for the <strong>${app.jobs.title}</strong> position.</p>
            <p>Keep an eye on your dashboard or inbox for any further updates or interview requests.</p>
            <br/>
            <p>Best of luck,</p>
            <p>The UpnAbove Team</p>
          </div>
        `
      });
    } else {
      console.warn("RESEND_API_KEY is not set or missing candidate/job info. Skipping email notification.");
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error marking application as viewed:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
