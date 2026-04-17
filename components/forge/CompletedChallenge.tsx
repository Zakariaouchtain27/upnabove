"use client";
import React from "react";
import { SpotlightCard } from "@/components/SpotlightCard";
import { Trophy, Star, Shield, HelpCircle, UserCheck } from "lucide-react";
import { EntryComments } from "@/components/forge/EntryComments";
import { EmojiReactions } from "@/components/forge/EmojiReactions";

export function CompletedChallenge({ challenge, entries, currentUserId }: { challenge: any; entries: any[]; currentUserId?: string }) {
  const isJudging = challenge.status === "judging";
  const titleText = isJudging ? "Judging in Progress..." : "Winners Revealed";
  
  // Sort by vote count to get the standard leaderboard
  // In reality, AI score might determine actual rank, or a combination.
  const rankedEntries = [...entries].sort((a,b) => b.vote_count - a.vote_count);
  const top3 = rankedEntries.slice(0, 3);
  const theRest = rankedEntries.slice(3);

  return (
    <div className="flex flex-col gap-12 pb-32 pt-12">
       
       <div className="text-center space-y-4 mb-8">
          <div className={`inline-flex items-center gap-2 px-6 py-2 rounded-full border text-sm font-bold uppercase tracking-widest ${isJudging ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 animate-pulse' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
             {isJudging ? <HelpCircle className="w-4 h-4" /> : <Trophy className="w-4 h-4" />}
             {titleText}
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-gray-900 dark:text-zinc-900 dark:text-white drop-shadow-md">
             {challenge.title}
          </h1>
          <p className="text-muted-foreground font-mono max-w-2xl mx-auto">
             {isJudging 
               ? "The submission window is closed. The community and AI are deliberating the top submissions right now. Check back shortly."
               : "The verdicts are in. The community has spoken, and the AI has graded. The Top 3 Codenames have been unmasked."}
          </p>

          {!isJudging && (
             <div className="pt-4 pb-2">
                <a href={`/forge/${challenge.id}/submissions`} className="inline-flex items-center gap-2 px-8 py-3 bg-white text-black font-bold uppercase tracking-widest text-sm rounded-full hover:bg-gray-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                   <Star className="w-4 h-4" /> View All Submissions & Replays
                </a>
             </div>
          )}
       </div>

       {/* Hiring Banner (Optional, mocked if badged) */}
       {!isJudging && challenge.sponsor_name && (
          <div className="w-full flex items-center justify-center p-4 bg-gradient-to-r from-primary-dark/20 via-primary/20 to-primary-dark/20 border-y border-primary/30 text-primary-light font-bold tracking-widest uppercase text-sm">
             <UserCheck className="w-5 h-5 mr-3" />
             {challenge.sponsor_name} has officially hired a candidate from this Forge.
          </div>
       )}

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto z-10 w-full relative">
          {/* Orbs for winners highlight */}
          {!isJudging && <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/20 blur-[100px] pointer-events-none -z-10" />}

          {top3.map((entry, idx) => {
             // Mock real names if is_revealed is true
             const displayName = (!isJudging && entry.is_revealed && entry.candidate) 
                ? `${entry.candidate.first_name} ${entry.candidate.last_name}` 
                : entry.codename;
                
             const isWinner = idx === 0;

             return (
               <SpotlightCard key={entry.id} className={`wireframe-card p-6 flex flex-col rounded-2xl ${isWinner ? 'md:-translate-y-8 border-primary/50 shadow-[0_0_30px_rgba(124,58,237,0.2)]' : ''}`}>
                  <div className="flex items-center justify-between mb-6">
                     <span className={`w-8 h-8 flex items-center justify-center font-bold font-mono rounded-lg ${
                        idx === 0 ? "bg-amber-500/20 text-amber-500" :
                        idx === 1 ? "bg-slate-300/20 text-slate-300" :
                        "bg-orange-600/20 text-orange-400"
                     }`}>
                        #{idx + 1}
                     </span>
                     <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-emerald-400" />
                        <span className="font-mono text-emerald-400 font-bold">{entry.ai_score || 0}/100</span>
                     </div>
                  </div>

                  {/* Avatar & Name */}
                  <div className="flex flex-col items-center text-center pb-6 border-b border-black/10 dark:border-black/10 dark:border-white/10">
                     <div className="w-20 h-20 rounded-full bg-surface-hover border border-border flex items-center justify-center overflow-hidden mb-4 shadow-inner">
                        {!isJudging && entry.is_revealed && entry.candidate?.avatar_url ? (
                           <img src={entry.candidate.avatar_url} alt="Candidate" className="w-full h-full object-cover" />
                        ) : (
                           <Shield className="w-8 h-8 text-muted-foreground/50" />
                        )}
                     </div>
                     <h3 className={`text-xl font-bold ${displayName === entry.codename ? 'font-mono text-muted-foreground' : 'text-gray-900 dark:text-zinc-900 dark:text-white'}`}>
                        {displayName}
                     </h3>
                     {entry.is_revealed && <span className="text-xs uppercase tracking-widest text-primary-light mt-1">Real Identity</span>}
                  </div>

                  <div className="pt-6">
                     <h4 className="text-xs text-muted-foreground uppercase tracking-widest mb-2 font-bold">AI Verdict</h4>
                     <p className="text-sm text-foreground/80 italic">
                        "{entry.ai_feedback || "Excellent approach. Met all technical constraints under the time limit. Outstanding presentation."}"
                     </p>
                  </div>
                  
                  <div className="flex-grow"/>

                  <div className="pt-6 mt-6 border-t border-black/5 dark:border-black/5 dark:border-white/5 flex gap-4 text-center">
                     <div className="w-1/2">
                        <div className="text-xs text-muted-foreground uppercase opacity-80 mb-1">Community</div>
                        <div className="font-mono font-bold text-gray-900 dark:text-zinc-900 dark:text-white text-lg">{entry.vote_count}</div>
                     </div>
                     <div className="w-1/2">
                        <div className="text-xs text-muted-foreground uppercase opacity-80 mb-1">Rank</div>
                        <div className="font-mono font-bold text-gray-900 dark:text-zinc-900 dark:text-white text-lg">{idx + 1}</div>
                     </div>
                  </div>
                   {/* Entry Comments — only for revealed top-3 on completed challenges */}
                   {!isJudging && entry.is_revealed && (
                     <div className="mt-6 pt-6 border-t border-border">
                       <EntryComments
                         entryId={entry.id}
                         currentUserId={currentUserId}
                         entryCodename={displayName}
                       />
                     </div>
                   )}
               </SpotlightCard>
             );
          })}
       </div>

       {/* The rest of the leaderboard - still anonymous */}
       {theRest.length > 0 && (
          <div className="max-w-3xl mx-auto w-full mt-16">
             <h3 className="text-lg font-bold uppercase tracking-widest text-muted-foreground mb-6 text-center">Remaining Roster</h3>
             <div className="flex flex-col bg-surface/30 border border-black/5 dark:border-black/5 dark:border-white/5 rounded-2xl overflow-hidden shadow-inner">
                {theRest.map((entry, idx) => (
                   <div key={entry.id} className="flex items-center justify-between p-4 border-b border-black/5 dark:border-black/5 dark:border-white/5 last:border-0 hover:bg-black/5 dark:bg-black/5 dark:bg-white/5">
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-muted-foreground font-semibold w-8 text-center">{idx + 4}.</span>
                        <div>
                          <CourseRow codename={entry.codename} />
                        </div>
                      </div>
                      <div className="flex items-center gap-8 text-right hidden sm:flex">
                         <div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">AI Score</div>
                            <div className="font-mono font-medium text-emerald-400/70">{entry.ai_score || '--'}</div>
                         </div>
                         <div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Votes</div>
                            <div className="font-mono font-medium text-gray-900/50 dark:text-zinc-900 dark:text-white/50">{entry.vote_count}</div>
                         </div>
                      </div>
                   </div>
                ))}
             </div>
          </div>
       )}

    </div>
  );
}

function CourseRow({ codename }: { codename: string }) {
  return (
    <div className="flex items-center gap-2 text-gray-900/70 dark:text-zinc-900 dark:text-white/70">
       <span className="font-mono font-bold">{codename}</span>
       <Shield className="w-3 h-3 text-muted-foreground/50" />
    </div>
  );
}
