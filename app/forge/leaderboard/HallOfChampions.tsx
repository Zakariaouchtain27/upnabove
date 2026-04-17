"use client";

import React from "react";
import Image from "next/image";
import { Trophy, Star, Briefcase, Zap } from "lucide-react";

export function HallOfChampions({ champions }: { champions: any[] }) {
  if (!champions || champions.length === 0) return null;

  return (
    <div className="mb-16">
      <div className="text-center mb-8 flex flex-col items-center">
         <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm font-black uppercase tracking-widest mb-4">
            <Trophy className="w-4 h-4" /> Hall of Champions
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
         
         {/* Rank 2 (Left) */}
         {champions[1] && (
           <ChampionCard champion={champions[1]} rank={2} />
         )}

         {/* Rank 1 (Center) - Larger */}
         {champions[0] && (
           <div className="transform md:-translate-y-8 z-10 w-full relative">
              <div className="absolute -inset-1 bg-gradient-to-br from-amber-400 to-rose-500 rounded-3xl blur opacity-25" />
              <ChampionCard champion={champions[0]} rank={1} isCenter />
           </div>
         )}

         {/* Rank 3 (Right) */}
         {champions[2] && (
           <ChampionCard champion={champions[2]} rank={3} />
         )}

      </div>
    </div>
  );
}

function ChampionCard({ champion, rank, isCenter = false }: { champion: any, rank: number, isCenter?: boolean }) {
  const colors = {
     1: "from-amber-400 to-amber-600 text-amber-500 border-amber-500/30 bg-amber-500/5",
     2: "from-gray-300 to-gray-500 text-gray-400 border-gray-400/30 bg-gray-400/5",
     3: "from-orange-400 to-orange-700 text-orange-500 border-orange-500/30 bg-orange-500/5"
  };

  const badgeColor = colors[rank as keyof typeof colors];

  return (
    <div className={`relative ${isCenter ? 'bg-surface/90 backdrop-blur-xl' : 'bg-surface/60'} wireframe-card border border-border rounded-3xl p-6 flex flex-col items-center text-center shadow-2xl transition-all duration-500 hover:-translate-y-2`}>
       
       <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full flex items-center justify-center font-black bg-gradient-to-br ${badgeColor} text-white shadow-lg z-20`}>
         #{rank}
       </div>

       <div className="relative w-24 h-24 mb-4 mt-2">
         {champion.avatar_url ? (
           <Image src={champion.avatar_url} alt={champion.name} fill className="rounded-full object-cover border-4 border-background" />
         ) : (
           <div className={`w-full h-full rounded-full flex items-center justify-center font-black text-3xl bg-gradient-to-br ${badgeColor} text-white`}>
              {champion.name.charAt(0)}
           </div>
         )}
         {rank === 1 && <Trophy className="absolute -bottom-2 -right-2 w-8 h-8 text-amber-400 drop-shadow-md" />}
       </div>

       <h3 className={`font-black uppercase tracking-tight ${isCenter ? 'text-2xl' : 'text-xl'} text-gray-900 dark:text-white mb-1`}>
         {champion.name}
       </h3>
       
       {champion.country && (
          <span className="text-xs font-mono text-muted-foreground mb-4 uppercase">{champion.country}</span>
       )}

       <div className="grid grid-cols-2 gap-4 w-full mt-4 pt-4 border-t border-border">
          <div className="flex flex-col">
             <span className="text-xs uppercase tracking-widest text-muted-foreground opacity-70 flex items-center justify-center gap-1 mb-1"><Star className="w-3 h-3"/> Wins</span>
             <span className="font-bold text-lg text-foreground">{champion.totalWins}</span>
          </div>
          <div className="flex flex-col">
             <span className="text-xs uppercase tracking-widest text-muted-foreground opacity-70 flex items-center justify-center gap-1 mb-1"><Zap className="w-3 h-3"/> Votes</span>
             <span className="font-bold text-lg text-emerald-500">{champion.totalVotes}</span>
          </div>
       </div>

       {champion.companiesHiredBy && champion.companiesHiredBy.length > 0 && (
         <div className="mt-4 pt-4 border-t border-border w-full">
            <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-2 flex items-center justify-center gap-1">
               <Briefcase className="w-3 h-3" /> Hired By
            </span>
            <div className="flex flex-wrap items-center justify-center gap-1 mt-2">
               {champion.companiesHiredBy.map((co: string) => (
                  <span key={co} className="px-2 py-1 bg-black/5 dark:bg-white/5 border border-border rounded-md text-[10px] font-mono whitespace-nowrap">
                    {co}
                  </span>
               ))}
            </div>
         </div>
       )}

    </div>
  );
}
