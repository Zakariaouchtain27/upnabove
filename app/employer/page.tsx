import type { Metadata } from "next";
import { Plus, BarChart3, Users, Eye, Briefcase, Rocket, Inbox } from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Employer Dashboard — UpnAbove",
  description: "Manage your job postings and candidates on UpnAbove.",
};

export default async function EmployerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch real employer data
  let postings: any[] = [];
  let stats = { active: 0, applicants: 0, views: 0 };

  if (user) {
    try {
      const { data: employer } = await supabase
        .from('employers')
        .select('id')
        .eq('id', user.id)
        .single();

      // Use employer.id if the row exists, otherwise fall back to user.id directly
      // (jobs are keyed by employer_id = user.id even without an employers row)
      const resolvedEmployerId = employer?.id ?? user.id;

      // Fetch real job postings with application count
      const { data: jobPostings } = await supabase
        .from('jobs')
        .select('id, title, status, location, job_type, created_at, views, is_active, applications(count)')
        .eq('employer_id', resolvedEmployerId)
        .order('created_at', { ascending: false });

      postings = jobPostings || [];
      stats.active = postings.filter(p => p.is_active || p.status === 'active').length;
      stats.views = postings.reduce((sum, job) => sum + (job.views || 0), 0);
      stats.applicants = postings.reduce((sum, job) => sum + (job.applications?.[0]?.count || 0), 0);
    } catch (err) {
      console.error('Unexpected error in employer dashboard:', err);
    }

    // Fetch forge challenges by this employer
    try {
      const { count: challengeCount } = await supabase
        .from('forge_challenges')
        .select('id', { count: 'exact', head: true })
        .eq('employer_id', user.id);

      stats.active = stats.active + (challengeCount || 0);
    } catch (err) {
      console.error('Error fetching challenges:', err);
    }
  }


  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Employer Dashboard
          </h1>
          <p className="mt-1 text-muted">
            Manage your job postings and candidates
          </p>
        </div>
        <Link href="/employer/jobs/create">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Post a Job
          </Button>
        </Link>
      </div>

      {/* Payment & Subscription Hub */}
      <div className="mb-8 grid grid-cols-1 gap-4">
         <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
             <div>
                <h3 className="font-bold text-emerald-500 flex items-center gap-2"><Rocket className="w-5 h-5" /> Your First Drop is on Us!</h3>
                <p className="text-sm text-muted mt-1">We&apos;re investing in your hiring speed. Your first standard Forge Challenge check-out is 100% free. Additionally, Deep Analytics are now unconditionally unlocked for all active listings at no cost.</p>
             </div>
             <Link href="/employer/forge/create">
               <Button className="shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-6 py-2 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]">Deploy Now</Button>
             </Link>
         </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Active Jobs", value: stats.active.toString(), icon: <Briefcase className="w-5 h-5" /> },
          { label: "Total Applicants", value: stats.applicants.toString(), icon: <Users className="w-5 h-5" /> },
          { label: "Total Views", value: stats.views.toString(), icon: <Eye className="w-5 h-5" /> },
          { label: "Hire Rate", value: "—", icon: <BarChart3 className="w-5 h-5" /> },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-5 rounded-2xl border border-border bg-background"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary flex items-center justify-center dark:bg-primary-900/30">
                {stat.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Postings table */}
      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <div className="p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Your Job Postings
          </h2>
        </div>

        {postings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Inbox className="w-12 h-12 text-muted mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-1">No postings yet</h3>
            <p className="text-sm text-muted max-w-sm">Create your first job posting or Forge challenge to start attracting top talent.</p>
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
                      <Badge variant={posting.status === "active" ? "success" : "warning"}>
                        {posting.status || 'draft'}
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
