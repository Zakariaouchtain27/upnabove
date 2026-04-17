"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, Circle, Rocket, Server, Clock, MonitorSmartphone, LayoutTemplate } from "lucide-react";
import Button from "@/components/ui/Button";

// Pre-Launch Master Verification Checklist
const categories = [
  {
    id: "db",
    title: "Database Architecture",
    icon: <Server className="w-5 h-5 text-emerald-500" />,
    items: [
      { id: "db_1", label: "All 6 core Forge tables are live directly in Supabase." },
      { id: "db_2", label: "Row Level Security (RLS) policies accurately enforced on all restricted views." },
      { id: "db_3", label: "Codename generation mechanism maps strictly to one-per-challenge uniqueness." },
      { id: "db_4", label: "DB Function Triggers (scoring aggregations) compiled without error." }
    ]
  },
  {
    id: "cron",
    title: "Cron Event Pulse",
    icon: <Clock className="w-5 h-5 text-amber-500" />,
    items: [
      { id: "cr_1", label: "CRON: /api/forge/cron/open-challenges fires every hour exactly." },
      { id: "cr_2", label: "CRON: /api/forge/cron/close-challenges securely truncates intakes every hour." },
      { id: "cr_3", label: "CRON: /api/forge/cron/reveal-winners executes every 2 hours (0 */2 * * *)." },
      { id: "cr_4", label: "CRON: /api/forge/cron/award-badges processes daily at midnight boundary." }
    ]
  },
  {
    id: "ui",
    title: "Vibe & Interactivity UI Checks",
    icon: <MonitorSmartphone className="w-5 h-5 text-primary" />,
    items: [
      { id: "ui_1", label: "Candidate 'Entry Flow' completely verified without context breaks." },
      { id: "ui_2", label: "Voting mechanisms persist correctly and reject double IPs natively." },
      { id: "ui_3", label: "Reveal animation triggers natively at end-of-challenge phase." },
      { id: "ui_4", label: "Employer onboarding and drop compilation paths successfully execute." },
      { id: "ui_5", label: "Mobile responsiveness specifically locked down at 375px viewport bounds." },
      { id: "ui_6", label: "Anonymous Spectator views render in Incognito without blocking load." }
    ]
  }
];

export default function LaunchChecklistPage() {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isClient, setIsClient] = useState(false);

  // Sync to localstorage to avoid losing checks on refresh
  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("forge_launch_checklist");
    if (saved) {
      setCheckedItems(JSON.parse(saved));
    }
  }, []);

  const toggleCheck = (id: string) => {
    if (!isClient) return;
    const next = { ...checkedItems, [id]: !checkedItems[id] };
    setCheckedItems(next);
    localStorage.setItem("forge_launch_checklist", JSON.stringify(next));
  };

  const totalItems = categories.reduce((acc, cat) => acc + cat.items.length, 0);
  const checkedCount = Object.values(checkedItems).filter(Boolean).length;
  const progressPercent = totalItems === 0 ? 0 : Math.round((checkedCount / totalItems) * 100);

  if (!isClient) return null;

  return (
    <div className="layout-wrapper min-h-screen pt-24 pb-32 bg-[#05050a] text-white relative w-full z-10 overflow-hidden">
       {/* Ambient glow matching The Forge */}
       <div className="absolute inset-0 z-0 bg-grid-pattern opacity-30 pointer-events-none" />
       <div className="glow-orb-primary top-[10%] left-[20%] opacity-20 pointer-events-none mix-blend-screen" />
       
       <div className="max-w-3xl mx-auto px-4 md:px-8 space-y-12 relative z-10">
          
          <div className="text-center space-y-6">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 text-sm font-bold tracking-widest uppercase mb-4 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                <Rocket className="w-4 h-4" /> Go Live Sequence
             </div>
             <h1 className="text-5xl font-black uppercase tracking-tight text-white drop-shadow-[0_0_20px_rgba(124,58,237,0.3)]">Pre-Flight Deck</h1>
             <p className="text-gray-400 font-mono text-sm max-w-xl mx-auto">
                Executing full system validation prior to deploying The Forge to production network. Track your audit below.
             </p>
          </div>

          {/* Progress Module */}
          <div className="bg-black/60 border border-white/10 p-8 rounded-3xl relative overflow-hidden backdrop-blur-sm shadow-inner">
             <div className="absolute top-0 left-0 h-1 bg-white/5 w-full">
                <div className="h-full bg-emerald-500 transition-all duration-700 ease-out" style={{ width: `${progressPercent}%` }} />
             </div>
             
             <div className="flex items-center justify-between mt-2">
                <div>
                   <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-1">Audit Progress</h3>
                   <div className="text-4xl font-black text-white">{progressPercent}%</div>
                </div>
                <div className="text-right">
                   <div className="text-emerald-500 font-mono text-sm font-bold">{checkedCount} / {totalItems}</div>
                   <div className="text-xs uppercase tracking-widest text-muted-foreground">Systems Checked</div>
                </div>
             </div>
          </div>

          {/* The Checklist */}
          <div className="space-y-8">
             {categories.map(cat => {
                const catTotal = cat.items.length;
                const catChecked = cat.items.filter(item => checkedItems[item.id]).length;
                const isComplete = catTotal === catChecked;

                return (
                  <div key={cat.id} className={`bg-black/40 border transition-colors duration-500 rounded-3xl p-6 backdrop-blur-sm shadow-inner ${isComplete ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-white/10'}`}>
                     <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                        <h2 className="flex items-center gap-3 text-lg font-bold uppercase tracking-widest text-white">
                           {cat.icon} {cat.title}
                        </h2>
                        {isComplete && <span className="bg-emerald-500/20 text-emerald-400 text-[10px] uppercase font-bold px-2 py-1 rounded">Secured</span>}
                     </div>
                     
                     <div className="space-y-4">
                        {cat.items.map(item => {
                           const isChecked = !!checkedItems[item.id];
                           return (
                             <button
                               key={item.id}
                               onClick={() => toggleCheck(item.id)}
                               className={`w-full text-left flex items-start gap-4 p-4 rounded-xl border transition-all ${isChecked ? 'bg-primary/5 border-primary/20' : 'bg-black/20 border-white/5 hover:border-white/20 hover:bg-black/40'}`}
                             >
                                <div className="mt-0.5 shrink-0 transition-transform">
                                   {isChecked ? (
                                     <CheckCircle2 className="w-5 h-5 text-primary" />
                                   ) : (
                                     <Circle className="w-5 h-5 text-muted-foreground" />
                                   )}
                                </div>
                                <div>
                                   <p className={`text-sm font-medium transition-colors ${isChecked ? 'text-white opacity-80 line-through' : 'text-gray-300'}`}>{item.label}</p>
                                </div>
                             </button>
                           );
                        })}
                     </div>
                  </div>
                );
             })}
          </div>

       </div>
    </div>
  );
}
