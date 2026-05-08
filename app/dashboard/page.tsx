import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  FileText, Send, Briefcase, Clock,
  TrendingUp, Star, Flame, ArrowRight, Search,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Dashboard — UpnAbove",
  description: "Your UpnAbove candidate dashboard.",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

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
    { label: "Applications",  value: applicationCount, icon: Send,      color: "text-violet-400",  bg: "bg-violet-500/10",  border: "border-violet-500/20" },
    { label: "Interviews",    value: 0,                icon: Clock,      color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20"  },
    { label: "Saved Jobs",    value: 0,                icon: Star,       color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20"},
    { label: "Profile Views", value: 0,                icon: TrendingUp, color: "text-sky-400",     bg: "bg-sky-500/10",     border: "border-sky-500/20"    },
  ];

  const actions = [
    {
      href: "/dashboard/cvs",
      icon: FileText,
      title: "CV Manager",
      desc: "Upload, manage, and AI-optimise your resumes.",
      color: "text-violet-400",
      bg: "bg-violet-500/10",
      border: "border-violet-500/20",
      hoverBorder: "hover:border-violet-500/50",
      hoverGlow: "hover:shadow-[0_0_24px_-6px_rgba(124,58,237,0.3)]",
    },
    {
      href: "/dashboard/applications",
      icon: Briefcase,
      title: "Applications",
      desc: "Track the status of all your job applications.",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      hoverBorder: "hover:border-emerald-500/50",
      hoverGlow: "hover:shadow-[0_0_24px_-6px_rgba(16,185,129,0.25)]",
    },
    {
      href: "/forge",
      icon: Flame,
      title: "The Forge",
      desc: "Compete in live challenges and bounties anonymously.",
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      hoverBorder: "hover:border-rose-500/50",
      hoverGlow: "hover:shadow-[0_0_24px_-6px_rgba(244,63,94,0.25)]",
      badge: "Arena",
    },
  ];

  return (
    <div className="relative z-10 min-h-screen">
      <div className="mx-auto max-w-3xl px-6 pt-12 pb-16">

        {/* ── Header ───────────────────────────────────────────── */}
        <div className="mb-7">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-1">
            Candidate Portal
          </p>
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {firstName ? `Welcome back, ${firstName}` : "Dashboard"}
            </h1>
            <Link
              href="/jobs"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-500 transition-all shadow-lg shadow-violet-900/40 flex-shrink-0"
            >
              <Search className="w-3.5 h-3.5" />
              Browse Jobs
            </Link>
          </div>
          <p className="text-sm text-zinc-500 mt-1">
            Here&apos;s an overview of your job search activity.
          </p>
        </div>

        {/* ── Stats ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-7">
          {stats.map((s) => (
            <div
              key={s.label}
              className={`p-4 rounded-2xl border bg-zinc-900 ${s.border} flex items-center gap-3`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}>
                <s.icon className={`w-4 h-4 ${s.color}`} />
              </div>
              <div>
                <p className={`text-xl font-black tabular-nums leading-none ${s.value > 0 ? s.color : "text-white"}`}>
                  {s.value}
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5 leading-none">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Quick Actions ─────────────────────────────────────── */}
        <div className="mb-6">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500 mb-3">
            Quick Actions
          </p>
          <div className="grid sm:grid-cols-3 gap-3">
            {actions.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className={`group flex flex-col gap-3 p-5 rounded-2xl border bg-zinc-900 transition-all duration-200 ${a.border} ${a.hoverBorder} ${a.hoverGlow}`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${a.bg} ${a.border} border`}>
                    <a.icon className={`w-5 h-5 ${a.color}`} />
                  </div>
                  {a.badge && (
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${a.bg} ${a.color} border ${a.border}`}>
                      {a.badge}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-black text-white mb-1">{a.title}</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">{a.desc}</p>
                </div>
                <div className={`flex items-center gap-1 text-xs font-semibold ${a.color} opacity-0 group-hover:opacity-100 -translate-y-1 group-hover:translate-y-0 transition-all`}>
                  Open <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Empty state ───────────────────────────────────────── */}
        {applicationCount === 0 && (
          <div className="rounded-2xl border border-dashed border-zinc-800 p-8 text-center">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center mx-auto mb-3">
              <Send className="w-4 h-4 text-violet-400" />
            </div>
            <h3 className="text-sm font-black text-white mb-1">Start your job search</h3>
            <p className="text-xs text-zinc-500 mb-5 max-w-xs mx-auto leading-relaxed">
              Browse open positions, upload your CV, and apply in seconds.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                href="/jobs"
                className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-500 transition-all shadow-lg shadow-violet-900/40"
              >
                Browse Jobs
              </Link>
              <Link
                href="/dashboard/cvs"
                className="px-4 py-2 rounded-xl border border-zinc-700 text-xs font-bold text-zinc-300 hover:border-zinc-600 hover:text-white transition-all"
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
