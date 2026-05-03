"use client";

import React from "react";
import { SpotlightCard } from "@/components/SpotlightCard";
import { ShieldAlert, Zap, Users, Trophy, Clock, FileText } from "lucide-react";
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

  useEffect(() => {
    if (!userId || !hasEntered) return;
    fetch(`/api/forge/my-entry?challengeId=${challenge.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.id) setMyEntryId(data.id); });
  }, [userId, hasEntered, challenge.id]);

  return (
    <div className="relative">
      {/* Atmospheric background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div className="forge-arena-grid" />
        <div className="forge-orb-coral" />
        <div className="forge-orb-violet" />
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6 pb-32 pt-10" style={{ zIndex: 1 }}>

        {/* ── LEFT COLUMN ─────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Title block */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border bg-[#FF6F61]/10 text-[#FF6F61] border-[#FF6F61]/30 text-[10px] font-black uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF6F61] animate-pulse" />
                Live Arena
              </span>
              {!hasEntered && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border bg-white/5 text-zinc-400 border-white/10 text-[10px] font-bold uppercase tracking-widest">
                  Spectating
                </span>
              )}
              {hasEntered && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Entered
                </span>
              )}
            </div>

            {/* Accent line */}
            <div className="h-px w-full bg-gradient-to-r from-[#FF6F61]/60 via-white/10 to-transparent" />

            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-[1.05] break-words forge-title-glow">
              {challenge.title}
            </h1>
          </div>

          {/* Challenge brief */}
          {challenge.description ? (
            <div className="forge-panel p-7 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-zinc-500">
                <FileText className="w-3.5 h-3.5" />
                Mission Brief
              </div>
              <p className="whitespace-pre-wrap font-mono leading-relaxed text-zinc-300 text-sm">
                {challenge.description}
              </p>
            </div>
          ) : (
            <div className="forge-panel p-7 rounded-2xl flex items-center gap-4 opacity-40">
              <FileText className="w-5 h-5 text-zinc-500 shrink-0" />
              <p className="text-sm font-mono text-zinc-500 uppercase tracking-widest">
                Mission brief not provided
              </p>
            </div>
          )}

          {/* Mission Intel */}
          <div className="forge-panel p-7 rounded-2xl">
            <h3 className="text-[10px] font-black uppercase tracking-[0.35em] text-zinc-500 mb-6">
              Mission Intel
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-1.5">
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                  <Clock className="w-3 h-3" /> Time Limit
                </span>
                <span className="font-black text-white text-2xl font-mono">
                  {challenge.time_limit_minutes}m
                </span>
              </div>
              <div className="space-y-1.5">
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                  <Trophy className="w-3 h-3" /> Bounty
                </span>
                <span className="font-black text-amber-400 text-2xl font-mono">
                  ${challenge.prize_value}
                </span>
              </div>
              <div className="space-y-1.5">
                <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                  <Users className="w-3 h-3" /> Entrants
                </span>
                <span className="font-black text-[#FF6F61] text-2xl font-mono">
                  <LiveEntryCount challengeId={challenge.id} initialCount={challenge.entry_count} />
                </span>
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold block">
                  Spectating
                </span>
                <div className="mt-0.5">
                  <SpectatorPresence challengeId={challenge.id} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT SIDEBAR ────────────────────────────────── */}
        <div className="space-y-4">

          {/* Countdown */}
          <div className="forge-panel rounded-2xl overflow-hidden">
            <div className="px-6 pt-5 pb-1 text-[10px] font-black tracking-[0.3em] uppercase text-zinc-500">
              Time Remaining
            </div>
            <div className="flex items-center justify-center py-6">
              <CountdownTimer targetTime={challenge.expires_at} size="lg" />
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-[#FF6F61]/30 to-transparent" />
            <div className="px-6 py-4 space-y-3">
              <ClientActions challengeId={challenge.id} status={challenge.status} />
              <button
                onClick={() => setIsShareModalOpen(true)}
                className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl font-black uppercase tracking-widest text-xs bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#FF6F61]/30 transition-all text-white"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Share & Rally Votes
              </button>
            </div>
          </div>

          {/* Leaderboard */}
          <LiveLeaderboard challengeId={challenge.id} currentCandidateId={userId} />

          {/* Activity Feed */}
          <LiveActivityFeed challengeId={challenge.id} expiresAt={challenge.expires_at} />

          {/* Referral Widget */}
          {hasEntered && userId && referralLink && referralCode && (
            <ReferralWidget
              referralUrl={referralLink}
              referralCode={referralCode}
              bonusVotes={bonusVotes}
            />
          )}
        </div>
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
