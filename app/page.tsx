import Link from "next/link";
import { 
  ArrowRight, Zap, Globe, Shield,
  Briefcase, Activity, CheckCircle2, TrendingUp, Clock
} from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { SpotlightCard } from "@/components/SpotlightCard";
import { createClient } from "@/lib/supabase/server";
import { HomeSearchForm } from "@/components/jobs/HomeSearchForm";

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch real stats
  const { count: jobCount } = await supabase.from('forge_challenges').select('id', { count: 'exact', head: true });
  const { count: employerCount } = await supabase.from('employers').select('id', { count: 'exact', head: true });
  const { count: entryCount } = await supabase.from('forge_entries').select('id', { count: 'exact', head: true });

  const stats = [
    { label: "Active Challenges", value: (jobCount || 0).toLocaleString(), icon: <Briefcase /> },
    { label: "Verified Employers", value: (employerCount || 0).toLocaleString(), icon: <Shield /> },
    { label: "Total Submissions", value: (entryCount || 0).toLocaleString(), icon: <Clock /> },
    { label: "Platform Growth", value: "New", icon: <TrendingUp /> }
  ];

  return (
    <div className="relative w-full flex flex-col items-center bg-transparent">
      
      {/* ===== HERO SECTION ===== */}
      <section className="relative w-full min-h-screen flex items-center justify-center pt-32 pb-20 overflow-hidden bg-transparent">
        
        <div className="section-container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            
            <ScrollReveal delay={0.1} direction="up" duration={0.8}>
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-surface/50 backdrop-blur-md mb-8 shadow-sm">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm font-medium text-foreground">The premier network for global talent</span>
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay={0.2} direction="up" duration={0.8}>
              <h1 className="text-5xl sm:text-7xl lg:text-[5.5rem] font-extrabold tracking-tight text-foreground leading-[1.05] mb-8">
                Rise up. <br />
                <span className="text-muted">Find work.</span> <br />
                <span style={{ color: '#FF6F61' }}>Go above.</span>
              </h1>
            </ScrollReveal>
            
            <ScrollReveal delay={0.3} direction="up" duration={0.8}>
              <p className="text-lg sm:text-xl text-muted max-w-2xl mx-auto mb-12 leading-relaxed">
                Connect with extraordinary opportunities worldwide. Access exclusive roles at top-tier companies, powered by intelligent matching.
              </p>
            </ScrollReveal>
            
            {/* Search Bar Container */}
            <ScrollReveal delay={0.4} direction="up" duration={0.8}>
              <HomeSearchForm />
            </ScrollReveal>
            
            {/* Trusted By */}
            <ScrollReveal delay={0.6} direction="up" duration={1}>
              <div className="mt-20 pt-10 border-t border-border">
                <p className="text-sm font-semibold text-muted uppercase tracking-widest mb-6">Powering the future of hiring</p>
              </div>
            </ScrollReveal>
            
          </div>
        </div>
      </section>

      {/* ===== FEATURES BENTO GRID ===== */}
      <section className="relative w-full py-32 bg-transparent">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        
        <div className="section-container">
          <ScrollReveal delay={0.1} direction="up">
            <div className="mb-20">
              <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight mb-6">
                Built for <span className="text-gradient">modern careers</span>
              </h2>
              <p className="text-xl text-muted max-w-2xl">
                Everything you need to discover, evaluate, and secure your next career-defining role in one unified platform.
              </p>
            </div>
          </ScrollReveal>
          
          {/* Bento Grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 (Large, spans 2 cols) */}
            <ScrollReveal delay={0.1} direction="up" className="md:col-span-2 h-full">
              <SpotlightCard className="wireframe-card p-10 flex flex-col justify-between group h-full">
                <div className="mb-10">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">Intelligent Matching Engine</h3>
                  <p className="text-muted text-lg max-w-md leading-relaxed">
                    Our proprietary algorithms analyze millions of data points to surface roles that precisely match your skills, trajectory, and compensation requirements.
                  </p>
                </div>
                
                {/* Abstract UI representation */}
                <div className="relative w-full h-48 rounded-xl border border-border bg-background overflow-hidden flex items-center justify-center group-hover:border-primary/30 transition-colors shadow-inner">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.05),transparent_70%)] dark:bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.1),transparent_70%)]" />
                  <div className="flex items-center gap-6 relative z-10">
                    <div className="w-16 h-16 rounded-full bg-surface border border-border flex items-center justify-center animate-soft-pulse shadow-sm">
                      <UserIcon />
                    </div>
                    <div className="flex gap-2">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={`w-2 h-2 rounded-full bg-primary animate-pulse`} style={{ animationDelay: `${i * 200}ms` }} />
                      ))}
                    </div>
                    <div className="w-16 h-16 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center animate-soft-pulse shadow-sm" style={{ animationDelay: '500ms' }}>
                      <Briefcase className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            </ScrollReveal>

            {/* Feature 2 */}
            <ScrollReveal delay={0.2} direction="up" className="h-full">
              <SpotlightCard className="wireframe-card p-10 group h-full">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6">
                  <Globe className="w-6 h-6 text-cyan-500" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Borderless Access</h3>
                <p className="text-muted text-lg leading-relaxed mb-10">
                  Filter instantly for remote-first roles, visa sponsorships, and global relocation packages.
                </p>
                
                <div className="relative w-full h-40 rounded-xl border border-border bg-background overflow-hidden p-6 relative shadow-inner">
                   <div className="absolute top-4 right-4 text-[10px] font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded">GLOBAL_SYNC</div>
                   <div className="mt-8 space-y-3">
                     <div className="h-2 w-full bg-surface rounded overflow-hidden">
                       <div className="h-full bg-cyan-500/50 w-[80%]" />
                     </div>
                     <div className="h-2 w-full bg-surface rounded overflow-hidden">
                       <div className="h-full bg-cyan-500/50 w-[60%]" />
                     </div>
                     <div className="h-2 w-full bg-surface rounded overflow-hidden">
                       <div className="h-full bg-cyan-500/50 w-[90%]" />
                     </div>
                   </div>
                </div>
              </SpotlightCard>
            </ScrollReveal>

            {/* Feature 3 */}
            <ScrollReveal delay={0.3} direction="up" className="h-full">
              <SpotlightCard className="wireframe-card p-10 group h-full">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                  <Shield className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4">Verified Employers</h3>
                <p className="text-muted text-lg leading-relaxed">
                  Every company on our platform undergoes rigorous verification to ensure legitimacy and financial stability.
                </p>
              </SpotlightCard>
            </ScrollReveal>

            {/* Feature 4 (Large, spans 2 cols) */}
            <ScrollReveal delay={0.4} direction="up" className="md:col-span-2 h-full">
              <SpotlightCard className="wireframe-card p-10 relative overflow-hidden group h-full">
                <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-primary/10 to-transparent pointer-events-none transition-opacity group-hover:opacity-100 opacity-50" />
                <div className="relative z-10 w-full md:w-1/2">
                  <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center mb-6 shadow-sm">
                    <Activity className="w-6 h-6 text-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">Real-time Salary Insights</h3>
                  <p className="text-muted text-lg leading-relaxed mb-8">
                    Never guess your market value again. Access transparent, verified compensation data for your specific role and location before you even apply.
                  </p>
                  <div className="space-y-4">
                    {["Equity breakdowns", "Bonus structures", "Cost of living adjustments"].map(item => (
                      <div key={item} className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                        <span className="text-foreground">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Abstract Graph */}
                <div className="absolute right-[-10%] top-[20%] bottom-[-10%] w-[60%] hidden md:block opacity-30 dark:opacity-60 group-hover:opacity-100 transition-opacity duration-700">
                  <svg viewBox="0 0 100 100" className="w-full h-full preserve-3d" style={{ transform: 'perspective(1000px) rotateY(-20deg) rotateX(20deg)' }}>
                    <path d="M0,80 Q20,60 40,70 T80,30 T100,10 L100,100 L0,100 Z" fill="url(#grad1)" opacity="0.2" />
                    <path d="M0,80 Q20,60 40,70 T80,30 T100,10" fill="none" stroke="var(--primary)" strokeWidth="2" />
                    <defs>
                      <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="var(--primary)" stopOpacity="1" />
                        <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </SpotlightCard>
            </ScrollReveal>
            
          </div>
        </div>
      </section>

      {/* ===== THE FORGE CTA ===== */}
      <section className="relative w-full py-32 bg-transparent overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="section-container relative z-10 text-center">
          <ScrollReveal delay={0.1} direction="up">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400 text-sm font-bold tracking-widest uppercase mb-6 mx-auto">
               <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
               The Arena is Open
             </div>
          </ScrollReveal>
          
          <ScrollReveal delay={0.2} direction="up">
            <h2 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tight mb-6 drop-shadow-[0_0_20px_rgba(244,63,94,0.3)]">
              Stop Applying.<br/> <span className="text-rose-400">Start Proving.</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 font-mono">
              Compete entirely anonymously in high-stakes Bounties. Let your raw talent speak for itself on live global leaderboards and get hired directly.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.3} direction="up">
            <Link href="/forge">
               <button className="h-14 px-10 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-500 transition-all shadow-[0_0_30px_rgba(244,63,94,0.4)] hover:shadow-[0_0_50px_rgba(244,63,94,0.6)] text-lg uppercase tracking-wider">
                 Enter The Forge
               </button>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ===== STATISTICS ===== */}
      <section className="w-full py-32 border-y border-border relative bg-transparent">
        <div className="section-container">
          <div className="grid md:grid-cols-4 gap-10 divide-y md:divide-y-0 md:divide-x divide-border text-center md:text-left">
            {stats.map((stat, i) => (
              <ScrollReveal key={stat.label} delay={i * 0.1} direction="up" className={`pt-8 md:pt-0 ${i !== 0 ? 'md:pl-10' : ''}`}>
                <div className="text-primary mb-4 flex justify-center md:justify-start">{stat.icon}</div>
                <div className="text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight mb-2">{stat.value}</div>
                <div className="text-muted font-medium">{stat.label}</div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="relative w-full py-40 overflow-hidden bg-transparent">
        {/* Massive glowing orb behind CTA */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 dark:bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="section-container relative z-10 text-center">
          <ScrollReveal delay={0.1} direction="up">
            <h2 className="text-5xl md:text-7xl font-extrabold text-foreground tracking-tight mb-8">
              Your next chapter <br />
              <span className="text-muted">starts right now.</span>
            </h2>
          </ScrollReveal>

          <ScrollReveal delay={0.2} direction="up">
            <p className="text-xl text-muted max-w-2xl mx-auto mb-12">
              Join the exclusive network of top-tier talent and innovative companies shaping the future of work.
            </p>
          </ScrollReveal>
          
          <ScrollReveal delay={0.3} direction="up">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/jobs">
                <button className="h-14 px-8 bg-primary text-white font-semibold rounded-xl hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,111,97,0.4)] text-lg flex items-center gap-2">
                  Explore Opportunities <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link href="/signup">
                <button className="h-14 px-8 bg-background text-foreground font-semibold rounded-xl border border-border hover:bg-surface-hover transition-all text-lg shadow-sm">
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

// Simple fallback icon
function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );
}
