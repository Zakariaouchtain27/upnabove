"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";

interface HomeHeroProps {
  jobCount: number | null;
}

function AnimatedCount({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView || !value) return;
    const start = Math.max(0, value - 200);
    const duration = 1200;
    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (value - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);

  return <span ref={ref}>{display.toLocaleString()}</span>;
}

const words = ["merit,", "code,", "proof."];

export function HomeHero({ jobCount }: HomeHeroProps) {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setWordIndex(i => (i + 1) % words.length);
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative z-10 w-full min-h-[90vh] flex flex-col justify-center px-5 sm:px-10 pt-28 pb-16">
      <div className="max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-16 items-center">

          {/* Left — editorial headline */}
          <div>
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3 mb-8"
            >
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/5 text-violet-400 text-xs font-medium tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                {jobCount ? `${jobCount.toLocaleString()} jobs live` : "Now live"}
              </span>
              <span className="h-px flex-1 max-w-[60px] bg-zinc-800" />
            </motion.div>

            {/* Headline */}
            <div className="overflow-hidden mb-6">
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="text-[clamp(2.8rem,7vw,5.5rem)] font-bold leading-[1.05] tracking-tight text-white"
              >
                Get hired on
                <br />
                <span className="relative">
                  <motion.span
                    key={wordIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className="text-violet-400 inline-block"
                  >
                    {words[wordIndex]}
                  </motion.span>
                </span>
                {" "}not buzzwords.
              </motion.h1>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg text-zinc-400 font-light leading-relaxed max-w-lg mb-10"
            >
              Search thousands of tech roles. Or enter The Forge — a live coding arena
              where anonymous submissions decide who gets hired.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap gap-3"
            >
              <Link
                href="/jobs"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-100 transition-all duration-200 active:scale-[0.97]"
              >
                Browse Jobs
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/forge"
                className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-zinc-700 bg-zinc-900/60 text-white text-sm font-medium hover:border-zinc-500 hover:bg-zinc-800/80 transition-all duration-200 active:scale-[0.97]"
              >
                <Flame className="w-4 h-4 text-violet-400" />
                Enter the Forge
              </Link>
            </motion.div>
          </div>

          {/* Right — live stats card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:flex flex-col gap-3"
          >
            {/* Jobs stat */}
            <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-950/60 backdrop-blur-sm">
              <p className="text-xs text-zinc-500 uppercase tracking-widest font-medium mb-2">Open positions</p>
              <p className="text-5xl font-bold text-white tabular-nums tracking-tight">
                {jobCount ? <AnimatedCount value={jobCount} /> : "—"}
              </p>
              <p className="text-xs text-zinc-600 mt-1.5 font-light">Updated daily from top sources</p>
            </div>

            {/* Platform features row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-3">
                  <Flame className="w-4 h-4 text-violet-400" />
                </div>
                <p className="text-sm font-medium text-white leading-snug">Live coding arena</p>
                <p className="text-xs text-zinc-600 mt-1 font-light">Anonymous submissions</p>
              </div>
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 16 16">
                    <circle cx="8" cy="8" r="3" fill="currentColor" />
                    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1" opacity="0.4" />
                    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1" opacity="0.2" strokeDasharray="2 2" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-white leading-snug">Real-time results</p>
                <p className="text-xs text-zinc-600 mt-1 font-light">Live leaderboard</p>
              </div>
            </div>

            {/* CTA strip */}
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/40 flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400 font-medium">Post a challenge</p>
                <p className="text-[11px] text-zinc-600 font-light mt-0.5">For companies hiring</p>
              </div>
              <Link
                href="/employer"
                className="text-xs text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1 transition-colors"
              >
                Get started <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="hidden md:flex items-center gap-2 mt-16 text-zinc-700"
        >
          <div className="w-px h-8 bg-zinc-800" />
          <span className="text-xs font-light tracking-widest uppercase">Scroll to explore</span>
        </motion.div>
      </div>
    </section>
  );
}
