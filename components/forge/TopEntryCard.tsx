"use client";

import { motion } from "framer-motion";
import { User, Trophy, Medal, Star } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface TopEntryCardProps {
  entry: any; // The payload from DB
  rank: number;
  revealed: boolean;
}

export function TopEntryCard({ entry, rank, revealed }: TopEntryCardProps) {
  const isWinner = rank === 1;

  // Rank-specific styling
  const rankStylesMap: Record<number, any> = {
    1: {
      border: "border-yellow-500/50",
      bg: "bg-yellow-500/10",
      icon: <Trophy className="w-8 h-8 text-yellow-400" />,
      label: "FORGE CHAMPION",
      badge: "bg-yellow-500 text-yellow-950",
    },
    2: {
      border: "border-gray-300/50",
      bg: "bg-gray-300/10",
      icon: <Medal className="w-6 h-6 text-zinc-700 dark:text-gray-300" />,
      label: "RANKED #2",
      badge: "bg-gray-300 text-zinc-900",
    },
    3: {
      border: "border-orange-600/50",
      bg: "bg-orange-600/10",
      icon: <Star className="w-6 h-6 text-orange-500" />,
      label: "RANKED #3",
      badge: "bg-orange-600 text-zinc-900 dark:text-white",
    },
  };
  
  const rankStyles = rankStylesMap[rank] || rankStylesMap[3];

  return (
    <motion.div
      layout
      initial={false}
      className={cn(
        "relative rounded-2xl border bg-white/40 dark:bg-black/40 backdrop-blur-xl p-6 transition-all duration-500",
        revealed ? rankStyles.border : "border-violet-500/20",
        isWinner && revealed ? "ring-2 ring-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.2)] md:p-8" : ""
      )}
    >
      {/* Background glow when revealed */}
      {revealed && (
         <div className={cn("absolute inset-0 rounded-2xl pointer-events-none opacity-50", rankStyles.bg)} />
      )}

      {/* Hidden State */}
      {!revealed && (
        <div className="flex flex-col items-center justify-center space-y-4 py-8">
          <div className="w-20 h-20 rounded-full border-2 border-dashed border-violet-500/50 flex items-center justify-center bg-violet-500/10 animate-pulse">
            <User className="w-8 h-8 text-violet-400/50" />
          </div>
          <div className="text-center">
            <h3 className="font-mono text-xl font-bold tracking-widest text-zinc-900 dark:text-white">{entry.codename}</h3>
            <p className="text-sm font-mono text-violet-400/60 mt-2">CLASSIFIED ENTRY</p>
          </div>
        </div>
      )}

      {/* Revealed State */}
      {revealed && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
          className="relative z-10 flex flex-col items-center text-center space-y-4"
        >
          {/* Rank Badge */}
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={cn("px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest", rankStyles.badge)}
          >
            {rankStyles.label}
          </motion.div>

          {/* Avatar (simulated since user actual avatar might not be passed perfectly or to genericize) */}
          <div className={cn("relative rounded-full p-1", rankStyles.bg)}>
            {entry.candidates?.avatar_url ? (
               <Image 
                 src={entry.candidates.avatar_url} 
                 alt={entry.candidates.first_name || "User"}
                 width={isWinner ? 120 : 80}
                 height={isWinner ? 120 : 80}
                 className="rounded-full object-cover border-2 border-transparent"
               />
            ) : (
               <div className={cn("rounded-full flex items-center justify-center bg-zinc-200 dark:bg-zinc-800", isWinner ? "w-28 h-28" : "w-16 h-16")}>
                 <User className="w-1/2 h-1/2 text-gray-400" />
               </div>
            )}
            
            <div className="absolute -bottom-2 -right-2 bg-white dark:bg-black rounded-full p-2 border border-zinc-200 dark:border-zinc-800">
               {rankStyles.icon}
            </div>
          </div>

          {/* Identity */}
          <div className="space-y-1">
            <motion.h2 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className={cn("font-bold text-zinc-900 dark:text-white tracking-tight", isWinner ? "text-3xl md:text-4xl" : "text-xl")}
            >
              {entry.candidates?.first_name} {entry.candidates?.last_name || entry.codename}
            </motion.h2>
            <motion.p 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               transition={{ delay: 1 }}
               className="font-mono text-sm text-violet-400"
            >
               AKA &quot;{entry.codename}&quot;
            </motion.p>
          </div>

          {/* Score & View details */}
          <motion.div
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 1.2 }}
             className="pt-4 border-t border-zinc-200 dark:border-zinc-800/50 w-full"
          >
             <div className="flex justify-between items-center text-sm font-mono">
                <span className="text-zinc-500">AI SCORE</span>
                <span className="text-violet-400 font-bold">{entry.ai_score}/100</span>
             </div>
             {entry.vote_count > 0 && (
                 <div className="flex justify-between items-center text-sm font-mono mt-2">
                    <span className="text-zinc-500">COMMUNITY VOTES</span>
                    <span className="text-pink-400 font-bold">{entry.vote_count}</span>
                 </div>
             )}
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
