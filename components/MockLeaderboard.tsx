"use client";

import { motion, type Variants } from "framer-motion";
import { Zap, Trophy, TrendingUp } from "lucide-react";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const ENTRIES = [
  { rank: 1, codename: "shadow_wren",   score: 98, barPct: 100, delta: "+3", status: "HIRED",  statusCls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", barCls: "bg-violet-500" },
  { rank: 2, codename: "neon_fox_92",   score: 94, barPct: 96,  delta: "+1", status: "TOP 3%", statusCls: "text-violet-300 bg-violet-500/10 border-violet-500/20",   barCls: "bg-violet-500" },
  { rank: 3, codename: "byte_sentinel", score: 89, barPct: 91,  delta: "+5", status: "HOT",    statusCls: "text-amber-400 bg-amber-500/10 border-amber-500/20",     barCls: "bg-violet-600" },
  { rank: 4, codename: "cipher_rust",   score: 85, barPct: 87,  delta: "—",  status: "ACTIVE", statusCls: "text-zinc-400 bg-zinc-800 border-zinc-700",              barCls: "bg-violet-700" },
  { rank: 5, codename: "null_knight",   score: 79, barPct: 80,  delta: "-1", status: "ACTIVE", statusCls: "text-zinc-400 bg-zinc-800 border-zinc-700",              barCls: "bg-violet-800" },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const rowVariant: Variants = {
  hidden: { opacity: 0, x: -12 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.4, ease: EASE } },
};

export default function MockLeaderboard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
      className="relative w-full max-w-2xl mx-auto rounded-2xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/60"
    >
      {/* Top shimmer */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

      {/* Scan line */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-x-0 h-12 bg-gradient-to-b from-transparent via-violet-500/4 to-transparent"
          style={{ animation: "scan 4s linear infinite" }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-violet-500/15 border border-violet-500/25 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-zinc-100">Live Leaderboard</p>
            <p className="text-[10px] text-zinc-500 font-mono">Q3 · Full-Stack Challenge</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Live</span>
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-[2rem_1fr_5rem_4rem_5rem] gap-3 px-5 py-2.5 border-b border-zinc-800/60">
        {["#", "Competitor", "Score", "Δ", "Status"].map(h => (
          <span key={h} className="text-[10px] font-black uppercase tracking-widest text-zinc-600">{h}</span>
        ))}
      </div>

      {/* Rows */}
      <motion.div variants={container} initial="hidden" animate="show" className="divide-y divide-zinc-800/60">
        {ENTRIES.map((entry) => (
          <motion.div
            key={entry.rank}
            variants={rowVariant}
            className="grid grid-cols-[2rem_1fr_5rem_4rem_5rem] gap-3 px-5 py-3.5 items-center group hover:bg-zinc-800/40 transition-colors"
          >
            {/* Rank */}
            <div className="flex items-center">
              {entry.rank === 1
                ? <Trophy className="w-3.5 h-3.5 text-amber-400" />
                : <span className="text-xs font-black font-mono text-zinc-500">#{entry.rank}</span>
              }
            </div>

            {/* Codename + progress bar */}
            <div className="min-w-0">
              <p className="text-sm font-semibold text-zinc-200 font-mono truncate group-hover:text-white transition-colors">
                {entry.codename}
              </p>
              <div className="mt-1.5 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: `${entry.barPct}%` }}
                  transition={{ duration: 0.8, delay: 0.6 + entry.rank * 0.1, ease: EASE }}
                  className={`h-full rounded-full ${entry.barCls}`}
                />
              </div>
            </div>

            {/* Score */}
            <span className="text-sm font-black font-mono text-zinc-100 tabular-nums">
              {entry.score}<span className="text-zinc-600 text-xs">/100</span>
            </span>

            {/* Delta */}
            <span className={`text-xs font-mono font-semibold tabular-nums ${
              entry.delta.startsWith("+") ? "text-emerald-400" :
              entry.delta.startsWith("-") ? "text-red-400" : "text-zinc-600"
            }`}>
              {entry.delta}
            </span>

            {/* Status */}
            <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border text-center ${entry.statusCls}`}>
              {entry.status}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-800 bg-zinc-950/50">
        <div className="flex items-center gap-1.5 text-zinc-500">
          <TrendingUp className="w-3 h-3" />
          <span className="text-[10px] font-mono">247 competitors · 18 companies watching</span>
        </div>
        <span className="text-[10px] font-mono text-zinc-600">Updated 2s ago</span>
      </div>
    </motion.div>
  );
}
