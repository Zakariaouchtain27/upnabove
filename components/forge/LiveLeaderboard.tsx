"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Trophy } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { VoteButton } from "@/components/forge/VoteButton";
import { motion, AnimatePresence } from "framer-motion";

export function LiveLeaderboard({ challengeId, currentCandidateId }: { challengeId: string, currentCandidateId?: string }) {
  const [entries, setEntries] = useState<any[]>([]);
  const [sortType, setSortType] = useState<'votes' | 'rank'>('votes');
  const { addToast } = useToast();

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();

    const fetchInitial = async () => {
      const res = await fetch(`/api/forge/leaderboard?challengeId=${challengeId}&sort=${sortType}`);
      if (!res.ok) return;
      const data = await res.json();
      if (isMounted) setEntries(data.entries || []);
    };

    fetchInitial();

    // Set up Realtime Subscription for INSERT and UPDATE
    const channel = supabase.channel(`public:forge_entries:${challengeId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'forge_entries',
          filter: `challenge_id=eq.${challengeId}`
        },
        (payload) => {
          if (!isMounted) return;

          if (payload.eventType === 'INSERT') {
            setEntries(prev => {
               const newEntry = payload.new;
               const existing = prev.find(e => e.id === newEntry.id);
               if (existing) return prev; // Avoid duplicates
               // Build a quick preview since real-time payload doesn't truncate for us
               const newWithPreview = { 
                  ...newEntry, 
                  preview: newEntry.submission_text ? newEntry.submission_text.substring(0, 100) + (newEntry.submission_text.length > 100 ? "..." : "") : null 
               };
               return [...prev, newWithPreview].sort((a,b) => b.vote_count - a.vote_count).slice(0, 10);
            });
          } else if (payload.eventType === 'UPDATE') {
             setEntries(prev => {
                const updated = payload.new;
                const filtered = prev.filter(e => e.id !== updated.id);
                // Retain existing preview or create new
                const updatedWithPreview = {
                   ...updated,
                   preview: updated.submission_text ? updated.submission_text.substring(0, 100) + (updated.submission_text.length > 100 ? "..." : "") : null
                };
                // If they are in the top 10 or just entered top 10 due to votes
                const combined = [...filtered, updatedWithPreview].sort((a,b) => b.vote_count - a.vote_count);
                return combined.slice(0, 10); 
             });
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    }
  }, [challengeId, sortType]);

  return (
    <div className="bg-gray-100 dark:bg-white/80 dark:bg-black/80 border border-black/5 dark:border-black/5 dark:border-white/5 rounded-2xl overflow-hidden shadow-2xl relative">
       <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary/10 to-transparent border-b border-black/5 dark:border-black/5 dark:border-white/5">
         <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <div className="flex bg-black/10 dark:bg-black/10 dark:bg-white/10 p-0.5 rounded-lg border border-black/5 dark:border-black/5 dark:border-white/5 ml-2">
               <button 
                  onClick={() => setSortType('votes')}
                  className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${sortType === 'votes' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground/80'}`}
               >
                 Most Voted
               </button>
               <button 
                  onClick={() => setSortType('rank')}
                  className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-md transition-all ${sortType === 'rank' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground/80'}`}
               >
                 Top Ranked
               </button>
            </div>
         </div>
         <div className="flex flex-col items-end gap-1">
           <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
             <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest">WebSockets Active</span>
           </div>
         </div>
       </div>

       <div className="flex flex-col h-[500px] overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent bg-background/50 relative">
          {entries.length === 0 ? (
             <div className="absolute inset-0 flex items-center justify-center p-8 text-center text-muted-foreground font-mono text-sm">
               No entries found. Awaiting contenders...
             </div>
          ) : (
            <AnimatePresence>
               {entries.map((entry, idx) => {
                  const isUser = entry.candidate_id === currentCandidateId;
                  
                  return (
                     <motion.div 
                        key={entry.id} 
                        layout
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        transition={{ 
                           layout: { type: "spring", stiffness: 300, damping: 30 },
                           opacity: { duration: 0.2 }
                        }}
                        className={`flex items-center justify-between p-4 border-b border-black/5 dark:border-black/5 dark:border-white/5 transition-colors ${
                           isUser 
                             ? 'bg-primary/5 hover:bg-primary/10 border-l-2 border-l-primary' 
                             : 'hover:bg-black/5 dark:bg-black/5 dark:bg-white/5 border-l-2 border-l-transparent'
                        }`}
                     >
                        <div className="flex flex-col gap-1 w-full overflow-hidden">
                           <div className="flex items-center gap-3">
                              <span className={`font-mono font-semibold w-6 shrink-0 ${idx < 3 ? 'text-amber-500' : 'text-muted-foreground'}`}>{idx + 1}.</span>
                              <span className={`font-mono font-bold truncate ${isUser ? 'text-primary' : 'text-gray-900 dark:text-zinc-900 dark:text-white'}`}>
                                 {entry.codename} {isUser && '(You)'}
                              </span>
                           </div>
                           {entry.preview && (
                              <p className="pl-9 text-xs text-muted-foreground italic truncate max-w-xs xl:max-w-sm">
                                "{entry.preview}"
                              </p>
                           )}
                        </div>

                        <div className="flex items-center gap-4">
                           <motion.span 
                              key={entry.vote_count} // triggers animation on vote change
                              initial={{ scale: 1.5, color: '#10b981' }}
                              animate={{ scale: 1, color: 'currentColor' }}
                              className="font-mono text-emerald-500 dark:text-emerald-400 font-bold w-8 text-right tabular-nums"
                           >
                              {entry.vote_count}
                           </motion.span>
                           
                           {/* Vote Action Component abstracted */}
                           <VoteButton entryId={entry.id} />
                        </div>
                     </motion.div>
                  )
               })}
            </AnimatePresence>
          )}
       </div>
    </div>
  );
}
