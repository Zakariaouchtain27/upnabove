"use client";

import React from "react";

interface FunnelStage { stage: string; count: number; color: string; }

export default function JobFunnelChart({ funnel }: { funnel: FunnelStage[] }) {
  const max = Math.max(...funnel.map(f => f.count), 1);

  return (
    <div className="p-6 rounded-2xl border border-border bg-background">
      <h2 className="text-sm font-black uppercase tracking-widest text-muted mb-5">Hiring Funnel</h2>
      <div className="space-y-4">
        {funnel.map((stage, i) => {
          const pct = Math.round((stage.count / max) * 100);
          const dropOff = i > 0 && funnel[i - 1].count > 0
            ? Math.round((1 - stage.count / funnel[i - 1].count) * 100)
            : null;

          return (
            <div key={stage.stage}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted">{stage.stage}</span>
                  {dropOff !== null && dropOff > 0 && (
                    <span className="text-[9px] text-rose-400 font-mono">-{dropOff}%</span>
                  )}
                </div>
                <span className="text-sm font-black font-mono text-foreground">{stage.count.toLocaleString()}</span>
              </div>
              <div className="h-3 rounded-full bg-border overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, backgroundColor: stage.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
