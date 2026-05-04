import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BarChart3 } from "lucide-react";
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
  const db = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: job, error: jobError } = await db
    .from('jobs')
    .select('title, employer_id')
    .eq('id', jobId)
    .single();

  if (jobError || !job) notFound();

  if (job.employer_id !== user.id) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
        <p className="text-muted mt-2">You do not have permission to view these applications.</p>
        <Link href="/employer"><Button className="mt-6">Return to Dashboard</Button></Link>
      </div>
    );
  }

  const { data: applications } = await db
    .from('applications')
    .select(`id, resume_url, status, created_at, employer_viewed,
      candidates ( id, first_name, last_name, email, cv_text )`)
    .eq('job_id', jobId)
    .order('created_at', { ascending: false });

  const candidateIds = (applications || [])
    .map((a: any) => a.candidates?.id)
    .filter(Boolean);

  // Fetch best Forge score per candidate
  let forgeScoreMap: Record<string, { finalScore: number; rank: number | null }> = {};
  if (candidateIds.length > 0) {
    const { data: forgeEntries } = await db
      .from('forge_entries')
      .select('candidate_id, final_score, rank, ai_score')
      .in('candidate_id', candidateIds)
      .not('final_score', 'is', null)
      .order('final_score', { ascending: false });

    (forgeEntries || []).forEach((e: any) => {
      if (!forgeScoreMap[e.candidate_id]) {
        forgeScoreMap[e.candidate_id] = { finalScore: Math.round(e.final_score), rank: e.rank };
      }
    });
  }

  const applicationsWithForge = (applications || []).map((a: any) => ({
    ...a,
    forgeScore: a.candidates?.id ? (forgeScoreMap[a.candidates.id] || null) : null,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/employer/jobs" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Postings
      </Link>

      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Applications for {job.title}</h1>
          <p className="mt-1 text-muted">Search CVs by keyword, skill, or name. ⚡ = Forge performance score.</p>
        </div>
        <Link href={`/employer/jobs/${jobId}/analytics`}>
          <Button variant="outline" className="gap-2 shrink-0">
            <BarChart3 className="w-4 h-4" /> Analytics
          </Button>
        </Link>
      </div>

      <ApplicationsClient applications={applicationsWithForge} />
    </div>
  );
}
