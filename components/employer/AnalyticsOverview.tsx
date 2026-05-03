"use client";

import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Eye, Users, Percent, Activity } from 'lucide-react';

interface AnalyticsData {
  totals: {
    views: number;
    applications: number;
    conversionRate: string;
  };
  trend: Array<{
    date: string;
    views: number;
    applications: number;
  }>;
}

export default function AnalyticsOverview({ data, isLoading }: { data?: AnalyticsData | null, isLoading: boolean }) {
  const kpis = useMemo(() => {
    if (!data) return [
      { label: "Total Views", value: "—", icon: Eye, color: "text-violet-500", bg: "bg-violet-500/10" },
      { label: "Applications", value: "—", icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/10" },
      { label: "Conversion Rate", value: "—", icon: Percent, color: "text-amber-500", bg: "bg-amber-500/10" },
    ];
    
    return [
      { label: "Total Views", value: data.totals.views.toLocaleString(), icon: Eye, color: "text-violet-500", bg: "bg-violet-500/10" },
      { label: "Applications", value: data.totals.applications.toLocaleString(), icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/10" },
      { label: "Conversion Rate", value: `${data.totals.conversionRate}%`, icon: Percent, color: "text-amber-500", bg: "bg-amber-500/10" },
    ];
  }, [data]);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            {/* Aesthetic accent */}
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/10 to-transparent opacity-50 rounded-bl-3xl" />
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="p-6 md:p-8 rounded-[2.5rem] border border-white/5 bg-black/40 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xl font-black uppercase tracking-[0.1em] text-white flex items-center gap-3">
              <Activity className="w-5 h-5 text-primary" /> Traffic & Conversions
            </h2>
            <p className="text-[10px] uppercase tracking-widest text-zinc-500 mt-1 font-mono">Last 14 Days Activity</p>
          </div>
        </div>

        <div className="h-[300px] w-full mt-4">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-48 bg-white/5 rounded-xl w-full"></div>
                </div>
              </div>
            </div>
          ) : data?.trend && data.trend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.trend} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#71717a', fontSize: 10, fontFamily: 'monospace' }} 
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', borderRadius: '12px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="views" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorViews)" 
                  activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#000', strokeWidth: 2 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="applications" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorApps)" 
                  activeDot={{ r: 6, fill: '#10b981', stroke: '#000', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-500 font-mono text-xs uppercase">
              No data available for this period.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
