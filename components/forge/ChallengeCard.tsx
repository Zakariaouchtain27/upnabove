"use client";

import React from "react";
import Link from "next/link";
import { SpotlightCard } from "@/components/SpotlightCard";
import { Trophy, Users, ArrowRight, Crown } from "lucide-react";
import type { ChallengeStatus } from "@/lib/forge";
import { CountdownTimer } from "@/components/forge/CountdownTimer";
import { LiveEntryCount } from "@/components/forge/LiveEntryCount";

import { Database } from "@/lib/database.types";

type BaseChallenge = Database['public']['Tables']['forge_challenges']['Row'];

export interface ForgeChallenge extends Omit<BaseChallenge, 'difficulty' | 'status'> {
  difficulty: "junior" | "mid" | "senior" | string;
  status: ChallengeStatus | string;
  sponsor_logo_url?: string | null;
  prize_type?: string;
}

export function ChallengeCard({ challenge }: { challenge: ForgeChallenge }) {

  const difficultyColors = {
    junior: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    mid: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    senior: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  };

  const targetDate = challenge.status === "scheduled" ? challenge.drop_time : challenge.expires_at;

  return (
    <SpotlightCard className={`h-full block wireframe-card p-6 rounded-2xl relative group transition-colors ${challenge.is_sponsored ? 'border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.05)] hover:shadow-[0_0_25px_rgba(255,111,97,0.4)] bg-gradient-to-br from-[#050a14] to-[#1B365D]/50 hover:border-[#FF6F61]/60' : 'border border-white/5 bg-[#1B365D]/70 hover:bg-[#1B365D]/90 hover:border-[#FF6F61]/50 backdrop-blur-md'}`}>
      <div className="flex flex-col h-full gap-5">
        
        {/* Header: Company Config + Badges */}
        <div className="flex justify-between items-start">
           <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg overflow-hidden flex-shrink-0 ${challenge.is_sponsored ? 'bg-white dark:bg-black border border-amber-500/30 shadow-lg' : 'bg-surface-hover border border-border text-gray-900 dark:text-zinc-900 dark:text-white'}`}>
                 {challenge.sponsor_logo_url ? (
                     <img src={challenge.sponsor_logo_url} alt={challenge.sponsor_name || 'Brand'} className="w-full h-full object-cover" />
                 ) : (
                     challenge.sponsor_name ? challenge.sponsor_name.charAt(0).toUpperCase() : "U"
                 )}
              </div>
              <div>
                 <span className={`text-xs uppercase tracking-widest block font-bold mb-0.5 ${challenge.is_sponsored ? 'text-amber-500' : 'text-muted-foreground'}`}>
                   {challenge.sponsor_name || "UpnAbove Origin"}
                 </span>
                 <div className="flex gap-2">
                   <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${difficultyColors[challenge.difficulty as keyof typeof difficultyColors] || difficultyColors.mid}`}>
                     {challenge.difficulty}
                   </span>
                   <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border bg-surface text-muted-foreground border-border">
                     {challenge.challenge_type}
                   </span>
                 </div>
              </div>
           </div>
           
           <div className="flex flex-col gap-1 items-end">
             {challenge.is_sponsored && (
                 <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center gap-1 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                    <Crown className="w-2.5 h-2.5" /> Sponsored
                 </span>
             )}
             <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider border ${(
               challenge.status === "live"
                   ? "bg-[#FF6F61]/20 text-[#FF6F61] border-[#FF6F61]/30 animate-pulse shadow-[0_0_15px_rgba(255,111,97,0.3)]"
                   : "bg-surface text-muted-foreground border-border"
               )}`}>
               {challenge.status}
             </span>
           </div>
        </div>

        {/* Title */}
        <div>
           <h3 className={`text-2xl font-extrabold leading-tight line-clamp-2 transition-colors ${challenge.is_sponsored ? 'text-zinc-900 dark:text-white group-hover:text-amber-400' : 'text-gray-900 dark:text-zinc-900 dark:text-white group-hover:text-primary'}`}>
             {challenge.title}
           </h3>
        </div>

        {/* Reactive Component: Countdown */}
        <div className={`flex flex-col items-center justify-center py-6 border rounded-xl shadow-inner min-h-[140px] ${challenge.is_sponsored ? 'bg-[#050a14]/60 border-amber-500/20' : 'bg-[#050a14]/40 border-white/5'}`}>
           <div className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase mb-2">
             {challenge.status === "scheduled" ? "DROPS IN" : "TIME REMAINING"}
           </div>
           <CountdownTimer targetTime={targetDate} size="md" />
        </div>

        <div className="flex-grow" />

        {/* Footer info & CTA */}
        <div className={`flex items-center justify-between mt-2 pt-4 border-t ${challenge.is_sponsored ? 'border-amber-500/10' : 'border-black/10 dark:border-black/10 dark:border-white/10'}`}>
           <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm">
                 <Trophy className={`w-4 h-4 ${challenge.is_sponsored ? 'text-amber-400' : 'text-amber-500'}`} />
                 <span className={`font-bold ${challenge.is_sponsored ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'text-gray-900 dark:text-zinc-900 dark:text-white'}`}>
                    {challenge.prize_type === 'Job Offer' ? 'Exclusive Job Offer' : "$" + (challenge.prize_value || 0) + " " + (challenge.prize_type || 'Pool')}
                    <span className="text-muted-foreground font-normal sm:hidden lg:inline text-xs ml-1">Reward</span>
                 </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                 <Users className={`w-4 h-4 ${challenge.is_sponsored ? 'text-amber-500/50' : 'text-primary'}`} />
                 <span className="font-medium text-gray-900 dark:text-zinc-900 dark:text-white flex items-center gap-1">
                     <LiveEntryCount challengeId={challenge.id} initialCount={challenge.entry_count || 0} />
                     <span className="font-normal text-muted-foreground">Total Entries</span>
                 </span>
              </div>
           </div>
           
           <Link href={`/forge/${challenge.id}`} className={`btn-glow inline-flex items-center justify-center px-4 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${(
              challenge.is_sponsored 
               ? 'bg-[#FF6F61] text-white hover:bg-[#ff8c81] shadow-[0_4px_20px_-4px_rgba(255,111,97,0.5)]'
               : 'bg-[#FF6F61] text-white hover:bg-[#ff8c81] shadow-[0_4px_20px_-4px_rgba(255,111,97,0.5)]'
            )}`}>
              {challenge.status === "live" ? "Enter Bounty" : "View Drop"} <ArrowRight className="w-4 h-4 ml-1" />
           </Link>
        </div>

      </div>
    </SpotlightCard>
  );
}
