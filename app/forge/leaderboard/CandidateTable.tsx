"use client";

import React from "react";
import Image from "next/image";
import { Award, Target, Flame } from "lucide-react";

export function CandidateTable({ candidates, currentUserId }: { candidates: any[], currentUserId?: string }) {

  if (candidates.length === 0) {
      return (
         <div className="p-16 border rounded-2xl border-dashed border-border flex items-center justify-center text-muted-foreground font-mono">
            No candidates match this criteria.
         </div>
      );
  }

  // Check if current user is implicitly in the top results rendered
  const isUserRendered = candidates.some(c => c.id === currentUserId);
  const userStatRow = currentUserId && !isUserRendered ? candidates.find(c => c.id === currentUserId) : null;

  return (
    <div className="overflow-x-auto w-full bg-[#1B365D]/30 border border-white/10 rounded-2xl shadow-sm">
      <table className="w-full text-left text-sm whitespace-nowrap">
         
         <thead className="bg-[#1B365D]/60 border-b border-white/10">
            <tr>
               <th className="px-6 py-4 font-bold uppercase tracking-widest text-[#FF6F61] text-xs">Rank</th>
               <th className="px-6 py-4 font-bold uppercase tracking-widest text-muted-foreground text-xs">Ghost</th>
               <th className="px-6 py-4 font-bold uppercase tracking-widest text-muted-foreground text-xs text-center">Wins</th>
               <th className="px-6 py-4 font-bold uppercase tracking-widest text-muted-foreground text-xs text-center">Top 3</th>
               <th className="px-6 py-4 font-bold uppercase tracking-widest text-muted-foreground text-xs text-center">Votes</th>
               <th className="px-6 py-4 font-bold uppercase tracking-widest text-muted-foreground text-xs text-center">Hires</th>
               <th className="px-6 py-4 font-bold uppercase tracking-widest text-muted-foreground text-xs text-right">Badges</th>
            </tr>
         </thead>

         <tbody className="divide-y divide-border">
            {candidates.slice(0, 100).map((c) => (
               <CandidateRow key={c.id} candidate={c} isCurrentUser={c.id === currentUserId} />
            ))}

            {/* If user is outside top 100, pin their row at the very bottom */}
            {userStatRow && (
               <>
                 <tr className="border-t-[3px] border-dashed border-white/10 bg-[#1B365D]/50">
                   <td colSpan={7} className="text-center py-2 text-xs uppercase tracking-widest font-bold text-muted-foreground">Your Standing</td>
                 </tr>
                 <CandidateRow key={userStatRow.id} candidate={userStatRow} isCurrentUser={true} pinned />
               </>
            )}
         </tbody>

      </table>
    </div>
  );
}

function CandidateRow({ candidate, isCurrentUser, pinned = false }: { candidate: any, isCurrentUser: boolean, pinned?: boolean }) {
  return (
     <tr className={`transition-colors ${isCurrentUser ? (pinned ? 'bg-[#FF6F61]/20 border-t-2 border-[#FF6F61]' : 'bg-[#FF6F61]/10 hover:bg-[#FF6F61]/20') : 'hover:bg-[#1B365D]/60'}`}>
        
        {/* Rank */}
        <td className="px-6 py-4">
           {candidate.computeRank <= 3 ? (
             <span className={`w-8 h-8 rounded-full flex items-center justify-center font-black ${
               candidate.computeRank === 1 ? 'bg-[#FF6F61] text-white shadow-[0_0_15px_rgba(255,111,97,0.5)]' : 
               candidate.computeRank === 2 ? 'bg-[#FF6F61]/80 text-white' : 
               'bg-[#FF6F61]/60 text-white'
             } shadow-sm`}>
               {candidate.computeRank}
             </span>
           ) : (
             <span className="font-mono text-muted-foreground font-bold pl-2">{candidate.computeRank}</span>
           )}
        </td>

        {/* Name / Avatar */}
        <td className="px-6 py-4 font-bold text-gray-900 dark:text-white flex items-center gap-3">
           {candidate.avatar_url ? (
             <Image src={candidate.avatar_url} alt="Avatar" width={32} height={32} className="rounded-full border border-border" />
           ) : (
             <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
               {candidate.name.charAt(0)}
             </div>
           )}
           <div className="flex flex-col">
              <span className={isCurrentUser ? 'text-[#FF6F61]' : ''}>
                {candidate.name} {isCurrentUser && <span className="text-xs uppercase bg-[#FF6F61] text-white rounded-full px-2 py-0.5 ml-1 select-none">You</span>}
              </span>
              <span className="text-xs text-muted-foreground lg:max-w-xs truncate">{candidate.skills?.join(" • ")}</span>
           </div>
        </td>

        {/* Wins */}
        <td className="px-6 py-4 text-center">
           <span className={`font-mono font-bold text-lg ${candidate.totalWins > 0 ? 'text-amber-500' : 'text-muted-foreground opacity-50'}`}>
              {candidate.totalWins}
           </span>
        </td>

        {/* Top 3 */}
        <td className="px-6 py-4 text-center">
           <span className="font-mono font-bold text-lg text-gray-900 dark:text-white">
              {candidate.top3Finishes}
           </span>
        </td>

        {/* Votes */}
        <td className="px-6 py-4 text-center">
           <span className="font-mono font-bold text-lg text-emerald-500 relative group">
              {candidate.totalVotes}
              {candidate.totalVotes > 500 && <Flame className="w-4 h-4 text-orange-500 absolute -right-4 -top-1" />}
           </span>
        </td>

        {/* Hires */}
        <td className="px-6 py-4 text-center">
           <span className="font-mono font-bold text-lg text-blue-500">
              {candidate.hires}
           </span>
        </td>

        {/* Badges */}
        <td className="px-6 py-4 text-right">
           <div className="flex items-center justify-end gap-1">
             {candidate.badges?.slice(0, 3).map((b: string, i: number) => (
                <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-[#7C3AED] flex items-center justify-center" title={b}>
                   <Award className="w-3 h-3 text-white" />
                </div>
             ))}
             {candidate.badges?.length > 3 && (
                <span className="text-xs font-mono text-muted-foreground ml-1">+{candidate.badges.length - 3}</span>
             )}
             {(!candidate.badges || candidate.badges.length === 0) && (
                <span className="text-muted-foreground opacity-30 text-xs">—</span>
             )}
           </div>
        </td>

     </tr>
  );
}
