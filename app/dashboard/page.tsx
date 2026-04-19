import type { Metadata } from "next";
import Link from "next/link";
import { FileText, Send, Briefcase, Clock, TrendingUp, Star, Flame } from "lucide-react";

export const metadata: Metadata = {
  title: "Dashboard — UpnAbove",
  description: "Your UpnAbove candidate dashboard.",
};

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-muted">
          Welcome back! Here&apos;s an overview of your job search.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Applications", value: "0", icon: <Send className="w-5 h-5" />, color: "text-primary" },
          { label: "Interviews", value: "0", icon: <Clock className="w-5 h-5" />, color: "text-amber-500" },
          { label: "Saved Jobs", value: "0", icon: <Star className="w-5 h-5" />, color: "text-emerald-500" },
          { label: "Profile Views", value: "0", icon: <TrendingUp className="w-5 h-5" />, color: "text-blue-500" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-5 rounded-2xl border border-border bg-background"
          >
            <div className={`w-10 h-10 rounded-xl bg-surface-alt flex items-center justify-center mb-2 ${stat.color}`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          href="/dashboard/cvs"
          className="group p-6 rounded-2xl border border-border bg-background
            hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors dark:bg-primary-900/30">
            <FileText className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            CV Manager
          </h3>
          <p className="text-sm text-muted mt-1">
            Upload, manage, and optimize your resumes.
          </p>
        </Link>
        <Link
          href="/dashboard/applications"
          className="group p-6 rounded-2xl border border-border bg-background
            hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors dark:bg-primary-900/30">
            <Briefcase className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            Application History
          </h3>
          <p className="text-sm text-muted mt-1">
            Track the status of all your job applications.
          </p>
        </Link>
        <Link
          href="/forge"
          className="group p-6 rounded-2xl border border-rose-500/20 bg-rose-500/5
            hover:border-rose-500/50 hover:shadow-[0_0_30px_rgba(244,63,94,0.1)] transition-all"
        >
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center mb-4 group-hover:bg-rose-500 group-hover:text-white transition-colors">
            <Flame className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            My Forge Hub
          </h3>
          <p className="text-sm text-muted mt-1">
            Enter live arena Bounties and check your anonymous leaderboard status.
          </p>
        </Link>
      </div>
    </div>
  );
}
