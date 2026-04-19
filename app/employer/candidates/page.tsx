"use client";

import React, { useState } from "react";
import { Search, Filter, Mail, CheckCircle2, XCircle, MoreHorizontal, User, ShieldCheck } from "lucide-react";
import { FORGE_BADGES } from "@/components/forge/BadgeDefinitions";

// Real candidates will come from job applications — empty until then
const CANDIDATES: any[] = [];

export default function EmployerCandidatesPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold text-foreground tracking-tight">Candidate Pipeline</h1>
           <p className="mt-1 text-muted text-sm">Review applications augmented with verified Forge Performance Badges.</p>
        </div>
        <div className="flex bg-surface-alt border border-border p-1 rounded-xl">
           {['All', 'Shortlisted', 'In Review', 'New'].map(f => (
             <button 
               key={f} 
               onClick={() => setActiveFilter(f)} 
               className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${activeFilter === f ? 'bg-background text-foreground shadow-sm' : 'text-muted hover:text-foreground'}`}
             >
               {f}
             </button>
           ))}
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-background border border-border p-3 rounded-2xl flex flex-wrap gap-3 justify-between items-center shadow-sm">
         <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input type="text" placeholder="Search by name, role, or badge..." className="w-full pl-10 pr-4 py-2.5 bg-surface-alt border border-border rounded-xl text-sm outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-muted" />
         </div>
         <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm font-semibold hover:bg-surface-alt transition-colors">
            <Filter className="w-4 h-4" /> Filters
         </button>
      </div>

      {/* Candidates List */}
      <div className="space-y-4">
         {CANDIDATES.filter(c => activeFilter === "All" || c.status === activeFilter).map(candidate => (
           <div key={candidate.id} className="bg-background border border-border rounded-2xl p-5 sm:p-6 hover:shadow-md transition-shadow group flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center">
              
              {/* Identity & Basic Role */}
              <div className="flex items-center gap-4 min-w-[300px]">
                 <img src={candidate.avatar} alt={candidate.name} className="w-14 h-14 rounded-full border border-border" />
                 <div>
                    <h3 className="font-bold text-foreground text-lg flex items-center gap-2">
                       {candidate.name}
                       {candidate.unlockedBadges.length > 0 && (
                          <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
                             <ShieldCheck className="w-3 h-3" /> Forge Verified
                          </div>
                       )}
                    </h3>
                    <div className="text-sm text-muted mt-0.5">{candidate.role}</div>
                 </div>
              </div>

              {/* Forge Badges Integration */}
              <div className="flex-1 w-full xl:w-auto p-4 rounded-xl bg-surface-alt/50 border border-border/50 flex flex-col gap-2">
                 <div className="text-xs font-semibold text-muted font-mono uppercase tracking-widest">Verifiable Forge History</div>
                 <div className="flex flex-wrap items-center gap-2">
                    {candidate.unlockedBadges.length === 0 ? (
                       <span className="text-sm text-muted italic">No Arena deployments recorded.</span>
                    ) : (
                       candidate.unlockedBadges.map(badgeId => {
                          const badgeDef = FORGE_BADGES.find(b => b.id === badgeId);
                          if (!badgeDef) return null;
                          return (
                             <div key={badgeId} className="relative group/badge">
                                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${badgeDef.bg} ${badgeDef.border} cursor-default`}>
                                   <badgeDef.icon className={`w-3.5 h-3.5 ${badgeDef.color}`} />
                                   <span className={`text-xs font-bold ${badgeDef.color}`}>{badgeDef.name}</span>
                                </div>
                                {/* Advanced Tooltip mapping directly from actual Master Badge config */}
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover/badge:opacity-100 transition-opacity bg-zinc-900 border border-zinc-700 text-white text-[10px] px-3 py-1.5 rounded-md z-50 pointer-events-none whitespace-nowrap shadow-xl">
                                   <span className="font-bold text-gray-400 block mb-0.5 uppercase tracking-widest text-[8px]">Achievement Unlocked</span>
                                   {badgeDef.desc}
                                </div>
                             </div>
                          )
                       })
                    )}
                 </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center gap-6 xl:min-w-[200px] justify-end w-full xl:w-auto">
                 <div className="flex flex-col items-end">
                    <span className="text-sm font-bold text-foreground">{candidate.match}% Match</span>
                    <span className="text-xs text-muted">{candidate.status} • {candidate.applied}</span>
                 </div>
                 <div className="flex items-center gap-2 border-l border-border pl-6">
                    <button className="p-2 rounded-lg hover:bg-surface-alt text-muted hover:text-foreground transition-colors"><Mail className="w-5 h-5" /></button>
                    <button className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-colors border border-emerald-500/20"><CheckCircle2 className="w-5 h-5" /></button>
                    <button className="p-2 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white transition-colors border border-rose-500/20"><XCircle className="w-5 h-5" /></button>
                    <button className="p-2 rounded-lg hover:bg-surface-alt text-muted hover:text-foreground transition-colors"><MoreHorizontal className="w-5 h-5" /></button>
                 </div>
              </div>

           </div>
         ))}
      </div>
    </div>
  );
}
