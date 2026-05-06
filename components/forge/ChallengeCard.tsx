"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Trophy, Users, ArrowRight, Crown, Zap } from "lucide-react";
import type { ChallengeStatus } from "@/lib/forge";
import { CountdownTimer } from "@/components/forge/CountdownTimer";
import { LiveEntryCount } from "@/components/forge/LiveEntryCount";
import { Database } from "@/lib/database.types";

type BaseChallenge = Database['public']['Tables']['forge_challenges']['Row'];

export interface ForgeChallenge extends Omit<BaseChallenge, 'difficulty' | 'status' | 'prize_type'> {
  difficulty: "junior" | "mid" | "senior" | string;
  status: ChallengeStatus | string;
  sponsor_logo_url?: string | null;
  prize_type?: string;
}

const difficultyConfig = {
  junior:  { cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", label: "Junior"  },
  mid:     { cls: "bg-blue-500/10 text-blue-400 border-blue-500/20",          label: "Mid"     },
  senior:  { cls: "bg-violet-500/10 text-violet-400 border-violet-500/20",    label: "Senior"  },
};

const statusConfig = {
  live:      { cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", dot: "bg-emerald-400", label: "Live" },
  scheduled: { cls: "bg-amber-500/10 text-amber-400 border-amber-500/20",       dot: "bg-amber-400",   label: "Soon" },
  completed: { cls: "bg-zinc-800 text-zinc-400 border-zinc-700",                dot: "bg-zinc-500",    label: "Ended" },
  judging:   { cls: "bg-violet-500/10 text-violet-400 border-violet-500/20",    dot: "bg-violet-400",  label: "Judging" },
};

export function ChallengeCard({ challenge }: { challenge: ForgeChallenge }) {
  const targetDate = challenge.status === "scheduled" ? challenge.drop_time : challenge.expires_at;
  const diff = difficultyConfig[challenge.difficulty as keyof typeof difficultyConfig] || difficultyConfig.mid;
  const stat = statusConfig[challenge.status as keyof typeof statusConfig] || statusConfig.scheduled;
  const isLive = challenge.status === "live";
  const isSponsored = challenge.is_sponsored;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className="h-full"
    >
      <Link
        href={`/forge/${challenge.id}`}
        className={`group flex flex-col h-full rounded-2xl border p-6 relative overflow-hidden transition-all duration-300 ${
          isSponsored
            ? "border-amber-500/25 bg-zinc-900/80 hover:border-amber-400/40 hover:shadow-[0_0_32px_-8px_rgba(245,158,11,0.25)]"
            : isLive
              ? "border-violet-500/20 bg-zinc-900/80 hover:border-violet-400/35 hover:shadow-[0_0_32px_-8px_rgba(124,58,237,0.25)]"
              : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:shadow-lg hover:shadow-black/40"
        }`}
      >
        {/* Top shimmer */}
        <div className={`absolute inset-x-0 top-0 h-px ${isSponsored ? "bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" : isLive ? "bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" : "bg-gradient-to-r from-transparent via-zinc-700/40 to-transparent"}`} />

        {/* Subtle radial glow */}
        {(isLive || isSponsored) && (
          <div className={`absolute inset-0 ${isSponsored ? "bg-[radial-gradient(ellipse_at_top,rgba(245,158,11,0.05),transparent_60%)]" : "bg-[radial-gradient(ellipse_at_top,rgba(124,58,237,0.06),transparent_60%)]"} pointer-events-none`} />
        )}

        {/* Header */}
        <div className="relative flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold overflow-hidden flex-shrink-0 border ${isSponsored ? "bg-zinc-800 border-amber-500/25" : "bg-zinc-800 border-zinc-700"}`}>
              {challenge.sponsor_logo_url ? (
                <img src={challenge.sponsor_logo_url} alt={challenge.sponsor_name || ""} className="w-full h-full object-cover" />
              ) : (
                <span className={isSponsored ? "text-amber-400" : "text-zinc-300"}>
                  {challenge.sponsor_name ? challenge.sponsor_name.charAt(0).toUpperCase() : "U"}
                </span>
              )}
            </div>
            <div>
              <p className={`text-xs font-bold tracking-wide mb-1 ${isSponsored ? "text-amber-400" : "text-zinc-400"}`}>
                {challenge.sponsor_name || "UpnAbove"}
              </p>
              <div className="flex items-center gap-1.5">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border ${diff.cls}`}>
                  {diff.label}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border bg-zinc-800 text-zinc-400 border-zinc-700">
                  {challenge.challenge_type}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5">
            {isSponsored && (
              <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                <Crown className="w-2.5 h-2.5" /> Sponsored
              </span>
            )}
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${stat.cls}`}>
              {isLive && <span className={`w-1.5 h-1.5 rounded-full ${stat.dot} animate-pulse`} />}
              {stat.label}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className={`text-xl font-black leading-tight line-clamp-2 mb-5 transition-colors ${isSponsored ? "text-zinc-100 group-hover:text-amber-300" : "text-zinc-100 group-hover:text-white"}`}>
          {challenge.title}
        </h3>

        {/* Countdown */}
        <div className={`flex flex-col items-center justify-center py-5 rounded-xl border mb-5 min-h-[120px] ${isSponsored ? "bg-zinc-950/60 border-amber-500/15" : isLive ? "bg-zinc-950/60 border-violet-500/15" : "bg-zinc-950/40 border-zinc-800"}`}>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">
            {challenge.status === "scheduled" ? "Drops In" : "Time Remaining"}
          </p>
          <CountdownTimer targetTime={targetDate} size="md" />
        </div>

        <div className="flex-1" />

        {/* Footer */}
        <div className={`flex items-center justify-between pt-4 border-t ${isSponsored ? "border-amber-500/10" : "border-zinc-800/80"}`}>
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-sm">
              <Trophy className={`w-3.5 h-3.5 ${isSponsored ? "text-amber-400" : "text-amber-500"}`} />
              <span className={`font-bold text-sm ${isSponsored ? "text-amber-300" : "text-zinc-100"}`}>
                {challenge.prize_type === "Job Offer"
                  ? "Job Offer"
                  : `$${(challenge.prize_value || 0).toLocaleString()}`}
              </span>
              <span className="text-zinc-600 text-xs">
                {challenge.prize_type === "Job Offer" ? "" : challenge.prize_type || "Prize"}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <Users className="w-3.5 h-3.5 text-zinc-600" />
              <span className="font-bold text-zinc-300 text-xs flex items-center gap-1">
                <LiveEntryCount challengeId={challenge.id} initialCount={challenge.entry_count || 0} />
                <span className="font-normal text-zinc-600">entries</span>
              </span>
            </div>
          </div>

          <div className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            isSponsored
              ? "bg-amber-500/10 border border-amber-500/20 text-amber-300 group-hover:bg-amber-500/20"
              : isLive
                ? "bg-violet-700 text-white group-hover:bg-violet-600 shadow-lg shadow-violet-900/40"
                : "bg-zinc-800 border border-zinc-700 text-zinc-300 group-hover:border-zinc-600"
          }`}>
            {isLive ? (
              <>
                <Zap className="w-3.5 h-3.5" />
                Enter
              </>
            ) : (
              <>
                View
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
