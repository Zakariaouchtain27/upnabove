"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, DollarSign, Zap, ArrowRight } from "lucide-react";
import { ChallengeCard, type ForgeChallenge } from "@/components/forge/ChallengeCard";
import { BountyCard } from "@/components/forge/BountyCard";
import { ScrollReveal } from "@/components/ScrollReveal";
import Link from "next/link";

type Mode = "hiring" | "bounty";

interface Props {
  liveChallenges: ForgeChallenge[];
  completedChallenges: ForgeChallenge[];
}

export function ForgeArenaClient({ liveChallenges, completedChallenges }: Props) {
  const [mode, setMode] = useState<Mode>("hiring");

  const liveHiring = liveChallenges.filter(c => (c as any).purpose !== "bounty");
  const liveBounties = liveChallenges.filter(c => (c as any).purpose === "bounty");

  const activeList = mode === "hiring" ? liveHiring : liveBounties;

  const modes = [
    {
      id: "hiring" as Mode,
      icon: Briefcase,
      label: "The Draft",
      sublabel: "Hiring Challenges",
      desc: "Compete for real job offers. Prove your skills anonymously and get hired by top companies.",
      accentCls: "text-violet-400",
      borderActive: "border-violet-500/40 bg-violet-500/8",
      borderInactive: "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700",
      glowActive: "shadow-[0_0_40px_-10px_rgba(124,58,237,0.35)]",
      dotCls: "bg-violet-400",
      count: liveHiring.length,
    },
    {
      id: "bounty" as Mode,
      icon: DollarSign,
      label: "The Board",
      sublabel: "Bounty Challenges",
      desc: "Complete cash-rewarded missions. Funds held in escrow — guaranteed payout when you win.",
      accentCls: "text-emerald-400",
      borderActive: "border-emerald-500/40 bg-emerald-500/8",
      borderInactive: "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700",
      glowActive: "shadow-[0_0_40px_-10px_rgba(16,185,129,0.35)]",
      dotCls: "bg-emerald-400",
      count: liveBounties.length,
    },
  ];

  return (
    <>
      {/* ── MODE SELECTOR ──────────────────────────────────────────────── */}
      <section className="relative w-full py-16">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
        <div className="section-container">
          <ScrollReveal delay={0.05} direction="up">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-600 text-center mb-6">Choose Your Arena</p>
          </ScrollReveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {modes.map((m) => {
              const isActive = mode === m.id;
              return (
                <ScrollReveal key={m.id} delay={m.id === "hiring" ? 0.08 : 0.14} direction="up">
                  <motion.button
                    onClick={() => setMode(m.id)}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                    className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                      isActive
                        ? `${m.borderActive} ${m.glowActive}`
                        : m.borderInactive
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="arena-glow"
                        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-current to-transparent opacity-60"
                        style={{ color: m.id === "hiring" ? "#8b5cf6" : "#10b981" }}
                      />
                    )}
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${
                        isActive
                          ? m.id === "hiring"
                            ? "bg-violet-500/15 border-violet-500/30"
                            : "bg-emerald-500/15 border-emerald-500/30"
                          : "bg-zinc-800 border-zinc-700"
                      }`}>
                        <m.icon className={`w-5 h-5 ${isActive ? m.accentCls : "text-zinc-500"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-base font-black tracking-tight ${isActive ? "text-zinc-100" : "text-zinc-400"}`}>
                            {m.label}
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                            isActive
                              ? m.id === "hiring"
                                ? "text-violet-400 border-violet-500/20 bg-violet-500/10"
                                : "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
                              : "text-zinc-600 border-zinc-700 bg-zinc-800"
                          }`}>
                            {m.sublabel}
                          </span>
                        </div>
                        <p className={`text-xs leading-relaxed ${isActive ? "text-zinc-400" : "text-zinc-600"}`}>
                          {m.desc}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0">
                        {m.count > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${m.dotCls}`} />
                            <span className={`text-xs font-black font-mono ${m.accentCls}`}>{m.count}</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-zinc-700 font-mono">0 live</span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── LIVE CHALLENGES ────────────────────────────────────────────── */}
      <section id="live-now" className="relative w-full py-16 scroll-mt-20">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
        <div className="section-container">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-4 ${
                mode === "hiring"
                  ? "border-violet-500/20 bg-violet-500/8"
                  : "border-emerald-500/20 bg-emerald-500/8"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${mode === "hiring" ? "bg-violet-400" : "bg-emerald-400"}`} />
                <span className={`text-xs font-bold uppercase tracking-widest ${mode === "hiring" ? "text-violet-400" : "text-emerald-400"}`}>
                  Live Now
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-100">
                {mode === "hiring" ? "Active Challenges" : "Open Bounties"}
              </h2>
            </div>
            <Link
              href="/forge/feed"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-violet-400 transition-colors"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              {activeList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-zinc-800 border-dashed bg-zinc-900/30">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-4">
                    <Zap className="w-5 h-5 text-zinc-600" />
                  </div>
                  <p className="text-zinc-500 font-mono text-sm mb-3">
                    No active {mode === "hiring" ? "challenges" : "bounties"} right now.
                  </p>
                  {mode === "bounty" && (
                    <Link href="/employer/forge/create">
                      <button className="h-9 px-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 text-white text-xs font-semibold hover:bg-emerald-600 transition-all">
                        <DollarSign className="w-3.5 h-3.5" />
                        Post a Bounty
                      </button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
                  {activeList.map((challenge, i) => (
                    <motion.div
                      key={challenge.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06, duration: 0.2 }}
                    >
                      {mode === "bounty" ? (
                        <BountyCard challenge={{
                          id: challenge.id,
                          title: challenge.title,
                          status: challenge.status,
                          challenge_type: challenge.challenge_type,
                          difficulty: challenge.difficulty,
                          bounty_amount: (challenge as any).bounty_amount ?? null,
                          escrow_status: (challenge as any).escrow_status ?? null,
                          expires_at: challenge.expires_at ?? null,
                          drop_time: challenge.drop_time ?? null,
                          entry_count: challenge.entry_count ?? null,
                          sponsor_name: challenge.sponsor_name ?? null,
                          sponsor_logo_url: challenge.sponsor_logo_url ?? null,
                          description: challenge.description ?? null,
                        }} />
                      ) : (
                        <ChallengeCard challenge={challenge} />
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>
    </>
  );
}
