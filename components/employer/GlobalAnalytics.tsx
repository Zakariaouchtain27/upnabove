"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from "recharts";
import { Eye, Users, Percent, Clock, TrendingUp, Activity, BarChart3, ArrowUpRight } from "lucide-react";

interface FunnelStage { stage: string; count: number; color: string; }
interface TrendPoint { date: string; applications: number; }
interface JobRow {
  id: string; title: string; job_type: string; views: number;
  applications: number; conversionRate: number; is_active: boolean; created_at: string;
}

interface GlobalAnalyticsProps {
  analytics: {
    totals: { views: number; applications: number; conversionRate: string; hireRate: string; avgDaysToHire: number | null };
    trend: TrendPoint[];
    funnel: FunnelStage[];
  } | null;
  jobPerformance: JobRow[];
}

const PERIODS = [
  { label: '14d', days: 14 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
];

export default function GlobalAnalytics({ analytics, jobPerformance }: GlobalAnalyticsProps) {
  const [activePeriod] = useState(1); // default 30d (index 1)

  const t = analytics?.totals;
  const kpis = [
    { label: "Total Views", value: t ? t.views.toLocaleString() : "—", icon: Eye, color: "text-violet-400", bg: "bg-violet-500/10" },
    { label: "Applications", value: t ? t.applications.toLocaleString() : "—", icon: Users, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Conversion Rate", value: t ? `${t.conversionRate}%` : "—", icon: Percent, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Avg. Days to Hire", value: t?.avgDaysToHire !== null && t?.avgDaysToHire !== undefined ? `${t.avgDaysToHire}d` : "—", icon: Clock, color: "text-blue-400", bg: "bg-blue-500/10" },
  ];

  const maxFunnel = analytics?.funnel ? Math.max(...analytics.funnel.map(f => f.count), 1) : 1;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight text-foreground flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-primary" /> Analytics Hub
          </h1>
          <p className="text-sm text-muted mt-1">Performance across all job postings and Forge challenges.</p>
        </div>
        <div className="flex items-center gap-1 bg-surface border border-border rounded-xl p-1">
          {PERIODS.map((p, i) => (
            <button key={p.label} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${i === activePeriod ? 'bg-primary text-white shadow' : 'text-muted hover:text-foreground'}`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="p-6 rounded-2xl border border-border bg-background hover:bg-surface transition-all group">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted font-black mb-1">{kpi.label}</p>
                <h3 className="text-3xl font-black font-mono text-foreground">{kpi.value}</h3>
              </div>
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${kpi.bg} ${kpi.color}`}>
                <kpi.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applications trend */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-border bg-background">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="text-base font-black uppercase tracking-widest text-foreground">Applications Over Time</h2>
          </div>
          <div className="h-[220px]">
            {analytics?.trend && analytics.trend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.trend} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10 }} dy={8} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '10px', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="applications" stroke="#10b981" strokeWidth={2.5} fill="url(#gApps)" activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted font-mono text-xs uppercase">No data yet</div>
            )}
          </div>
        </div>

        {/* Hiring funnel */}
        <div className="p-6 rounded-2xl border border-border bg-background">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-black uppercase tracking-widest text-foreground">Hiring Funnel</h2>
          </div>
          <div className="space-y-3">
            {(analytics?.funnel || []).map(stage => (
              <div key={stage.stage}>
                <div className="flex justify-between mb-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-muted">{stage.stage}</span>
                  <span className="text-sm font-black font-mono text-foreground">{stage.count.toLocaleString()}</span>
                </div>
                <div className="h-2 rounded-full bg-border overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(stage.count / maxFunnel) * 100}%`, backgroundColor: stage.color, transition: 'width 0.7s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Job Performance Table */}
      <div className="rounded-2xl border border-border bg-background overflow-hidden">
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <h2 className="text-base font-black uppercase tracking-widest text-foreground">Job Performance</h2>
          <span className="text-xs text-muted font-mono">Ranked by conversion rate</span>
        </div>
        {jobPerformance.length === 0 ? (
          <div className="py-16 text-center text-muted font-mono text-sm">No job postings yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Position', 'Status', 'Views', 'Applications', 'Conversion', 'Actions'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jobPerformance.map((job, i) => (
                  <tr key={job.id} className="border-b border-border last:border-0 hover:bg-surface transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-muted font-mono w-5">#{i + 1}</span>
                        <span className="font-semibold text-foreground">{job.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${job.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-500/10 text-zinc-400'}`}>
                        {job.is_active ? 'Active' : 'Closed'}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-foreground">{job.views.toLocaleString()}</td>
                    <td className="px-5 py-4 font-mono text-foreground">{job.applications}</td>
                    <td className="px-5 py-4">
                      <span className={`font-black font-mono text-sm ${job.conversionRate >= 5 ? 'text-emerald-500' : job.conversionRate >= 2 ? 'text-amber-500' : 'text-zinc-400'}`}>
                        {job.conversionRate}%
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <Link href={`/employer/jobs/${job.id}/analytics`} className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline">
                        Drill down <ArrowUpRight className="w-3 h-3" />
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
