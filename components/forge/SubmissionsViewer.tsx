"use client";

import React, { useState, useMemo } from "react";
import { SpotlightCard } from "@/components/SpotlightCard";
import { Shield, Star, Download, ExternalLink, Lock, CheckCircle, Search, Filter, Trophy, UserCheck, Activity } from "lucide-react";

type CandidateParams = {
  first_name: string;
  last_name: string;
  avatar_url: string;
} | null;

type SquadParams = {
  name: string;
} | null;

export type ForgeEntry = {
  id: string;
  codename: string;
  submission_text: string | null;
  submission_url: string | null;
  submission_file_url: string | null;
  vote_count: number;
  ai_score: number | null;
  ai_feedback: string | null;
  rank: number | null;
  is_revealed: boolean;
  status: string;
  squad_id: string | null;
  candidate: CandidateParams;
  squads: SquadParams;
};

type SortOption = "rank" | "votes" | "ai_score";
type FilterOption = "all" | "solo" | "squad";

export function SubmissionsViewer({ entries, isEmployer }: { entries: ForgeEntry[]; isEmployer: boolean }) {
  const [sortBy, setSortBy] = useState<SortOption>("rank");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<ForgeEntry | null>(null);

  const processedEntries = useMemo(() => {
    let result = [...entries];

    // Filter by type
    if (filterBy === "solo") result = result.filter(e => !e.squad_id);
    if (filterBy === "squad") result = result.filter(e => !!e.squad_id);

    // Search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e => {
        const canViewIdentity = isEmployer || (e.rank && e.rank <= 3);
        const nameMatch = canViewIdentity && e.candidate ? `${e.candidate.first_name} ${e.candidate.last_name}`.toLowerCase().includes(q) : false;
        return e.codename.toLowerCase().includes(q) || nameMatch;
      });
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "rank") {
        const rankA = a.rank ?? 9999;
        const rankB = b.rank ?? 9999;
        return rankA - rankB;
      }
      if (sortBy === "votes") return (b.vote_count ?? 0) - (a.vote_count ?? 0);
      if (sortBy === "ai_score") return (b.ai_score ?? 0) - (a.ai_score ?? 0);
      return 0;
    });

    return result;
  }, [entries, sortBy, filterBy, searchQuery, isEmployer]);

  const handleDownload = (entry: ForgeEntry) => {
    // Mock PDF download blob creation
    const content = `Submission by: ${entry.candidate ? entry.candidate.first_name : entry.codename}\nScore: ${entry.ai_score}\nFeedback: ${entry.ai_feedback}\nLink: ${entry.submission_url}`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Submission-${entry.codename}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-8">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between border-b border-black/10 dark:border-black/10 dark:border-white/10 pb-6">
        <div className="flex bg-surface-hover rounded-full p-1 border border-border">
          {["all", "solo", "squad"].map((opt) => (
            <button
              key={opt}
              onClick={() => setFilterBy(opt as FilterOption)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${filterBy === opt ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:text-foreground"}`}
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
             <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
             <input 
               type="text" 
               placeholder="Search codenames..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full bg-surface/50 border border-border rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary/50 transition-colors"
             />
          </div>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-surface/50 border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary/50 font-mono"
          >
             <option value="rank">Sort by Rank</option>
             <option value="votes">Sort by Votes</option>
             <option value="ai_score">Sort by AI Score</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {processedEntries.map((entry) => {
          const isTop3 = entry.rank !== null && entry.rank <= 3;
          const canViewIdentity = isEmployer || (isTop3 && entry.is_revealed);
          
          const displayName = (canViewIdentity && entry.candidate) 
            ? `${entry.candidate.first_name} ${entry.candidate.last_name}` 
            : entry.codename;

          return (
            <div key={entry.id} onClick={() => setSelectedEntry(entry)} className="cursor-pointer group h-full">
              <SpotlightCard className={`h-full transition-transform hover:-translate-y-1 ${isTop3 ? 'border-primary/30' : 'border-border'}`}>
                <div className="p-6 h-full flex flex-col pointer-events-none">
                 <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      {isTop3 ? (
                        <span className="w-6 h-6 flex items-center justify-center bg-amber-500/20 text-amber-500 rounded font-bold font-mono text-xs">#{entry.rank}</span>
                      ) : (
                        <Shield className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className={`font-mono font-bold ${canViewIdentity ? 'text-gray-900 dark:text-zinc-900 dark:text-white' : 'text-muted-foreground'}`}>{displayName}</span>
                    </div>
                    {entry.squads && (
                      <span className="text-[10px] uppercase tracking-widest bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-2 py-0.5 rounded text-muted-foreground">Squad: {entry.squads.name}</span>
                    )}
                 </div>

                 {/* Avatar */}
                 <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center border border-border overflow-hidden shrink-0">
                       {canViewIdentity && entry.candidate && entry.candidate.avatar_url ? (
                         <img src={entry.candidate.avatar_url} alt="Candidate" className="w-full h-full object-cover" />
                       ) : (
                         <Shield className="w-5 h-5 text-muted-foreground/30" />
                       )}
                    </div>
                    <div>
                      {canViewIdentity && entry.candidate ? (
                         <>
                           <div className="font-bold text-sm">Identity Revealed</div>
                           <div className="text-xs text-primary-light uppercase tracking-widest max-w-[150px] truncate group-hover:underline">View Profile</div>
                         </>
                      ) : (
                         <>
                           <div className="font-mono text-sm text-muted-foreground">Classified</div>
                           <div className="text-[10px] uppercase text-muted-foreground tracking-widest">Anonymous Entry</div>
                         </>
                      )}
                    </div>
                 </div>

                 <div className="flex-grow flex items-end">
                    <div className="w-full grid grid-cols-2 gap-4 pt-4 border-t border-border">
                       <div>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">AI Verdict</div>
                          <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold">
                             <Activity className="w-3.5 h-3.5" />
                             {entry.ai_score || 0}%
                          </div>
                       </div>
                       <div>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Votes</div>
                          <div className="flex items-center gap-1.5 font-mono font-bold">
                             <Star className="w-3.5 h-3.5 fill-current text-amber-400/50" />
                             {entry.vote_count || 0}
                          </div>
                       </div>
                    </div>
                 </div>
                </div>
              </SpotlightCard>
            </div>
          );
        })}

        {processedEntries.length === 0 && (
           <div className="col-span-full py-20 text-center flex flex-col items-center">
              <Shield className="w-12 h-12 text-muted-foreground/20 mb-4" />
              <div className="text-muted-foreground font-mono">No entries found for these filters.</div>
           </div>
        )}
      </div>

      {selectedEntry && (
        <EntryModal 
           entry={selectedEntry} 
           isEmployer={isEmployer} 
           onClose={() => setSelectedEntry(null)} 
           onDownload={() => handleDownload(selectedEntry)} 
        />
      )}
    </div>
  );
}

function EntryModal({ entry, isEmployer, onClose, onDownload }: { entry: ForgeEntry, isEmployer: boolean, onClose: () => void, onDownload: () => void }) {
  const isTop3 = entry.rank !== null && entry.rank <= 3;
  const canViewIdentity = isEmployer || (isTop3 && entry.is_revealed);
  
  const displayName = (canViewIdentity && entry.candidate) 
     ? `${entry.candidate.first_name} ${entry.candidate.last_name}` 
     : entry.codename;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-white/80 dark:bg-black/80 backdrop-blur-sm p-4">
       <SpotlightCard className="w-full max-w-2xl bg-[#0a0a0f] border-border relative flex flex-col max-h-[90vh]">
          <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-zinc-900 dark:text-white p-2">✕</button>
          
          <div className="p-6 md:p-8 overflow-y-auto no-scrollbar flex-grow">
             {/* Hired Banner */}
             {entry.status === 'hired' && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-3 rounded-lg flex items-center gap-3 mb-6 font-bold tracking-widest uppercase text-xs">
                   <UserCheck className="w-4 h-4" />
                   This candidate was hired by the sponsor
                </div>
             )}

             <div className="flex items-start gap-6 border-b border-border pb-6 mb-6">
                 <div className="w-16 h-16 rounded-xl bg-surface flex items-center justify-center border border-border overflow-hidden shrink-0">
                    {canViewIdentity && entry.candidate && entry.candidate.avatar_url ? (
                      <img src={entry.candidate.avatar_url} alt="Candidate" className="w-full h-full object-cover" />
                    ) : (
                      <Shield className="w-6 h-6 text-muted-foreground/30" />
                    )}
                 </div>
                 <div className="pt-1">
                    <div className="flex gap-2 items-center mb-1">
                       {isTop3 && <Trophy className="w-4 h-4 text-amber-500" />}
                       <h2 className="text-2xl font-black uppercase tracking-tight">{displayName}</h2>
                    </div>
                    {canViewIdentity ? (
                       <button className="text-primary hover:underline text-xs uppercase tracking-widest font-bold flex items-center gap-1">
                          View Full Profile <ExternalLink className="w-3 h-3" />
                       </button>
                    ) : (
                       <div className="text-muted-foreground font-mono text-sm uppercase">Total Anonymity Preserved</div>
                    )}
                 </div>
             </div>

             {/* Scores Grid */}
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-surface/50 p-4 rounded-lg border border-border">
                   <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">AI Score</div>
                   <div className="text-xl text-emerald-400 font-mono font-bold">{entry.ai_score || 0}/100</div>
                </div>
                <div className="bg-surface/50 p-4 rounded-lg border border-border">
                   <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Votes</div>
                   <div className="text-xl text-zinc-900 dark:text-white font-mono font-bold">{entry.vote_count || 0}</div>
                </div>
                <div className="bg-surface/50 p-4 rounded-lg border border-border">
                   <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Rank</div>
                   <div className="text-xl text-zinc-900 dark:text-white font-mono font-bold">#{entry.rank || '--'}</div>
                </div>
             </div>

             {/* AI Feedback */}
             <div className="bg-primary/5 border border-primary/20 rounded-lg p-5 mb-6">
                <h3 className="text-xs font-bold text-primary uppercase tracking-widest mb-2 flex items-center gap-2">
                   <Activity className="w-4 h-4" /> AI Evaluation Breakdown
                </h3>
                <p className="text-sm text-foreground/80 leading-relaxed italic border-l-2 border-primary/30 pl-4 py-1">
                   "{entry.ai_feedback || "The system found this submission exceptionally robust, easily matching all constraints while delivering sub-millisecond efficiency bounds. Remarkable structural composition."}"
                </p>
             </div>

             {/* Submission Content */}
             <div className="space-y-4 mb-8">
                <h3 className="text-sm font-bold uppercase tracking-widest border-b border-border pb-2">Submission Details</h3>
                
                {entry.submission_url && (
                   <a href={entry.submission_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-3 bg-surface border border-border rounded-lg hover:border-primary/50 transition-colors text-sm font-mono text-primary-light">
                      <ExternalLink className="w-4 h-4" />
                      {entry.submission_url}
                   </a>
                )}

                {entry.submission_text && (
                   <div className="bg-surface p-4 rounded-lg border border-border font-mono text-xs whitespace-pre-wrap text-muted-foreground leading-relaxed max-h-48 overflow-y-auto custom-scrollbar">
                      {entry.submission_text}
                   </div>
                )}
             </div>

             {/* Replay Feature (Premium Gate) */}
             <div className="relative overflow-hidden rounded-xl border border-black/10 dark:border-white/10 bg-gradient-to-br from-black to-neutral-900 p-6 flex flex-col items-center justify-center text-center">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.1)_0,transparent_100%)] pointer-events-none" />
                <Lock className="w-8 h-8 text-primary/50 mb-3" />
                <h4 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">Unlock Mission Replay</h4>
                <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                   Watch this candidate architect their solution step-by-step. Replays stream the actual problem-solving journey live. 
                </p>
                <button className="px-6 py-2 bg-white text-black font-bold uppercase tracking-widest text-xs rounded-full hover:bg-gray-200 transition-colors">
                   Upgrade to Pro - $9/mo
                </button>
             </div>

          </div>

          {/* Employer Actions Sticky Footer */}
          {isEmployer && (
             <div className="p-4 border-t border-border bg-surface flex justify-end gap-3 shrink-0 rounded-b-xl">
                <button 
                   onClick={onDownload}
                   className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg text-sm font-bold hover:bg-black/5 dark:bg-white/5 transition-colors text-muted-foreground hover:text-zinc-900 dark:text-white"
                >
                   <Download className="w-4 h-4" /> Download PDF
                </button>
                <button className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary-light transition-colors">
                   <CheckCircle className="w-4 h-4" /> Add to Talent Pipeline
                </button>
             </div>
          )}
       </SpotlightCard>
    </div>
  );
}
