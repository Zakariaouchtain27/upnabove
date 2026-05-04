"use client";

import React, { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell,
} from 'recharts';
import { Eye, Users, Percent, Activity, TrendingUp, Clock } from 'lucide-react';

interface FunnelStage { stage: string; count: number; color: string; }
interface TrendPoint { date: string; applications: number; }

interface AnalyticsData {
  totals: {
    views: number;
    applications: number;
    conversionRate: string;
    hireRate: string;
    avgDaysToHire: number | null;
  };
  trend: TrendPoint[];
  funnel: FunnelStage[];
}

export default function AnalyticsOverview({
  data,
  isLoading,
}: {
  data?: AnalyticsData | null;
  isLoading: boolean;
}) {
  const kpis = useMemo(() => {
    if (!data) return [
      { label: "Total Views", value: "—", icon: Eye, color: "text-violet-500", bg: "bg-violet-500/10" },
      { label: "Applications", value: "—", icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/10" },
      { label: "Conversion Rate", value: "—", icon: Percent, color: "text-amber-500", bg: "bg-amber-500/10" },
      { label: "Time to Hire", value: "—", icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
    ];
    return [
      { label: "Total Views", value: data.totals.views.toLocaleString(), icon: Eye, color: "text-violet-500", bg: "bg-violet-500/10" },
      { label: "Applications", value: data.totals.applications.toLocaleString(), icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/10" },
      { label: "Conversion Rate", value: `${data.totals.conversionRate}%`, icon: Percent, color: "text-amber-500", bg: "bg-amber-500/10" },
      {
        label: "Avg. Days to Hire",
        value: data.totals.avgDaysToHire !== null ? `${data.totals.avgDaysToHire}d` : "—",
        icon: Clock,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
      },
    ];
  }, [data]);

  const maxFunnelCount = data?.funnel ? Math.max(...data.funnel.map(f => f.count), 1) : 1;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="relative p-6 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-300 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-black mb-1">{kpi.label}</p>
                {isLoading ? (
                  <div className="h-8 w-24 bg-white/10 rounded animate-pulse mt-1" />
                ) : (
                  <h3 className="text-3xl font-black font-mono text-white tracking-tighter">{kpi.value}</h3>
                )}
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${kpi.bg} ${kpi.color}`}>
                <kpi.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/10 to-transparent opacity-50 rounded-bl-3xl" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applications Trend */}
        <div className="lg:col-span-2 p-6 md:p-8 rounded-[2.5rem] border border-white/5 bg-black/40 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
          <div className="flex items-center gap-3 mb-8">
            <Activity className="w-5 h-5 text-primary" />
            <div>
              <h2 className="text-lg font-black uppercase tracking-[0.1em] text-white">Applications Over Time</h2>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-0.5 font-mono">Last 14 days</p>
            </div>
          </div>
          <div className="h-[220px] w-full">
            {isLoading ? (
              <div className="w-full h-full bg-white/5 rounded-xl animate-pulse" />
            ) : data?.trend && data.trend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.trend} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="applications" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" activeDot={{ r: 6, fill: '#10b981', stroke: '#000', strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500 font-mono text-xs uppercase">No data yet</div>
            )}
          </div>
        </div>

        {/* Hiring Funnel */}
        <div className="p-6 rounded-[2rem] border border-white/5 bg-black/40 backdrop-blur-2xl shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-lg font-black uppercase tracking-[0.1em] text-white">Hiring Funnel</h2>
              <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-0.5 font-mono">All postings</p>
            </div>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => <div key={i} className="h-8 bg-white/5 rounded-lg animate-pulse" />)}
            </div>
          ) : data?.funnel ? (
            <div className="space-y-3">
              {data.funnel.map((stage) => (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{stage.stage}</span>
                    <span className="text-sm font-black font-mono text-white">{stage.count.toLocaleString()}</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(stage.count / maxFunnelCount) * 100}%`,
                        backgroundColor: stage.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-zinc-500 font-mono text-xs uppercase text-center py-8">No data yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
