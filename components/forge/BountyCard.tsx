"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, ShieldCheck, DollarSign, Users, ArrowRight, Zap, Clock } from "lucide-react";
import { CountdownTimer } from "@/components/forge/CountdownTimer";
import { LiveEntryCount } from "@/components/forge/LiveEntryCount";

interface BountyChallenge {
  id: string;
  title: string;
  status: string;
  challenge_type: string;
  difficulty: string;
  bounty_amount: number | null;
  escrow_status: "pending" | "funded" | "released" | "refunded" | null;
  expires_at: string | null;
  drop_time: string | null;
  entry_count: number | null;
  sponsor_name?: string | null;
  sponsor_logo_url?: string | null;
  description?: string | null;
}

const escrowConfig = {
  funded:   { label: "Funds Secured",  icon: ShieldCheck, cls: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10" },
  pending:  { label: "Escrow Pending", icon: Clock,        cls: "text-amber-400 border-amber-500/30 bg-amber-500/10"    },
  released: { label: "Paid Out",       icon: DollarSign,   cls: "text-blue-400 border-blue-500/30 bg-blue-500/10"       },
  refunded: { label: "Refunded",       icon: Lock,         cls: "text-zinc-400 border-zinc-600 bg-zinc-800"             },
};

const difficultyLabel: Record<string, string> = {
  junior: "Junior", mid: "Mid", senior: "Senior",
};

export function BountyCard({ challenge }: { challenge: BountyChallenge }) {
  const isLive = challenge.status === "live";
  const escrow = escrowConfig[challenge.escrow_status ?? "pending"];
  const EscrowIcon = escrow.icon;
  const targetDate = isLive ? challenge.expires_at : challenge.drop_time;
  const amount = challenge.bounty_amount ?? 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className="h-full"
    >
      <Link
        href={`/forge/${challenge.id}`}
        className={`group flex flex-col h-full rounded-2xl border p-6 relative overflow-hidden transition-all duration-300 ${
          isLive
            ? "border-emerald-500/25 bg-zinc-900/80 hover:border-emerald-400/40 hover:shadow-[0_0_40px_-8px_rgba(16,185,129,0.3)]"
            : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:shadow-lg"
        }`}
      >
        {/* Top shimmer */}
        <div className={`absolute inset-x-0 top-0 h-px ${
          isLive
            ? "bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent"
            : "bg-gradient-to-r from-transparent via-zinc-700/40 to-transparent"
        }`} />

        {/* Radial glow */}
        {isLive && (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.07),transparent_60%)] pointer-events-none" />
        )}

        {/* Header */}
        <div className="relative flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold overflow-hidden flex-shrink-0 border border-emerald-500/20 bg-zinc-800">
              {challenge.sponsor_logo_url ? (
                <img src={challenge.sponsor_logo_url} alt={challenge.sponsor_name ?? ""} className="w-full h-full object-cover" />
              ) : (
                <DollarSign className="w-4 h-4 text-emerald-400" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold tracking-wide text-emerald-400 mb-1">
                {challenge.sponsor_name ?? "Open Bounty"}
              </p>
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border bg-zinc-800 text-zinc-400 border-zinc-700">
                  {difficultyLabel[challenge.difficulty] ?? challenge.difficulty}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border bg-zinc-800 text-zinc-400 border-zinc-700">
                  {challenge.challenge_type}
                </span>
              </div>
            </div>
          </div>

          <span className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${escrow.cls}`}>
            <EscrowIcon className="w-3 h-3" />
            {escrow.label}
          </span>
        </div>

        {/* Bounty amount — hero element */}
        <div className="relative flex items-center justify-center py-5 rounded-xl border border-emerald-500/20 bg-emerald-950/30 mb-4">
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-600 mb-1">Cash Bounty</p>
            <div className="flex items-end justify-center gap-1">
              <span className="text-4xl font-black text-emerald-400 tracking-tight drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                ${amount.toLocaleString()}
              </span>
              <span className="text-sm text-emerald-600 font-bold mb-1">USD</span>
            </div>
            {challenge.escrow_status === "funded" && (
              <div className="flex items-center justify-center gap-1 mt-1">
                <Lock className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] text-emerald-500 font-bold">In escrow · guaranteed</span>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-black leading-tight line-clamp-2 mb-4 text-zinc-100 group-hover:text-emerald-300 transition-colors">
          {challenge.title}
        </h3>

        {/* Countdown */}
        <div className="flex flex-col items-center justify-center py-3 rounded-xl border border-emerald-500/10 bg-zinc-950/40 mb-4 min-h-[64px]">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">
            {isLive ? "Deadline" : "Drops In"}
          </p>
          <CountdownTimer targetTime={targetDate} size="md" />
        </div>

        <div className="flex-1" />

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-emerald-500/10">
          <div className="flex items-center gap-1.5 text-xs">
            <Users className="w-3.5 h-3.5 text-zinc-600" />
            <span className="font-bold text-zinc-300">
              <LiveEntryCount challengeId={challenge.id} initialCount={challenge.entry_count ?? 0} />
            </span>
            <span className="text-zinc-600">competing</span>
          </div>

          <div className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
            isLive
              ? "bg-emerald-600 text-white group-hover:bg-emerald-500 shadow-lg shadow-emerald-900/40"
              : "bg-zinc-800 border border-zinc-700 text-zinc-300 group-hover:border-zinc-600"
          }`}>
            {isLive ? (
              <><Zap className="w-3.5 h-3.5" /> Claim Bounty</>
            ) : (
              <>View <ArrowRight className="w-3.5 h-3.5" /></>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
