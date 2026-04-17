"use client";

import React from "react";
import { SpotlightCard } from "@/components/SpotlightCard";
import { ShieldAlert, Zap, Users, Trophy } from "lucide-react";
import { LiveLeaderboard } from "@/components/forge/LiveLeaderboard";
import { ClientActions } from "@/app/forge/[id]/ClientActions";
import { useToast } from "@/components/ui/Toast";
import { CountdownTimer } from "@/components/forge/CountdownTimer";
import { LiveEntryCount } from "@/components/forge/LiveEntryCount";
import { SpectatorPresence } from "@/components/forge/SpectatorPresence";
import { LiveActivityFeed } from "@/components/forge/LiveActivityFeed";
import { ShareSnapshotModal } from "@/components/forge/ShareSnapshotModal";
import { ReferralWidget } from "@/components/forge/ReferralWidget";
import { useState, useEffect } from "react";

export function LiveChallenge({ challenge, userId, hasEntered = false, referralLink, referralCode, bonusVotes = 0 }: {
  challenge: any;
  userId?: string;
  hasEntered?: boolean;
  referralLink?: string;
  referralCode?: string;
  bonusVotes?: number;
}) {
  const { addToast } = useToast();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [myEntryId, setMyEntryId] = useState<string | null>(null);

  // Fetch the user's own entry ID so we can show the dynamic OG card in the share modal
  useEffect(() => {
    if (!userId || !hasEntered) return;
    fetch(`/api/forge/my-entry?challengeId=${challenge.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.id) setMyEntryId(data.id); });
  }, [userId, hasEntered, challenge.id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast("Copied to clipboard. Tell them to vote for your ghost!", "success");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-32 pt-12 relative">
       {/* Main Content Area */}
       <div className="lg:col-span-2 space-y-8">
          
          <div className="space-y-4">
             <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-[#FF6F61]/10 text-[#FF6F61] border-[#FF6F61]/20 text-xs font-bold uppercase tracking-widest animate-pulse">
                   <ShieldAlert className="w-4 h-4" />
                   Live Arena
                </div>
                {!hasEntered && (
                   <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-blue-500/10 text-blue-500 dark:text-blue-400 border-blue-500/20 text-xs font-bold uppercase tracking-widest animate-pulse">
                      Spectator Mode
                   </div>
                )}
             </div>
             <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-gray-900 dark:text-zinc-900 dark:text-white drop-shadow-md">
                {challenge.title}
             </h1>
          </div>

          <SpotlightCard className="wireframe-card p-8 rounded-2xl bg-surface/40 backdrop-blur-md prose prose-invert max-w-none">
             <p className="whitespace-pre-wrap font-mono leading-relaxed text-muted-foreground">{challenge.description}</p>
          </SpotlightCard>

          <SpotlightCard className="wireframe-card p-8 rounded-2xl">
             <h3 className="text-2xl font-bold uppercase tracking-widest text-gray-900 dark:text-zinc-900 dark:text-white mb-6">Combat Brief</h3>
             <div className="grid grid-cols-3 gap-4 font-mono text-sm max-w-xl">
                 <div className="border-r border-black/5 dark:border-black/5 dark:border-white/5">
                    <span className="block text-muted-foreground uppercase opacity-80 mb-1">Time Limit</span>
                    <span className="font-bold text-gray-900 dark:text-zinc-900 dark:text-white text-xl">{challenge.time_limit_minutes} Min</span>
                 </div>
                 <div className="border-r border-black/5 dark:border-black/5 dark:border-white/5 pl-4">
                    <span className="block text-muted-foreground uppercase opacity-80 mb-1">Bounty</span>
                    <span className="font-bold text-amber-500 text-xl flex items-center gap-1"><Trophy className="w-4 h-4"/> ${challenge.prize_value}</span>
                 </div>
                 <div className="pl-4 border-r border-black/5 dark:border-black/5 dark:border-white/5">
                    <span className="block text-muted-foreground uppercase opacity-80 mb-1">Entrants</span>
                    <span className="font-bold text-gray-900 dark:text-zinc-900 dark:text-white text-xl flex items-center gap-1">
                      <Users className="w-4 h-4 text-primary"/> 
                      <LiveEntryCount challengeId={challenge.id} initialCount={challenge.entry_count} />
                    </span>
                 </div>
                 <div className="pl-4">
                    <span className="block text-muted-foreground uppercase opacity-80 mb-1">Spectating</span>
                    <div className="mt-1">
                      <SpectatorPresence challengeId={challenge.id} />
                    </div>
                 </div>
             </div>
          </SpotlightCard>
       </div>

       {/* Live Sidebar */}
       <div className="space-y-6">
          {/* Urgent Red Countdown is now handled directly inside the reactive CountdownTimer */}
          <div className={`flex flex-col items-center justify-center py-8 rounded-3xl border bg-gray-100 dark:bg-white/40 dark:bg-black/40 border-black/5 dark:border-black/5 dark:border-white/5 relative overflow-hidden group`}>
             <div className="absolute inset-0 bg-[#FF6F61]/5 group-hover:bg-[#FF6F61]/10 transition-colors pointer-events-none" />
             <div className="text-xs font-bold tracking-[0.3em] uppercase mb-4 text-muted-foreground relative z-10">
               TIME REMAINING
             </div>
             <CountdownTimer targetTime={challenge.expires_at} size="lg" />
          </div>

          <div className="flex flex-col gap-3">
             <ClientActions challengeId={challenge.id} status={challenge.status} />
             <button onClick={() => setIsShareModalOpen(true)} className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs bg-surface border border-border hover:bg-black/5 dark:bg-black/5 dark:bg-white/5 transition-all text-gray-900 dark:text-zinc-900 dark:text-white">
               <Zap className="w-4 h-4 text-amber-400" /> Share & Rally Votes
             </button>
             {hasEntered && (
               <button onClick={() => addToast("You are spectating live.", "info")} className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-mono bg-transparent text-muted-foreground hover:text-gray-900 dark:text-zinc-900 dark:text-white transition-colors">
                 Just Watch
               </button>
             )}
          </div>

          <LiveLeaderboard challengeId={challenge.id} currentCandidateId={userId} />

          <LiveActivityFeed challengeId={challenge.id} expiresAt={challenge.expires_at} />

          {/* Referral Widget: visible for authenticated entrants */}
          {hasEntered && userId && referralLink && referralCode && (
            <ReferralWidget
              referralUrl={referralLink}
              referralCode={referralCode}
              bonusVotes={bonusVotes}
            />
          )}

       </div>
       
       <ShareSnapshotModal 
         isOpen={isShareModalOpen} 
         onClose={() => setIsShareModalOpen(false)} 
         challengeTitle={challenge.title} 
         timeLimit={challenge.time_limit_minutes} 
         prizeValue={challenge.prize_value}
         entryId={myEntryId || undefined}
         candidateRef={referralCode}
       />
    </div>
  );
}
