import { createClient } from "@/lib/supabase/server";
import { ChallengeCard } from "@/components/forge/ChallengeCard";
import { LeaderboardPreview } from "@/components/forge/LeaderboardPreview";
import Link from "next/link";
import {
  Hammer, Zap, Play, CheckCircle2, Trophy,
  Clock, Target, ArrowRight, Flame
} from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";

export const metadata = {
  title: "The Forge Arena | UpnAbove",
  description: "The world's first public hiring arena. Prove your skills. Win in public. Get hired.",
};

export default async function ForgePage() {
  const supabase = await createClient();

  const { data: liveChallenges } = await supabase
    .from("forge_challenges")
    .select("*")
    .eq("status", "live")
    .order("expires_at", { ascending: true });

  const { data: upcomingChallenges } = await supabase
    .from("forge_challenges")
    .select("id, title, drop_time, challenge_type")
    .eq("status", "scheduled")
    .order("drop_time", { ascending: true })
    .limit(4);

  const { data: completedChallenges } = await supabase
    .from("forge_challenges")
    .select("*")
    .eq("status", "completed")
    .order("expires_at", { ascending: false })
    .limit(3);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { count: submissionsToday } = await supabase
    .from("forge_entries")
    .select("id", { count: "exact", head: true })
    .gte("created_at", today.toISOString());

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const { count: hiresThisMonth } = await supabase
    .from("forge_entries")
    .select("id", { count: "exact", head: true })
    .eq("status", "hired")
    .gte("created_at", monthStart.toISOString());

  const liveCount = liveChallenges?.length ?? 0;

  const howItWorks = [
    {
      icon: Target,
      iconCls: "text-violet-400",
      iconBg: "bg-violet-500/10 border-violet-500/20",
      step: "01",
      title: "Post a Bounty",
      desc: "Companies drop high-stakes engineering or design challenges with real prizes — job offers, cash, equity.",
    },
    {
      icon: Play,
      iconCls: "text-emerald-400",
      iconBg: "bg-emerald-500/10 border-emerald-500/20",
      step: "02",
      title: "Compete Anonymously",
      desc: "You submit under an AI codename. Your identity is fully protected. Only your code speaks.",
    },
    {
      icon: Flame,
      iconCls: "text-amber-400",
      iconBg: "bg-amber-500/10 border-amber-500/20",
      step: "03",
      title: "Rise on the Board",
      desc: "The community votes. AI scores. A live leaderboard ranks every submission in real time.",
    },
    {
      icon: CheckCircle2,
      iconCls: "text-cyan-400",
      iconBg: "bg-cyan-500/10 border-cyan-500/20",
      step: "04",
      title: "Get Hired",
      desc: "Winners are revealed. Trophies awarded. Companies extend direct offers — no applications.",
    },
  ];

  return (
    <div className="relative w-full flex flex-col items-center bg-transparent min-h-screen">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative w-full flex items-center justify-center pt-24 pb-28 overflow-hidden">

        {/* Background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none" />
        <div className="glow-orb-primary top-[-15%] left-[-8%] opacity-60" />
        <div className="glow-orb-cyan bottom-[5%] right-[-8%] opacity-40" />
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[var(--background)] to-transparent pointer-events-none" />

        <div className="section-container relative z-10">
          <div className="max-w-4xl mx-auto text-center">

            {/* Pill */}
            <ScrollReveal delay={0.05} direction="up">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-violet-800/40 bg-violet-500/8 backdrop-blur-md mb-8">
                <Hammer className="w-3.5 h-3.5 text-violet-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-violet-400">The Arena is Open</span>
                {liveCount > 0 && (
                  <>
                    <span className="w-px h-3 bg-violet-800/50" />
                    <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-semibold text-emerald-400">{liveCount} Live</span>
                  </>
                )}
              </div>
            </ScrollReveal>

            {/* Headline */}
            <ScrollReveal delay={0.1} direction="up" duration={0.7}>
              <h1 className="text-[3.5rem] sm:text-[5.5rem] lg:text-[7rem] font-black tracking-tight leading-[0.92] mb-7">
                <span className="text-zinc-500">Stop applying.</span>
                <br />
                <span className="text-gradient">Start forging.</span>
                <br />
                <span className="text-zinc-100">Get discovered.</span>
              </h1>
            </ScrollReveal>

            {/* Subline */}
            <ScrollReveal delay={0.18} direction="up">
              <p className="text-lg sm:text-xl text-zinc-500 max-w-2xl mx-auto mb-10 leading-relaxed">
                Compete anonymously in high-stakes engineering challenges.
                Let your raw output speak — then watch top companies come to you.
              </p>
            </ScrollReveal>

            {/* CTAs */}
            <ScrollReveal delay={0.25} direction="up">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
                <Link href="#live-now">
                  <button className="h-12 px-7 inline-flex items-center gap-2 rounded-xl bg-violet-700 text-white text-sm font-semibold tracking-tight shadow-lg shadow-violet-900/50 hover:bg-violet-600 hover:shadow-violet-700/60 hover:-translate-y-px transition-all duration-200">
                    <Zap className="w-4 h-4" />
                    Enter a Challenge
                  </button>
                </Link>
                <Link href="/employer/forge/create">
                  <button className="h-12 px-7 inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 text-zinc-300 text-sm font-semibold tracking-tight hover:border-zinc-700 hover:text-zinc-100 hover:bg-zinc-800/80 transition-all duration-200">
                    Post a Challenge
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </ScrollReveal>

            {/* Live Stats Bar */}
            <ScrollReveal delay={0.32} direction="up">
              <div className="inline-flex flex-wrap items-center justify-center gap-6 px-8 py-3.5 rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-md text-sm font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-black text-zinc-100">{liveCount}</span>
                  <span className="text-zinc-500 uppercase text-xs tracking-wider">Challenges Live</span>
                </div>
                <div className="w-px h-4 bg-zinc-800" />
                <div className="flex items-center gap-2">
                  <span className="font-black text-emerald-400">{(submissionsToday ?? 0).toLocaleString()}</span>
                  <span className="text-zinc-500 uppercase text-xs tracking-wider">Submissions Today</span>
                </div>
                <div className="w-px h-4 bg-zinc-800 hidden md:block" />
                <div className="hidden md:flex items-center gap-2">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-black text-amber-400">{hiresThisMonth ?? 0}</span>
                  <span className="text-zinc-500 uppercase text-xs tracking-wider">Hires This Month</span>
                </div>
              </div>
            </ScrollReveal>

          </div>
        </div>
      </section>

      {/* ── LIVE NOW ──────────────────────────────────────────────────────── */}
      <section id="live-now" className="relative w-full py-24 scroll-mt-20">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

        <div className="section-container">
          <ScrollReveal delay={0.05} direction="up">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/8 mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Live Now</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-100">
                  Active Challenges
                </h2>
              </div>
              <Link
                href="/forge/feed"
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-violet-400 transition-colors"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </ScrollReveal>

          {!liveChallenges || liveChallenges.length === 0 ? (
            <ScrollReveal delay={0.1} direction="up">
              <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-zinc-800 border-dashed bg-zinc-900/30">
                <div className="w-12 h-12 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-4">
                  <Zap className="w-5 h-5 text-zinc-600" />
                </div>
                <p className="text-zinc-500 font-mono text-sm mb-2">No active challenges right now.</p>
                {upcomingChallenges?.[0]?.drop_time && (
                  <p suppressHydrationWarning className="text-zinc-600 text-xs font-mono">
                    Next drop: {new Date(upcomingChallenges[0].drop_time).toLocaleString()}
                  </p>
                )}
              </div>
            </ScrollReveal>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
              {liveChallenges.map((challenge, i) => (
                <ScrollReveal key={challenge.id} delay={0.08 * i} direction="up">
                  <ChallengeCard challenge={challenge} />
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── UPCOMING + LEADERBOARD ────────────────────────────────────────── */}
      <section className="relative w-full py-24">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* Upcoming Drops */}
            <div className="lg:col-span-2">
              <ScrollReveal delay={0.05} direction="up">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-zinc-100">Upcoming Drops</h3>
                </div>
              </ScrollReveal>

              <div className="space-y-3">
                {!upcomingChallenges || upcomingChallenges.length === 0 ? (
                  <ScrollReveal delay={0.1} direction="up">
                    <div className="py-10 rounded-xl border border-zinc-800 border-dashed bg-zinc-900/30 text-center text-zinc-600 text-sm font-mono">
                      No upcoming drops.
                    </div>
                  </ScrollReveal>
                ) : (
                  upcomingChallenges.map((ch, i) => (
                    <ScrollReveal key={ch.id} delay={0.08 * i} direction="up">
                      <Link
                        href={`/forge/${ch.id}`}
                        className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-800/60 transition-all group"
                      >
                        <div>
                          <p className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors line-clamp-1">{ch.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-wider">{ch.challenge_type}</span>
                            {ch.drop_time && (
                              <>
                                <span className="text-zinc-700">·</span>
                                <span suppressHydrationWarning className="text-[10px] font-mono text-zinc-600">
                                  {new Date(ch.drop_time).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-amber-500/15 bg-amber-500/8">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Soon</span>
                        </div>
                      </Link>
                    </ScrollReveal>
                  ))
                )}
              </div>
            </div>

            {/* Leaderboard Preview */}
            <div className="lg:col-span-3">
              <ScrollReveal delay={0.1} direction="up">
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-zinc-100">Top Performers</h3>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.15} direction="up">
                <LeaderboardPreview />
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="relative w-full py-24">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/8 to-transparent pointer-events-none" />

        <div className="section-container relative z-10">
          <ScrollReveal delay={0.05} direction="up">
            <div className="text-center mb-16">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-600 mb-4">How It Works</p>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-100 mb-4">
                The <span className="text-gradient">Combat Loop</span>
              </h2>
              <p className="text-zinc-500 max-w-lg mx-auto">
                Four steps. One leaderboard. Unlimited opportunity.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {howItWorks.map((step, i) => (
              <ScrollReveal key={step.step} delay={0.08 * i} direction="up">
                <div className="relative flex flex-col p-6 rounded-2xl border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:-translate-y-1 transition-all duration-300 group h-full">
                  {/* Step number */}
                  <span className="absolute top-4 right-5 text-[11px] font-black font-mono text-zinc-700">{step.step}</span>

                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-5 ${step.iconBg}`}>
                    <step.icon className={`w-4.5 h-4.5 ${step.iconCls}`} />
                  </div>
                  <h4 className="text-base font-bold text-zinc-100 mb-2 group-hover:text-white transition-colors">{step.title}</h4>
                  <p className="text-sm text-zinc-500 leading-relaxed">{step.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── HALL OF FAME ─────────────────────────────────────────────────── */}
      {completedChallenges && completedChallenges.length > 0 && (
        <section className="relative w-full py-24">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

          <div className="section-container">
            <ScrollReveal delay={0.05} direction="up">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-amber-500/20 bg-amber-500/8 mb-4">
                    <Trophy className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Hall of Fame</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-100">
                    Completed Challenges
                  </h2>
                </div>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {completedChallenges.map((challenge, i) => (
                <ScrollReveal key={challenge.id} delay={0.08 * i} direction="up">
                  <ChallengeCard challenge={challenge} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── BOTTOM CTA ───────────────────────────────────────────────────── */}
      <section className="relative w-full py-32 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-700/8 blur-[100px] rounded-full pointer-events-none" />

        <div className="section-container relative z-10 text-center">
          <ScrollReveal delay={0.05} direction="up">
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-zinc-100 mb-5">
              Ready to prove<br />
              <span className="text-zinc-600">what you can do?</span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.12} direction="up">
            <p className="text-lg text-zinc-600 max-w-md mx-auto mb-10">
              Join thousands of engineers competing for real opportunities.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2} direction="up">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="#live-now">
                <button className="h-12 px-7 inline-flex items-center gap-2 rounded-xl bg-violet-700 text-white text-sm font-semibold shadow-lg shadow-violet-900/50 hover:bg-violet-600 hover:-translate-y-px transition-all">
                  <Zap className="w-4 h-4" />
                  Enter a Challenge
                </button>
              </Link>
              <Link href="/signup">
                <button className="h-12 px-7 inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 text-zinc-400 text-sm font-semibold hover:border-zinc-700 hover:text-zinc-100 transition-all">
                  Create Free Profile
                </button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

    </div>
  );
}
