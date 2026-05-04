import Link from "next/link";
import {
  ArrowRight, Zap, Globe, Shield,
  Briefcase, Activity, CheckCircle2, TrendingUp, Clock, Users
} from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { SpotlightCard } from "@/components/SpotlightCard";
import { createClient } from "@/lib/supabase/server";
import { HomeSearchForm } from "@/components/jobs/HomeSearchForm";
import MockLeaderboard from "@/components/MockLeaderboard";

export default async function HomePage() {
  const supabase = await createClient();

  const { count: jobCount }      = await supabase.from('forge_challenges').select('id', { count: 'exact', head: true });
  const { count: employerCount } = await supabase.from('employers').select('id', { count: 'exact', head: true });
  const { count: entryCount }    = await supabase.from('forge_entries').select('id', { count: 'exact', head: true });

  const stats = [
    { label: "Active Challenges",  value: (jobCount      || 0).toLocaleString(), icon: Briefcase },
    { label: "Verified Employers", value: (employerCount || 0).toLocaleString(), icon: Shield },
    { label: "Total Submissions",  value: (entryCount    || 0).toLocaleString(), icon: Clock },
    { label: "Platform Growth",    value: "↑ New",                               icon: TrendingUp },
  ];

  return (
    <div className="relative w-full flex flex-col items-center bg-transparent">

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative w-full min-h-screen flex items-center justify-center pt-28 pb-24 overflow-hidden">

        {/* Background: dot grid + glow orbs */}
        <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none" />
        <div className="glow-orb-primary top-[-10%] left-[-5%] opacity-70" />
        <div className="glow-orb-cyan bottom-[10%] right-[-5%] opacity-60" />
        {/* Horizontal gradient fade at bottom */}
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[var(--background)] to-transparent pointer-events-none" />

        <div className="section-container relative z-10">
          <div className="max-w-4xl mx-auto text-center">

            {/* Live pill */}
            <ScrollReveal delay={0.05} direction="up" duration={0.6}>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-zinc-800 bg-zinc-900/70 backdrop-blur-md mb-8 shadow-sm">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-zinc-400 tracking-wide">The live-action proving ground for elite tech talent</span>
              </div>
            </ScrollReveal>

            {/* Headline */}
            <ScrollReveal delay={0.1} direction="up" duration={0.7}>
              <h1 className="text-[3.25rem] sm:text-[5rem] lg:text-[6rem] font-black tracking-tight leading-[0.95] mb-7">
                <span className="text-zinc-500">Stop applying.</span>
                <br />
                <span className="text-gradient">Start proving.</span>
                <br />
                <span className="text-zinc-100">Get hired.</span>
              </h1>
            </ScrollReveal>

            {/* Subline */}
            <ScrollReveal delay={0.18} direction="up" duration={0.7}>
              <p className="text-lg sm:text-xl text-zinc-500 max-w-2xl mx-auto mb-10 leading-relaxed">
                Compete anonymously in high-stakes engineering challenges.
                Let your raw output speak — then watch top companies come to you.
              </p>
            </ScrollReveal>

            {/* CTAs */}
            <ScrollReveal delay={0.25} direction="up" duration={0.7}>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
                <Link href="/forge">
                  <button className="h-12 px-7 inline-flex items-center gap-2 rounded-xl bg-violet-700 text-white text-sm font-semibold tracking-tight shadow-lg shadow-violet-900/50 hover:bg-violet-600 hover:shadow-violet-700/60 hover:-translate-y-px transition-all duration-200">
                    <Zap className="w-4 h-4" />
                    Enter the Forge
                  </button>
                </Link>
                <Link href="/jobs">
                  <button className="h-12 px-7 inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 text-zinc-300 text-sm font-semibold tracking-tight hover:border-zinc-700 hover:text-zinc-100 hover:bg-zinc-800/80 transition-all duration-200">
                    Browse Jobs
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </div>
            </ScrollReveal>

            {/* Search */}
            <ScrollReveal delay={0.32} direction="up" duration={0.7}>
              <HomeSearchForm />
            </ScrollReveal>

          </div>
        </div>
      </section>

      {/* ─── LIVE LEADERBOARD MOCKUP ──────────────────────────────────────── */}
      <section className="relative w-full py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/10 to-transparent pointer-events-none" />

        <div className="section-container relative z-10">
          <ScrollReveal delay={0.1} direction="up">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-800/40 bg-violet-500/8 mb-5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest text-violet-400">The Arena is Open</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-100 mb-4">
                Compete.<span className="text-gradient"> Rank.</span> Get discovered.
              </h2>
              <p className="text-zinc-500 max-w-xl mx-auto text-lg">
                Every submission is anonymous. Your code does the talking.
                Top performers get direct interview offers — no applications.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2} direction="up">
            <MockLeaderboard />
          </ScrollReveal>
        </div>
      </section>

      {/* ─── FEATURES BENTO ───────────────────────────────────────────────── */}
      <section className="relative w-full py-24">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

        <div className="section-container">
          <ScrollReveal delay={0.05} direction="up">
            <div className="mb-16">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-600 mb-4">Why UpnAbove</p>
              <h2 className="text-3xl sm:text-5xl font-black text-zinc-100 tracking-tight mb-5">
                Built for <span className="text-gradient">modern careers</span>
              </h2>
              <p className="text-zinc-500 max-w-lg text-lg">
                Everything you need to discover, prove yourself, and land the roles you actually want.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <ScrollReveal delay={0.1} direction="up" className="md:col-span-2 h-full">
              <SpotlightCard className="wireframe-card p-8 flex flex-col justify-between group h-full">
                <div className="mb-8">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-5">
                    <Zap className="w-4.5 h-4.5 text-violet-400" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-100 tracking-tight mb-3">Intelligent Matching Engine</h3>
                  <p className="text-zinc-500 leading-relaxed max-w-md">
                    Proprietary algorithms match your verified Forge scores against what each company actually needs — not keyword soup.
                  </p>
                </div>
                <div className="relative w-full h-40 rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden flex items-center justify-center group-hover:border-zinc-700 transition-colors">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.08),transparent_70%)]" />
                  <div className="flex items-center gap-8 relative z-10">
                    <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center animate-soft-pulse">
                      <Users className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div className="flex gap-1.5">
                      {[0, 150, 300].map(delay => (
                        <div key={delay} className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" style={{ animationDelay: `${delay}ms` }} />
                      ))}
                    </div>
                    <div className="w-14 h-14 rounded-xl bg-violet-500/10 border border-violet-500/25 flex items-center justify-center animate-soft-pulse" style={{ animationDelay: '400ms' }}>
                      <Briefcase className="w-5 h-5 text-violet-400" />
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            </ScrollReveal>

            <ScrollReveal delay={0.15} direction="up" className="h-full">
              <SpotlightCard className="wireframe-card p-8 group h-full">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-5">
                  <Globe className="w-4 h-4 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-zinc-100 tracking-tight mb-3">Borderless Access</h3>
                <p className="text-zinc-500 leading-relaxed mb-8">
                  Remote-first roles, visa sponsorships, relocation packages — filter instantly.
                </p>
                <div className="relative w-full h-36 rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden p-5">
                  <div className="absolute top-3 right-3 text-[9px] font-mono text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded-full">GLOBAL</div>
                  <div className="mt-7 space-y-2.5">
                    {[80, 60, 92].map((w, i) => (
                      <div key={i} className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500/50 rounded-full transition-all" style={{ width: `${w}%` }} />
                      </div>
                    ))}
                  </div>
                </div>
              </SpotlightCard>
            </ScrollReveal>

            <ScrollReveal delay={0.2} direction="up" className="h-full">
              <SpotlightCard className="wireframe-card p-8 group h-full">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
                  <Shield className="w-4 h-4 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-zinc-100 tracking-tight mb-3">Verified Employers</h3>
                <p className="text-zinc-500 leading-relaxed">
                  Every company undergoes rigorous verification. No ghost jobs, no recruiters farming emails.
                </p>
              </SpotlightCard>
            </ScrollReveal>

            <ScrollReveal delay={0.25} direction="up" className="md:col-span-2 h-full">
              <SpotlightCard className="wireframe-card p-8 relative overflow-hidden group h-full">
                <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-violet-500/6 to-transparent pointer-events-none" />
                <div className="relative z-10 w-full md:w-1/2">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-5">
                    <Activity className="w-4 h-4 text-zinc-300" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-100 tracking-tight mb-3">Real-time Salary Insights</h3>
                  <p className="text-zinc-500 leading-relaxed mb-7">
                    Verified compensation data for your specific role and location — before you apply.
                  </p>
                  <div className="space-y-3">
                    {["Equity breakdowns", "Bonus structures", "Cost of living adjustments"].map(item => (
                      <div key={item} className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-sm text-zinc-400">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </SpotlightCard>
            </ScrollReveal>

          </div>
        </div>
      </section>

      {/* ─── STATS ────────────────────────────────────────────────────────── */}
      <section className="w-full py-24 border-y border-zinc-900">
        <div className="section-container">
          <div className="grid md:grid-cols-4 gap-10 divide-y md:divide-y-0 md:divide-x divide-zinc-900 text-center md:text-left">
            {stats.map((stat, i) => (
              <ScrollReveal key={stat.label} delay={i * 0.08} direction="up" className={`pt-8 md:pt-0 ${i !== 0 ? 'md:pl-10' : ''}`}>
                <div className="mb-3 flex justify-center md:justify-start">
                  <stat.icon className="w-5 h-5 text-violet-500" />
                </div>
                <div className="text-4xl lg:text-5xl font-black text-zinc-100 tracking-tight mb-1">{stat.value}</div>
                <div className="text-sm text-zinc-600 font-medium">{stat.label}</div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── BOTTOM CTA ───────────────────────────────────────────────────── */}
      <section className="relative w-full py-40 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-violet-700/8 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />

        <div className="section-container relative z-10 text-center">
          <ScrollReveal delay={0.05} direction="up">
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-zinc-100 mb-6">
              Your next chapter<br />
              <span className="text-zinc-600">starts right now.</span>
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.12} direction="up">
            <p className="text-xl text-zinc-600 max-w-xl mx-auto mb-12">
              Join the network of top-tier engineers and the companies building tomorrow.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.2} direction="up">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/jobs">
                <button className="h-12 px-7 inline-flex items-center gap-2 rounded-xl bg-violet-700 text-white text-sm font-semibold shadow-lg shadow-violet-900/50 hover:bg-violet-600 hover:shadow-violet-700/60 hover:-translate-y-px transition-all duration-200">
                  Explore Opportunities
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/signup">
                <button className="h-12 px-7 inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 text-zinc-400 text-sm font-semibold hover:border-zinc-700 hover:text-zinc-100 hover:bg-zinc-800/80 transition-all duration-200">
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
