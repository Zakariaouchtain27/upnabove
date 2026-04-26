import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Inbox, FileText, ExternalLink, Mail } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import type { Metadata } from "next";

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

  // Fetch applications
  const { data: applications, error: appsError } = await supabase
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
        email
      )
    `)
    .eq('job_id', jobId)
    .order('created_at', { ascending: false });

  const apps = applications || [];

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
          Review your candidates below. Click "View CV" to open their resume.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        {apps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Inbox className="w-12 h-12 text-muted mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-1">No applications yet</h3>
            <p className="text-sm text-muted max-w-sm">Share your job posting to start receiving candidates.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface/50">
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Candidate</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Applied On</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Contact</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {apps.map((app: any) => {
                  const cand = app.candidates;
                  if (!cand) return null;
                  
                  return (
                    <tr key={app.id} className="border-b border-border last:border-0 hover:bg-surface-alt transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary font-bold dark:bg-primary-900/30">
                            {cand.first_name?.[0]}{cand.last_name?.[0]}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{cand.first_name} {cand.last_name}</p>
                            {app.employer_viewed && (
                              <Badge variant="default" className="text-[10px] px-1.5 py-0 mt-0.5">Viewed</Badge>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted">{new Date(app.created_at).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <Badge variant="primary" className="capitalize">
                          {app.status || 'applied'}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <a href={`mailto:${cand.email}`} className="text-muted hover:text-primary transition-colors flex items-center gap-1.5">
                          <Mail className="w-4 h-4" />
                          Email
                        </a>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link href={`/employer/applications/${app.id}`}>
                          <Button variant={app.employer_viewed ? "outline" : "primary"} size="sm" className="gap-2">
                            <FileText className="w-4 h-4" />
                            View CV
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
