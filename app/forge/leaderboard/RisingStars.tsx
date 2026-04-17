"use client";

import React, { useMemo } from "react";
import Image from "next/image";
import { TrendingUp, Sparkles } from "lucide-react";

export function RisingStars({ candidates }: { candidates: any[] }) {
  
  const risingStars = useMemo(() => {
     const sevenDaysAgo = new Date();
     sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

     // 1. Filter candidates created in the last 7 days who have scored > 0 points
     const newcomers = candidates.filter(c => 
        c.createdAt >= sevenDaysAgo && 
        c.massiveScore > 0
     );

     // 2. Sort by highest score to establish who is rising fastest
     return newcomers.sort((a, b) => b.massiveScore - a.massiveScore).slice(0, 3);
  }, [candidates]);

  if (risingStars.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-[#7C3AED]/10 to-transparent border border-[#7C3AED]/20 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
         <TrendingUp className="w-5 h-5 text-[#7C3AED]" />
         <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-widest text-sm">Rising Stars</h4>
      </div>

      <div className="space-y-4">
         {risingStars.map((star, i) => (
            <div key={star.id} className="flex gap-3 items-center group">
               {/* Rank Arrow Indicator */}
               <div className="flex items-center justify-center bg-emerald-500/10 text-emerald-500 w-6 h-6 rounded-full shrink-0">
                  <Sparkles className="w-3 h-3" />
               </div>

               {/* Avatar */}
               {star.avatar_url ? (
                 <Image src={star.avatar_url} alt="Avatar" width={32} height={32} className="rounded-full border border-border" />
               ) : (
                 <div className="w-8 h-8 rounded-full bg-[#7C3AED]/20 flex items-center justify-center text-[#7C3AED] font-bold">
                   {star.name.charAt(0)}
                 </div>
               )}

               {/* Bio */}
               <div className="flex flex-col flex-grow truncate">
                  <span className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-[#7C3AED] transition-colors truncate">
                     {star.name}
                  </span>
                  <span className="text-xs text-muted-foreground uppercase tracking-widest font-mono">
                     {star.totalWins} W / {star.totalVotes} V
                  </span>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
}
