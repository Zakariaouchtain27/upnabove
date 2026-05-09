"use client";

import { motion } from "framer-motion";
import { Eye, Zap, BrainCircuit, ArrowRight } from "lucide-react";
import Link from "next/link";

interface BentoCardProps {
  icon: React.ReactNode;
  label: string;
  title: string;
  description: string;
  colSpan?: string;
  rowSpan?: string;
  accent?: string;
}

function BentoCard({ icon, label, title, description, colSpan = "", rowSpan = "", accent = "from-violet-500/20" }: BentoCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className={`group relative flex flex-col justify-between p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-sm hover:border-zinc-700 hover:bg-zinc-900/60 transition-colors duration-300 overflow-hidden ${colSpan} ${rowSpan}`}
    >
      <div className={`absolute top-0 left-0 w-48 h-48 bg-gradient-to-br ${accent} to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-1/2 -translate-y-1/2`} />

      <div className="relative z-10 flex flex-col h-full gap-4">
        <div className="flex items-start justify-between">
          <div className="p-2.5 rounded-xl bg-white/5 border border-white/8 w-fit">
            {icon}
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">{label}</span>
        </div>

        <div className="mt-auto space-y-2">
          <h3 className="text-base font-semibold text-zinc-100 leading-snug">{title}</h3>
          <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

interface BentoGridProps {
  jobCount: number | null;
}

export function BentoGrid({ jobCount }: BentoGridProps) {
  return (
    <div className="w-full max-w-5xl mx-auto px-5">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 50, damping: 18, delay: 0.7 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-3"
      >
        <div className="md:col-span-2">
          <BentoCard
            icon={<Eye className="w-5 h-5 text-violet-400" />}
            label="Live Arena"
            title="Live Spectator Mode"
            description="Watch the world's best engineers solve real challenges in real-time. Every keystroke is live. Every submission is visible."
            accent="from-violet-500/20"
          />
        </div>

        <BentoCard
          icon={<Zap className="w-5 h-5 text-amber-400" />}
          label="Infrastructure"
          title="Zero-Latency WebSockets"
          description="Sub-50ms sync across every spectator, globally. No refresh. No lag. Just pure real-time."
          accent="from-amber-500/15"
        />

        <BentoCard
          icon={<BrainCircuit className="w-5 h-5 text-cyan-400" />}
          label="AI Engine"
          title="Semantic AI Matchmaking"
          description="Our model goes beyond keywords. It reads intent, patterns, and problem-solving style to surface the right opportunities."
          accent="from-cyan-500/15"
        />

        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="group relative flex flex-col justify-between p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-sm hover:border-zinc-700 hover:bg-zinc-900/60 transition-colors duration-300 overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-emerald-500/15 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-1/2 -translate-y-1/2" />
          <div className="relative z-10">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">Live Now</span>
            <div className="mt-4">
              <span className="text-5xl font-black text-zinc-100 tabular-nums">
                {jobCount ? jobCount.toLocaleString() : "—"}
              </span>
              <p className="text-sm text-zinc-500 mt-1">open positions right now</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="group relative flex flex-col justify-between p-6 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-sm hover:border-zinc-700 hover:bg-zinc-900/60 transition-colors duration-300 overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-violet-500/20 to-transparent rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-1/2 -translate-y-1/2" />
          <div className="relative z-10 flex flex-col h-full justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-600">Employers</span>
            <div className="mt-4 space-y-3">
              <p className="text-sm text-zinc-400 leading-relaxed">
                Skip the resume stack. Watch talent prove themselves live.
              </p>
              <Link
                href="/employer/jobs/create"
                className="inline-flex items-center gap-2 text-sm font-medium text-zinc-100 hover:text-white transition-colors group/link"
              >
                Post a challenge
                <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
