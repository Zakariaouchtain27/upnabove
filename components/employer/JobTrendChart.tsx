"use client";

import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";

interface TrendPoint { date: string; applications: number; }

export default function JobTrendChart({ data }: { data: TrendPoint[] }) {
  const hasData = data.some(d => d.applications > 0);

  if (!hasData) {
    return (
      <div className="w-full h-full flex items-center justify-center text-muted font-mono text-xs uppercase">
        No applications in last 14 days
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
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
  );
}
