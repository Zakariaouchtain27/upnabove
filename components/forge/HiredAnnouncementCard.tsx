"use client";

import { motion } from "framer-motion";
import { User, Trophy, Share2, Briefcase } from "lucide-react";
import Image from "next/image";

interface HiredAnnouncementCardProps {
  entry: any;
  companyName: string;
}

export function HiredAnnouncementCard({ entry, companyName }: HiredAnnouncementCardProps) {
  const isWinner = entry.rank === 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className="relative rounded-3xl border border-emerald-500/50 bg-[#05050a] overflow-hidden p-8 flex flex-col items-center justify-center space-y-6 text-center shadow-[0_0_50px_rgba(16,185,129,0.15)] group"
    >
      {/* Background patterns */}
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900/20 via-transparent to-violet-900/10 pointer-events-none" />
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-violet-500/20 rounded-full blur-[80px] pointer-events-none" />

      {/* Top Badge */}
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-black uppercase text-sm tracking-[0.2em] flex items-center gap-2"
      >
        <Briefcase className="w-4 h-4" />
        OFFICIALLY HIRED
      </motion.div>

      {/* Avatar Container */}
      <div className="relative z-10 p-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/50">
        {entry.candidates?.avatar_url ? (
          <Image 
            src={entry.candidates.avatar_url} 
            alt={entry.candidates.first_name || "Hired Candidate"}
            width={120}
            height={120}
            className="rounded-full object-cover border-4 border-emerald-500/20"
          />
        ) : (
          <div className="w-28 h-28 rounded-full flex items-center justify-center bg-zinc-200 dark:bg-zinc-800 border-4 border-emerald-500/20">
            <User className="w-12 h-12 text-zinc-500" />
          </div>
        )}
        {/* Sub badge if they were rank 1 */}
        {isWinner && (
           <div className="absolute -bottom-3 -right-3 bg-yellow-500 rounded-full p-2.5 border-2 border-[#05050a] shadow-lg">
             <Trophy className="w-6 h-6 text-yellow-950" />
           </div>
        )}
      </div>

      <div className="relative z-10 space-y-2 max-w-xs">
        <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
          {entry.candidates?.first_name} {entry.candidates?.last_name || `"${entry.codename}"`}
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Joined the team at <span className="font-bold text-zinc-900 dark:text-white">{companyName}</span> via The Forge.
        </p>
      </div>

      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative z-10 flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] mt-4"
      >
        <Share2 className="w-4 h-4" />
        Share Announcement
      </motion.button>
    </motion.div>
  );
}
