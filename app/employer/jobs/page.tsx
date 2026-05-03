import type { Metadata } from "next";
import { Plus, Inbox } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";

export const metadata: Metadata = {
  title: "My Postings — UpnAbove",
  description: "View and manage all your job postings.",
};

export default async function EmployerJobsPage() {
  const supabase = await createClient();
  const db = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();

  let postings: any[] = [];

  if (user) {
    try {
      const resolvedEmployerId = user.id;

      const { data: jobPostings } = await db
        .from('jobs')
        .select('id, title, location, job_type, created_at, views, is_active, applications(count)')
        .eq('employer_id', resolvedEmployerId)
        .order('created_at', { ascending: false });

      postings = jobPostings || [];
    } catch (err) {
      console.error('Unexpected error fetching jobs:', err);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            My Postings
          </h1>
          <p className="mt-1 text-muted">
            Manage your open roles and job listings
          </p>
        </div>
        <Link href="/employer/jobs/create">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Post a Job
          </Button>
        </Link>
      </div>

      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            All Job Postings
          </h2>
        </div>

        {postings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Inbox className="w-12 h-12 text-muted mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-1">No postings yet</h3>
            <p className="text-sm text-muted max-w-sm">Create your first job posting to start attracting top talent.</p>
            <Link href="/employer/jobs/create" className="mt-4">
              <Button>Create Posting</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Position</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Views</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Applicants</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Posted</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-muted uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {postings.map((posting: any) => (
                  <tr key={posting.id} className="border-b border-border last:border-0 hover:bg-surface-alt transition-colors">
                    <td className="px-5 py-4 font-medium text-foreground">{posting.title}</td>
                    <td className="px-5 py-4">
                      <Badge variant={posting.is_active ? "success" : "warning"}>
                        {posting.is_active ? 'active' : 'draft'}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 font-medium text-foreground">{posting.views || 0}</td>
                    <td className="px-5 py-4 font-medium text-foreground">{posting.applications?.[0]?.count || 0}</td>
                    <td className="px-5 py-4 text-muted">{new Date(posting.created_at).toLocaleDateString()}</td>
                    <td className="px-5 py-4 text-right">
                      <Link href={`/employer/jobs/${posting.id}/applications`}>
                        <Button variant="outline" size="sm">
                          View Applications
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
