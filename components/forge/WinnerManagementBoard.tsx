"use client";

import { useState } from "react";
import { HireFlowModal } from "./HireFlowModal";
import { HiredAnnouncementCard } from "./HiredAnnouncementCard";
import { User, MessageSquare, Briefcase, CheckCircle2 } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface WinnerManagementBoardProps {
  entries: any[];
  challengeId: string;
  companyName: string;
}

export function WinnerManagementBoard({ entries, challengeId, companyName }: WinnerManagementBoardProps) {
  const [activeInviteEntry, setActiveInviteEntry] = useState<any | null>(null);
  const [localEntries, setLocalEntries] = useState(entries);

  // We only show entries that are revealed and onwards to avoid spoilers prior to employer hitting "trigger reveal"
  const revealedEntries = localEntries.filter(e => 
    e.status === 'revealed' || e.status === 'contacted' || e.status === 'interviewed' || e.status === 'hired'
  );

  const updateEntryStatusLocal = (entryId: string, status: string) => {
    setLocalEntries(prev => prev.map(e => e.id === entryId ? { ...e, status } : e));
  };

  const markAsHired = async (entryId: string) => {
    if (!confirm("Are you sure? This officially marks the candidate as hired and awards them a public Forge badge.")) return;
    
    try {
      const res = await fetch("/api/forge/hire/mark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ entryId, challengeId }),
      });
      if (!res.ok) throw new Error("Failed to mark as hired");
      
      updateEntryStatusLocal(entryId, "hired");
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  if (revealedEntries.length === 0) {
    return (
      <div className="p-8 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center">
         <Briefcase className="w-12 h-12 text-zinc-600 mb-4" />
         <h3 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">Candidates Hidden</h3>
         <p className="text-zinc-600 dark:text-zinc-400 mt-2">Trigger the Live Reveal to unlock candidate identities and begin the hiring process.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {revealedEntries.map(entry => {
            const isHired = entry.status === 'hired';

            return isHired ? (
               <HiredAnnouncementCard key={entry.id} entry={entry} companyName={companyName} />
            ) : (
              <div key={entry.id} className="p-6 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col relative group overflow-hidden">
                
                {/* Score pip */}
                <div className="absolute top-4 right-4 bg-white/50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-violet-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                  {entry.ai_score}/100
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className="relative">
                    {entry.candidates?.avatar_url ? (
                      <Image 
                        src={entry.candidates.avatar_url} 
                        alt="Avatar" 
                        width={56} 
                        height={56} 
                        className="rounded-full object-cover border border-zinc-700"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                        <User className="w-6 h-6 text-zinc-500" />
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-sm px-1.5 py-0.5 text-[10px] font-bold text-zinc-700 dark:text-zinc-300 uppercase">
                       #{entry.rank}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-zinc-900 dark:text-white leading-tight">
                       {entry.candidates?.first_name} {entry.candidates?.last_name || entry.codename}
                    </h3>
                    <p className="text-sm text-zinc-500 font-mono">@{entry.codename}</p>
                  </div>
                </div>

                {/* Funnel Progress */}
                <div className="flex items-center justify-between mb-6 text-xs font-mono font-bold border-y border-zinc-200 dark:border-zinc-800/50 py-3">
                   <span className={cn("transition-colors", entry.status === 'revealed' ? "text-zinc-900 dark:text-white" : "text-zinc-600")}>
                     REVEALED
                   </span>
                   <span className="text-zinc-800">→</span>
                   <span className={cn("transition-colors", entry.status === 'contacted' ? "text-violet-400" : "text-zinc-600")}>
                     CONTACTED
                   </span>
                   <span className="text-zinc-800">→</span>
                   <span className="text-emerald-600/50">HIRED</span>
                </div>

                {/* Actions */}
                <div className="mt-auto space-y-3">
                  {entry.status === 'revealed' && (
                     <button 
                       onClick={() => setActiveInviteEntry(entry)}
                       className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all text-sm"
                     >
                        <MessageSquare className="w-4 h-4" />
                        Send Interview Invite
                     </button>
                  )}
                  {(entry.status === 'contacted' || entry.status === 'interviewed') && (
                     <>
                        <button 
                          onClick={() => markAsHired(entry.id)}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all text-sm"
                        >
                           <CheckCircle2 className="w-4 h-4" />
                           Mark as Hired
                        </button>
                        <button 
                          onClick={() => setActiveInviteEntry(entry)}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold transition-all text-sm"
                        >
                           <MessageSquare className="w-4 h-4" />
                           Follow Up
                        </button>
                     </>
                  )}
                </div>
              </div>
            );
         })}
      </div>

      {activeInviteEntry && (
         <HireFlowModal 
           isOpen={true}
           onClose={() => setActiveInviteEntry(null)}
           candidateName={activeInviteEntry.candidates?.first_name || activeInviteEntry.codename}
           entryId={activeInviteEntry.id}
           challengeId={challengeId}
           onSuccess={() => {
             updateEntryStatusLocal(activeInviteEntry.id, "contacted");
             setActiveInviteEntry(null);
             alert("Invite sent successfully!");
           }}
         />
      )}

    </div>
  );
}
