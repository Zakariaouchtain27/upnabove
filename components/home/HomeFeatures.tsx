"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Search, Flame, Users } from "lucide-react";

const features = [
  {
    icon: Search,
    iconColor: "text-blue-400",
    iconBg: "bg-blue-500/8 border-blue-500/15",
    tag: "Job Search",
    headline: "Every tech role,\none place.",
    body: "We pull from Remotive, RemoteOK, Arbeitnow, The Muse, and more — plus jobs posted directly by companies. Updated every 24 hours.",
    cta: { label: "Browse jobs", href: "/jobs" },
    stat: { label: "sources aggregated", value: "6+" },
  },
  {
    icon: Flame,
    iconColor: "text-violet-400",
    iconBg: "bg-violet-500/8 border-violet-500/15",
    tag: "The Forge",
    headline: "Prove your skill\nin the arena.",
    body: "Companies post real challenges with real prizes. You compete anonymously under a codename. The leaderboard decides who gets the call.",
    cta: { label: "View challenges", href: "/forge" },
    stat: { label: "anonymous submissions", value: "Live" },
  },
  {
    icon: Users,
    iconColor: "text-emerald-400",
    iconBg: "bg-emerald-500/8 border-emerald-500/15",
    tag: "For Companies",
    headline: "Skip the resume\nstack.",
    body: "Watch candidates solve your actual problems live. Spectator mode lets your whole team watch — anonymously — in real time.",
    cta: { label: "Start hiring", href: "/employer" },
    stat: { label: "watch every keystroke", value: "Live" },
  },
];

function FeatureCard({ feature, index }: { feature: typeof features[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const Icon = feature.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col p-8 rounded-2xl border border-zinc-800/70 bg-zinc-950/40 hover:border-zinc-700/80 hover:bg-zinc-900/50 transition-all duration-300"
    >
      {/* Top */}
      <div className="flex items-start justify-between mb-6">
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${feature.iconBg}`}>
          <Icon className={`w-4.5 h-4.5 ${feature.iconColor}`} strokeWidth={1.75} />
        </div>
        <span className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">{feature.tag}</span>
      </div>

      {/* Headline */}
      <h3 className="text-2xl font-bold text-white leading-tight tracking-tight mb-3 whitespace-pre-line">
        {feature.headline}
      </h3>

      {/* Body */}
      <p className="text-sm text-zinc-500 leading-relaxed flex-1 mb-8 font-light">
        {feature.body}
      </p>

      {/* Bottom */}
      <div className="flex items-end justify-between mt-auto">
        <div>
          <p className="text-3xl font-bold text-white tabular-nums">{feature.stat.value}</p>
          <p className="text-xs text-zinc-600 mt-0.5 font-light">{feature.stat.label}</p>
        </div>
        <Link
          href={feature.cta.href}
          className="group/link inline-flex items-center gap-1.5 text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-150"
        >
          {feature.cta.label}
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5" />
        </Link>
      </div>

      {/* Hover accent line */}
      <div className="absolute bottom-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    </motion.div>
  );
}

export function HomeFeatures() {
  const headingRef = useRef<HTMLDivElement>(null);
  const headingInView = useInView(headingRef, { once: true, margin: "-60px" });

  return (
    <section className="relative z-10 w-full py-24 px-5">
      <div className="max-w-6xl mx-auto">

        {/* Section header */}
        <div ref={headingRef} className="mb-14">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="text-xs text-zinc-600 uppercase tracking-[0.2em] font-medium mb-3"
          >
            The platform
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            animate={headingInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-4xl font-bold text-white tracking-tight max-w-md leading-tight"
          >
            Everything you need to
            {" "}<span className="text-zinc-500">land the role.</span>
          </motion.h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <FeatureCard key={f.tag} feature={f} index={i} />
          ))}
        </div>

        {/* Bottom CTA strip */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 p-6 rounded-2xl border border-dashed border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-5"
        >
          <div>
            <p className="text-base font-semibold text-white">
              Ready to find your next role?
            </p>
            <p className="text-sm text-zinc-500 font-light mt-0.5">
              Create an account in 30 seconds, no credit card required.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link
              href="/signup"
              className="px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-500 transition-colors active:scale-[0.97]"
            >
              Create account
            </Link>
            <Link
              href="/jobs"
              className="px-5 py-2.5 rounded-xl border border-zinc-700 text-zinc-300 text-sm font-medium hover:border-zinc-500 hover:text-white transition-colors active:scale-[0.97]"
            >
              Browse first
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
