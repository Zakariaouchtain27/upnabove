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
             <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-white drop-shadow-[0_0_20px_rgba(255,111,97,0.3)] break-words line-clamp-3">
                {challenge.title}
             </h1>
          </div>

          <SpotlightCard className="wireframe-card p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md prose prose-invert max-w-none">
             <p className="whitespace-pre-wrap font-mono leading-relaxed text-zinc-300">{challenge.description}</p>
          </SpotlightCard>

          <SpotlightCard className="wireframe-card p-8 rounded-3xl bg-black/40 border border-white/5">
             <h3 className="text-xl font-black uppercase tracking-[0.3em] text-white/50 mb-8">Mission Intel</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-8 font-mono text-sm">
                 <div className="border-r border-white/10">
                    <span className="block text-zinc-500 uppercase text-[10px] font-black tracking-widest mb-2">Time Limit</span>
                    <span className="font-black text-white text-2xl">{challenge.time_limit_minutes}m</span>
                 </div>
                 <div className="md:border-r border-white/10 md:pl-4">
                    <span className="block text-zinc-500 uppercase text-[10px] font-black tracking-widest mb-2">Bounty</span>
                    <span className="font-black text-amber-400 text-2xl flex items-center gap-1"><Trophy className="w-5 h-5"/> ${challenge.prize_value}</span>
                 </div>
                 <div className="border-r border-white/10 pl-0 md:pl-4">
                    <span className="block text-zinc-500 uppercase text-[10px] font-black tracking-widest mb-2">Entrants</span>
                    <span className="font-black text-white text-2xl flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary"/> 
                      <LiveEntryCount challengeId={challenge.id} initialCount={challenge.entry_count} />
                    </span>
                 </div>
                 <div className="pl-0 md:pl-4">
                    <span className="block text-zinc-500 uppercase text-[10px] font-black tracking-widest mb-2">Spectating</span>
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
          <div className={`flex flex-col items-center justify-center py-8 rounded-3xl border bg-black/40 border-white/5 relative overflow-hidden group`}>
             <div className="absolute inset-0 bg-[#FF6F61]/5 group-hover:bg-[#FF6F61]/10 transition-colors pointer-events-none" />
             <div className="text-xs font-bold tracking-[0.3em] uppercase mb-4 text-muted-foreground relative z-10">
               TIME REMAINING
             </div>
             <CountdownTimer targetTime={challenge.expires_at} size="lg" />
          </div>

          <div className="flex flex-col gap-3">
             <ClientActions challengeId={challenge.id} status={challenge.status} />
              <button onClick={() => setIsShareModalOpen(true)} className="flex items-center justify-center gap-2 w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white">
                <Zap className="w-4 h-4 text-amber-400" /> Share & Rally Votes
              </button>
             {hasEntered && (
                <button onClick={() => addToast("You are spectating live.", "info")} className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-mono bg-transparent text-zinc-500 hover:text-white transition-colors">
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
