import { createClient } from "@/lib/supabase/server";
import { getJobAnalytics } from "@/lib/services/employerService";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BarChart3, Eye, Users, TrendingUp } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import JobFunnelChart from "@/components/employer/JobFunnelChart";

export default async function JobAnalyticsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: jobId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data, error } = await getJobAnalytics(jobId, user.id);
  if (error || !data) notFound();

  const { job, applications, applicationTrend, funnel } = data;
  const conversionRate = job.views > 0 ? ((applications.length / job.views) * 100).toFixed(1) : "0.0";

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <Link href={`/employer/jobs/${jobId}/applications`} className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Applications
        </Link>
        <h1 className="text-3xl font-black uppercase tracking-tight text-foreground flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-primary" /> {job.title}
        </h1>
        <p className="text-sm text-muted mt-1">Per-job analytics and hiring funnel breakdown.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Views", value: (job.views || 0).toLocaleString(), icon: Eye, color: "text-violet-400", bg: "bg-violet-500/10" },
          { label: "Applications", value: applications.length.toLocaleString(), icon: Users, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Conversion", value: `${conversionRate}%`, icon: TrendingUp, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Hired", value: applications.filter((a: any) => a.status === 'hired').length.toString(), icon: BarChart3, color: "text-blue-400", bg: "bg-blue-500/10" },
        ].map((kpi, i) => (
          <div key={i} className="p-5 rounded-2xl border border-border bg-background">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted font-black mb-1">{kpi.label}</p>
                <h3 className="text-2xl font-black font-mono text-foreground">{kpi.value}</h3>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.bg} ${kpi.color}`}>
                <kpi.icon className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Daily applications chart */}
        <div className="p-6 rounded-2xl border border-border bg-background">
          <h2 className="text-sm font-black uppercase tracking-widest text-muted mb-5">Daily Applications (14d)</h2>
          <div className="h-[200px]">
            {applicationTrend.some((d: any) => d.applications > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={applicationTrend} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gJobApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 9 }} dy={6} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 9 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '10px', fontSize: '11px' }} />
                  <Area type="monotone" dataKey="applications" stroke="#8b5cf6" strokeWidth={2} fill="url(#gJobApps)" activeDot={{ r: 4 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted font-mono text-xs uppercase">No applications in last 14 days</div>
            )}
          </div>
        </div>

        {/* Funnel */}
        <JobFunnelChart funnel={funnel} />
      </div>

      {/* Recent applications */}
      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Recent Applications</h2>
        </div>
        {applications.length === 0 ? (
          <div className="py-12 text-center text-muted font-mono text-xs uppercase">No applications yet</div>
        ) : (
          <div className="divide-y divide-border">
            {(applications as any[]).slice(0, 10).map((app: any) => (
              <div key={app.id} className="px-6 py-4 flex items-center justify-between hover:bg-surface transition-colors">
                <div>
                  <p className="font-semibold text-foreground text-sm">
                    {app.candidates?.first_name} {app.candidates?.last_name}
                  </p>
                  <p className="text-xs text-muted mt-0.5">{new Date(app.created_at).toLocaleDateString()}</p>
                </div>
                <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                  app.status === 'hired' ? 'bg-emerald-500/10 text-emerald-500' :
                  app.status === 'interviewing' ? 'bg-blue-500/10 text-blue-400' :
                  app.status === 'reviewing' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-zinc-500/10 text-zinc-400'
                }`}>
                  {app.status || 'pending'}
                </span>
              </div>
            ))}
          </div>
        )}
        {applications.length > 0 && (
          <div className="px-6 py-3 border-t border-border">
            <Link href={`/employer/jobs/${jobId}/applications`} className="text-xs font-semibold text-primary hover:underline">
              View all {applications.length} applications →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
