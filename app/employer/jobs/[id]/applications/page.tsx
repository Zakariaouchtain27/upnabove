import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import type { Metadata } from "next";
import ApplicationsClient from "./ApplicationsClient";

export const metadata: Metadata = {
  title: "Job Applications | UpnAbove Employer",
  description: "View candidates for your job posting.",
};

export default async function JobApplicationsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: jobId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Verify the employer owns this job
  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('title, employer_id')
    .eq('id', jobId)
    .single();

  if (jobError || !job) {
    notFound();
  }

  const { data: employer } = await supabase
    .from('employers')
    .select('id')
    .eq('id', user.id)
    .single();

  if (!employer || employer.id !== job.employer_id) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
        <p className="text-muted mt-2">You do not have permission to view these applications.</p>
        <Link href="/employer"><Button className="mt-6">Return to Dashboard</Button></Link>
      </div>
    );
  }

  // Cast to any[] since cv_text won't be in generated types until DB types are regenerated
  const { data: applications } = await (supabase as any)
    .from('applications')
    .select(`
      id,
      resume_url,
      status,
      created_at,
      employer_viewed,
      candidates (
        id,
        first_name,
        last_name,
        email,
        cv_text
      )
    `)
    .eq('job_id', jobId)
    .order('created_at', { ascending: false });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <Link
        href="/employer"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Applications for {job.title}
        </h1>
        <p className="mt-1 text-muted">
          Review your candidates below. Search by skills or keywords found in their CVs.
        </p>
      </div>

      <ApplicationsClient applications={applications || []} />
    </div>
  );
}
