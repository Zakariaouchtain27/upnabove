import type { Metadata } from "next";
import Link from "next/link";
import {
  FileText, Send, Briefcase, Clock, TrendingUp,
  Star, Flame, ArrowRight, Search,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard — UpnAbove",
  description: "Your UpnAbove candidate dashboard.",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let applicationCount = 0;
  let firstName = "";

  if (user) {
    const [{ count }, { data: profile }] = await Promise.all([
      supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("candidate_id", user.id),
      supabase
        .from("candidates")
        .select("first_name")
        .eq("id", user.id)
        .single(),
    ]);
    if (count) applicationCount = count;
    if (profile?.first_name) firstName = profile.first_name;
  }

  const stats = [
    { label: "Applications",  value: applicationCount, icon: Send,       color: "text-violet-400",  bg: "bg-violet-500/10",  border: "border-violet-500/20" },
    { label: "Interviews",    value: 0,                icon: Clock,       color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20"  },
    { label: "Saved Jobs",    value: 0,                icon: Star,        color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20"},
    { label: "Profile Views", value: 0,                icon: TrendingUp,  color: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20"   },
  ];

  return (
    /* Solid backing so the animated canvas doesn't bleed through gaps */
    <div className="relative z-10 min-h-screen bg-background">
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 space-y-10">

      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-muted mb-1">
            Candidate Portal
          </p>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
            {firstName ? `Welcome back, ${firstName}` : "Dashboard"}
          </h1>
          <p className="text-sm text-muted mt-1.5">
            Here&apos;s an overview of your job search activity.
          </p>
        </div>
        <Link
          href="/jobs"
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/30 flex-shrink-0"
        >
          <Search className="w-4 h-4" />
          Browse Jobs
        </Link>
      </div>

      {/* ── Stats ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`relative p-5 rounded-2xl border bg-background flex flex-col gap-3 ${s.border}`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}>
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </div>
            <div>
              <p className={`text-3xl font-black tabular-nums ${s.value > 0 ? s.color : "text-foreground"}`}>
                {s.value}
              </p>
              <p className="text-xs text-muted font-medium mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick Actions ──────────────────────────────────────── */}
      <div>
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-muted mb-4">
          Quick Actions
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">

          {/* CV Manager */}
          <Link
            href="/dashboard/cvs"
            className="group flex flex-col gap-4 p-6 rounded-2xl border border-border bg-background hover:border-violet-500/40 hover:shadow-[0_0_30px_-8px_rgba(124,58,237,0.25)] transition-all duration-300"
          >
            <div className="w-11 h-11 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
              <FileText className="w-5 h-5 text-violet-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-black text-foreground mb-1">CV Manager</h3>
              <p className="text-xs text-muted leading-relaxed">
                Upload, manage, and AI-optimise your resumes.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">
              Open <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Application History */}
          <Link
            href="/dashboard/applications"
            className="group flex flex-col gap-4 p-6 rounded-2xl border border-border bg-background hover:border-emerald-500/40 hover:shadow-[0_0_30px_-8px_rgba(16,185,129,0.2)] transition-all duration-300"
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
              <Briefcase className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-black text-foreground mb-1">Applications</h3>
              <p className="text-xs text-muted leading-relaxed">
                Track the status of all your job applications.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
              {applicationCount > 0 ? `${applicationCount} active` : "View all"} <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Forge Hub */}
          <Link
            href="/forge"
            className="group flex flex-col gap-4 p-6 rounded-2xl border border-rose-500/20 bg-rose-500/5 hover:border-rose-500/50 hover:shadow-[0_0_30px_-8px_rgba(244,63,94,0.2)] transition-all duration-300"
          >
            <div className="w-11 h-11 rounded-xl bg-rose-500/15 border border-rose-500/25 flex items-center justify-center group-hover:bg-rose-500/25 transition-colors">
              <Flame className="w-5 h-5 text-rose-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-black text-foreground">The Forge</h3>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-rose-500/15 text-rose-400 border border-rose-500/20">
                  Arena
                </span>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                Compete in live challenges and bounties anonymously.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity">
              Enter arena <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </div>

      {/* ── Getting Started (shown when no applications yet) ───── */}
      {applicationCount === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-background/50 p-8 text-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Send className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-base font-black text-foreground mb-1">Start your job search</h3>
          <p className="text-sm text-muted mb-5 max-w-sm mx-auto">
            Browse open positions, upload your CV, and apply in seconds.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/jobs"
              className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/30"
            >
              Browse Jobs
            </Link>
            <Link
              href="/dashboard/cvs"
              className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all"
            >
              Upload CV
            </Link>
          </div>
        </div>
      )}

    </div>
    </div>
  );
}
