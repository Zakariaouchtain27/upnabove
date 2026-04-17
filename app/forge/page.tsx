import { createClient } from "@/lib/supabase/server";
import { ChallengeCard } from "@/components/forge/ChallengeCard";
import { UpcomingDropCard } from "@/components/forge/UpcomingDropCard";
import { LeaderboardPreview } from "@/components/forge/LeaderboardPreview";
import Link from "next/link";
import { Hammer, Zap, Play, CheckCircle2, Trophy, Clock, Target } from "lucide-react";
import Button from "@/components/ui/Button";

export const metadata = {
  title: "The Forge Arena | UpnAbove",
  description: "The world's first public hiring arena. Prove your skills. Win in public. Get hired.",
};

export default async function ForgePage() {
  const supabase = await createClient();

  // Fetch Live Challenges
  const { data: liveChallenges } = await supabase
    .from("forge_challenges")
    .select("*")
    .eq("status", "live")
    .order("expires_at", { ascending: true });

  // Fetch Scheduled Challenges
  const { data: upcomingChallenges } = await supabase
    .from("forge_challenges")
    .select("id, title, drop_time, challenge_type")
    .eq("status", "scheduled")
    .order("drop_time", { ascending: true })
    .limit(3);

  // Fetch Completed Challenges
  const { data: completedChallenges } = await supabase
    .from("forge_challenges")
    .select("*")
    .eq("status", "completed")
    .order("expires_at", { ascending: false })
    .limit(3);

  // The 4 Animated Steps
  const howItWorks = [
    { icon: <Target className="w-8 h-8 text-rose-500" />, title: "1. Post (Employers)", desc: "Companies drop high-stakes design or tech bounties." },
    { icon: <Play className="w-8 h-8 text-primary" />, title: "2. Enter (Talent)", desc: "Compete natively. Your real identity is protected by an AI codename." },
    { icon: <Zap className="w-8 h-8 text-amber-500" />, title: "3. Vote", desc: "The community and AI evaluate submissions on a live leaderboard." },
    { icon: <CheckCircle2 className="w-8 h-8 text-emerald-500" />, title: "4. Hire", desc: "Winners are revealed. Trophies are awarded. Hires are made." },
  ];

  return (
    <div className="layout-wrapper bg-transparent min-h-screen relative overflow-hidden text-foreground">
       {/* Forge Hero Gradient */}
       <div className="absolute inset-x-0 top-0 h-[800px] bg-gradient-to-b from-[#1B365D]/80 via-[#FF6F61]/20 to-transparent pointer-events-none z-[-1]" />
       <div className="absolute inset-0 z-0 bg-grid-pattern opacity-10 pointer-events-none" />

      <section className="section-container pb-24 mt-16 relative z-10 2xl:max-w-[1400px]">
        {/* 1. HERO SECTION */}
        <div className="flex flex-col items-center text-center space-y-6 pt-12 pb-24">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-bold tracking-widest uppercase mb-4 shadow-[0_0_20px_rgba(124,58,237,0.3)]">
              <Hammer className="w-4 h-4" />
              The Arena
           </div>

           <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase drop-shadow-[0_0_30px_rgba(124,58,237,0.4)]">
              THE <span className="bg-gradient-to-br from-primary-light via-primary to-primary-dark text-transparent bg-clip-text">FORGE</span>
           </h1>

           <p className="text-xl md:text-2xl font-medium text-muted-foreground mt-2 font-mono tracking-tight max-w-2xl">
              Prove your skills. Win in public. <span className="text-gray-900 dark:text-white">Get hired.</span>
           </p>

           {/* Live Config Stats Bar */}
           <div className="flex flex-wrap items-center justify-center gap-4 text-sm font-mono mt-8 border border-black/10 dark:border-white/10 bg-gray-100 dark:bg-black/40 px-6 py-3 rounded-2xl shadow-inner backdrop-blur-md">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                 <span className="text-gray-900 dark:text-white font-bold">{liveChallenges?.length || 0}</span>
                 <span className="text-muted-foreground uppercase opacity-80">Challenges Live Now</span>
              </div>
              <span className="text-gray-900/20 dark:text-white/20">|</span>
              <div className="flex items-center gap-2">
                 <span className="text-gray-900 dark:text-white font-bold tracking-widest text-emerald-400">1,240</span>
                 <span className="text-muted-foreground uppercase opacity-80">Submissions Today</span>
              </div>
              <span className="text-gray-900/20 dark:text-white/20 hidden md:block">|</span>
              <div className="flex items-center gap-2 hidden md:flex">
                 <span className="text-gray-900 dark:text-white font-bold tracking-widest text-amber-500">47</span>
                 <span className="text-muted-foreground uppercase opacity-80">Hires this month</span>
              </div>
           </div>

           {/* Hero CTAs */}
           <div className="flex flex-col sm:flex-row items-center gap-4 mt-12 w-full justify-center">
              <Link href="#live-now" className="w-full sm:w-auto">
                 <Button size="lg" className="w-full uppercase tracking-wider glow-on-hover shadow-glow">
                    Enter a Challenge
                 </Button>
              </Link>
              <Button variant="outline" size="lg" className="w-full sm:w-auto uppercase tracking-wider backdrop-blur-sm border-black/20 dark:border-white/20 text-gray-900 dark:text-white hover:bg-black/5 dark:bg-white/5 disabled:opacity-50">
                 Post a Challenge
              </Button>
           </div>
        </div>

        {/* 2. LIVE NOW (Most Prominent) */}
        <div id="live-now" className="scroll-mt-32 mb-32 relative">
           <div className="flex items-center gap-4 mb-8">
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-gray-900 dark:text-white flex items-center gap-4">
                 <span className="text-rose-500 animate-pulse">●</span> Live Now
              </h2>
              <div className="h-px bg-gradient-to-r from-border to-transparent flex-grow hidden md:block" />
           </div>

           {!liveChallenges || liveChallenges.length === 0 ? (
              <div className="bg-[#1B365D]/30 border border-white/10 p-16 rounded-3xl text-center shadow-inner backdrop-blur-md">
                  <div className="font-mono text-2xl text-muted-foreground uppercase tracking-widest mb-4">No Active Bounties</div>
                  <div suppressHydrationWarning className="text-4xl font-black text-white/50">{upcomingChallenges?.[0] ? `NEXT DROP IN ${new Date(upcomingChallenges[0].drop_time).toLocaleTimeString()}` : "STAY TUNED"}</div>
              </div>
           ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
                 {liveChallenges.map(challenge => (
                    <ChallengeCard key={challenge.id} challenge={challenge} />
                 ))}
              </div>
           )}
        </div>

        {/* 3 & 4. UPCOMING AND LEADERBOARD */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-32">
           {/* Section 3: Upcoming Drops */}
           <div className="lg:col-span-1 border border-black/10 dark:border-white/10 bg-gray-100 dark:bg-black/40 rounded-3xl p-8 shadow-inner backdrop-blur-sm">
              <h3 className="text-2xl font-black uppercase tracking-tight text-gray-900 dark:text-white mb-8 border-b border-black/10 dark:border-white/10 pb-4 flex items-center justify-between">
                 Upcoming Drops
                 <Clock className="w-6 h-6 text-muted-foreground" />
              </h3>

              <div className="space-y-4">
                 {!upcomingChallenges || upcomingChallenges.length === 0 ? (
                    <div className="text-muted-foreground font-mono text-sm py-8 text-center bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 border-dashed">No scheduled drops.</div>
                 ) : (
                    upcomingChallenges.map(challenge => (
                       <UpcomingDropCard key={challenge.id} challenge={challenge} />
                    ))
                 )}
              </div>
           </div>

           {/* Section 4: Leaderboard Preview */}
           <div className="lg:col-span-2">
              <LeaderboardPreview />
           </div>
        </div>

        {/* 5. HOW IT WORKS */}
        <div className="mb-32">
           <div className="text-center mb-16">
              <h2 className="text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-white">The Combat Loop</h2>
              <p className="text-muted-foreground font-mono tracking-widest uppercase text-sm mt-4">How it works</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {howItWorks.map((step, idx) => (
                 <div key={idx} className="relative p-8 rounded-2xl bg-surface border border-border flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-black/50 border border-black/10 dark:border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 shadow-lg shadow-black/50 transition-all">
                       {step.icon}
                    </div>
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                 </div>
              ))}
           </div>
        </div>

        {/* 6. COMPLETED CHALLENGES */}
        <div className="relative">
           <div className="flex items-center gap-4 mb-8">
              <h2 className="text-4xl font-black uppercase tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                 Hall of Fame <Trophy className="w-8 h-8 text-amber-500" />
              </h2>
           </div>

           {!completedChallenges || completedChallenges.length === 0 ? (
               <div className="text-center py-24 bg-surface/50 border border-border border-dashed rounded-3xl">
                  <p className="text-muted-foreground font-mono">The Hall of Fame awaits its first champions.</p>
               </div>
           ) : (
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {completedChallenges.map(challenge => (
                     <ChallengeCard key={challenge.id} challenge={challenge} />
                  ))}
               </div>
           )}
        </div>

      </section>
    </div>
  );
}
