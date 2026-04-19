"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { Shield, Zap, Users, Trophy, FileText, AlertTriangle, ArrowRight, Activity, Award } from "lucide-react";
import { SquadTab } from "@/components/forge/SquadTab";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import { FORGE_BADGES } from "@/components/forge/BadgeDefinitions";

function FlameIcon(props: any) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

export default function CandidateForgeDashboard() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [profile, setProfile] = useState<any>(null);
  const [myBadges, setMyBadges] = useState<string[]>([]);
  const [activeEntries, setActiveEntries] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  
  const [stats, setStats] = useState({
     entered: 0,
     bestRank: 0,
     totalVotes: 0,
     reveals: 0,
     hires: 0
  });

  useEffect(() => {
    async function init() {
       const supabase = createClient();
       const { data: { user } } = await supabase.auth.getUser();
       // Temporarily disabled for testing:
       // if (!user) return router.push('/auth');

       let c;
       if (user) {
          const { data } = await supabase.from('candidates').select('*').eq('user_id', user.id).single();
          c = data;
       }
       
       if (!c) {
          // No candidate profile — show empty state
          c = {
            id: user?.id || '',
            first_name: '',
            last_name: '',
            forge_streak: 0,
            user_id: user?.id || ''
          };
       }
       
       setProfile(c);

       const { data: bData } = await supabase.from('forge_badges').select('badge_type').eq('candidate_id', c.id);
       if (bData) setMyBadges(bData.map(b => b.badge_type));

       const { data: entries } = await supabase
          .from('forge_entries')
          .select('id, codename, rank, ai_score, vote_count, status, is_revealed, forge_challenges(title, status, expires_at)')
          .eq('candidate_id', c.id)
          .order('entered_at', { ascending: false });

       if (entries) {
          const active = entries.filter(e => {
             const ch = e.forge_challenges as any;
             return ch && (ch.status === 'live' || ch.status === 'judging');
          });
          const completed = entries.filter(e => {
             const ch = e.forge_challenges as any;
             return ch && (ch.status === 'completed' || ch.status === 'cancelled');
          });
          
          setActiveEntries(active);
          setHistory(completed);

          let bestR = 999999;
          let votes = 0;
          let revs = 0;
          let hs = 0;

          entries.forEach(e => {
             if (e.rank && e.rank < bestR) bestR = e.rank;
             votes += (e.vote_count || 0);
             if (e.is_revealed) revs++;
             if (e.status === 'hired') hs++;
          });

          setStats({
             entered: entries.length,
             bestRank: bestR === 999999 ? 0 : bestR,
             totalVotes: votes,
             reveals: revs,
             hires: hs
          });
       }

       setLoading(false);
    }
    init();
  }, [router]);

  if (loading) return <div className="min-h-screen bg-[#05050a] flex items-center justify-center font-mono text-primary animate-pulse uppercase tracking-widest text-sm">Synchronizing Data...</div>;

  const unlockedBadges = FORGE_BADGES.filter(b => myBadges.includes(b.id)).sort((a,b) => b.rank - a.rank);
  const top3 = unlockedBadges.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#05050a] text-foreground font-sans pt-24 pb-32">
       
       <div className="max-w-6xl mx-auto px-6 space-y-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
             <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div>
                   <h1 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tight mb-2">My Forge Run</h1>
                   <p className="text-muted-foreground font-mono">Track your streaks, ranks, and Squad ops.</p>
                </div>
                {top3.length > 0 && (
                   <div className="flex gap-2 bg-black/40 p-2 rounded-2xl border border-white/5 shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] mt-2 md:mt-0 h-14">
                      {top3.map(badge => (
                         <div key={`top-${badge.id}`} className={`p-2 rounded-xl flex items-center justify-center group relative ${badge.bg} ${badge.border} shadow-[0_0_15px_rgba(255,255,255,0.05)] hover:scale-110 transition-transform cursor-pointer`}>
                            <badge.icon className={`w-5 h-5 ${badge.color}`} />
                            <div className="absolute top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-black border border-white/10 shadow-2xl text-white text-[10px] px-2 py-1 rounded-md z-50 pointer-events-none uppercase tracking-widest font-bold">
                               {badge.name}
                            </div>
                         </div>
                      ))}
                   </div>
                )}
             </div>
             
             <div className="flex bg-black/50 border border-white/10 rounded-2xl p-1 overflow-x-auto scrollbar-hide">
                 {[
                   { id: 'overview', label: 'Overview' },
                   { id: 'active', label: 'Active Runs' },
                   { id: 'history', label: 'Combat Archive' },
                   { id: 'squad', label: 'Squad Deployments' }
                 ].map(t => (
                    <button 
                      key={t.id}
                      onClick={() => setActiveTab(t.id)}
                      className={`px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                         activeTab === t.id 
                           ? 'bg-[#FF6F61] text-white shadow-[0_0_20px_rgba(255,111,97,0.3)]' 
                           : 'text-muted-foreground hover:bg-[#1B365D]/30 hover:text-white'
                      }`}
                    >
                       {t.label}
                    </button>
                 ))}
             </div>
          </div>

          <AnimatePresence mode="wait">
             <motion.div
               key={activeTab}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: -10 }}
               transition={{ duration: 0.2 }}
             >
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                   <div className="space-y-8">
                      {/* Stats Row */}
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                         {[
                           { label: "Total Bounties", val: stats.entered, icon: Shield, color: 'text-blue-400' },
                           { label: "Peak Rank", val: stats.bestRank === 0 ? '-' : `#${stats.bestRank}`, icon: Trophy, color: 'text-amber-400' },
                           { label: "Global Votes", val: stats.totalVotes, icon: Activity, color: 'text-emerald-400' },
                           { label: "Identities Revealed", val: stats.reveals, icon: Zap, color: 'text-fuchsia-400' },
                           { label: "Forge Hires", val: stats.hires, icon: Award, color: 'text-primary-light' }
                         ].map((s, i) => (
                            <div key={i} className="bg-[#1B365D]/40 border border-white/5 rounded-2xl p-6 backdrop-blur-md flex flex-col items-center text-center hover:bg-[#1B365D]/80 transition-colors group">
                               <s.icon className={`w-6 h-6 text-[#FF6F61] mb-4 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all`} />
                               <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">{s.label}</span>
                               <span className="text-3xl font-black font-mono text-white">{s.val}</span>
                            </div>
                         ))}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                         {/* Flame Visualizer */}
                         <div className="lg:col-span-1 bg-[#1B365D]/40 border border-white/5 rounded-3xl p-8 relative overflow-hidden flex flex-col items-center justify-center text-center">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#FF6F61]/20 blur-[50px] pointer-events-none" />
                            <div className="w-24 h-24 rounded-full border border-[#FF6F61]/30 bg-gradient-to-br from-[#050a14] to-[#1B365D]/60 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(255,111,97,0.2)]">
                               <FlameIcon className="w-10 h-10 text-[#FF6F61]" />
                            </div>
                            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[#FF6F61] mb-1">Current Streak</h3>
                            <div className="text-5xl font-black font-mono text-white mb-4">{profile.forge_streak || 0} <span className="text-lg text-muted-foreground">Days</span></div>
                            <p className="text-xs font-mono text-muted-foreground leading-relaxed px-4">
                               Log in and deploy to the Forge daily to keep the fire alive. Streaks unlock exclusive Arena badges.
                            </p>
                            
                            {/* 7 Day Mini Calendar visual */}
                            <div className="w-full flex justify-between mt-8 p-4 bg-black/40 rounded-xl border border-white/5">
                               {[1,2,3,4,5,6,7].map(d => (
                                  <div key={d} className={`w-3 h-3 rounded-sm ${d <= (profile.forge_streak || 0) % 7 || (profile.forge_streak > 0 && profile.forge_streak % 7 === 0) ? 'bg-[#FF6F61] shadow-[0_0_10px_rgba(255,111,97,0.5)]' : 'bg-white/10'}`} />
                               ))}
                            </div>
                         </div>

                         {/* Trophy Case */}
                         <div className="lg:col-span-2 bg-[#1B365D]/40 border border-white/5 rounded-3xl p-8 backdrop-blur-md">
                            <div className="flex justify-between items-center mb-6">
                               <h3 className="text-lg font-bold text-white uppercase tracking-widest text-[#FF6F61] flex items-center gap-2"><Trophy className="w-5 h-5"/> Trophy Case</h3>
                               <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">{myBadges.length}/{FORGE_BADGES.length} Unlocked</span>
                            </div>
                            
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-h-[28rem] overflow-y-auto scrollbar-hide pr-2">
                               {FORGE_BADGES.map(badge => {
                                  const unlocked = myBadges.includes(badge.id);
                                  return (
                                     <div key={badge.id} className={`group relative p-4 rounded-2xl border flex flex-col items-center justify-center text-center transition-all ${unlocked ? `bg-[#1B365D]/60 border-[#FF6F61]/30 shadow-[inset_0_0_20px_rgba(255,111,97,0.05)] hover:scale-105` : 'bg-black/40 border-white/5 opacity-30 grayscale hover:opacity-80 hover:grayscale-0 cursor-not-allowed'}`}>
                                        <badge.icon className={`w-8 h-8 ${unlocked ? 'text-[#FF6F61]' : 'text-muted-foreground'} mb-3`} />
                                        <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${unlocked ? 'text-[#FF6F61]' : 'text-gray-500'}`}>{badge.name}</div>
                                        <div className={`text-[10px] font-mono leading-tight ${unlocked ? 'text-white' : 'text-muted-foreground'}`}>{unlocked ? 'UNLOCKED' : 'LOCKED'}</div>
                                        
                                        {!unlocked && (
                                           <div className="absolute -top-14 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.8)] text-white text-[10px] px-3 py-2 rounded-lg z-50 pointer-events-none w-36">
                                              <span className="font-bold text-amber-500 uppercase tracking-widest block mb-0.5">How to unlock:</span>
                                              <span className="font-mono text-gray-300">{badge.desc}</span>
                                           </div>
                                        )}
                                     </div>
                                  )
                               })}
                            </div>
                         </div>
                      </div>
                   </div>
                )}

                {/* ACTIVE RUNS TAB */}
                {activeTab === 'active' && (
                   <div className="space-y-6">
                      {activeEntries.length === 0 ? (
                         <div className="py-20 flex flex-col items-center justify-center text-center bg-surface/30 border border-white/5 rounded-3xl backdrop-blur-md">
                            <Activity className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">No Active Deployments</h3>
                            <p className="text-sm font-mono text-muted-foreground">You are not currently fighting in any live Arena drops.</p>
                            <Link href="/forge" className="mt-6 px-6 py-3 rounded-xl bg-primary text-white font-bold text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:bg-primary-light transition-all">Browse The Forge</Link>
                         </div>
                      ) : (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {activeEntries.map(entry => {
                               const ch = entry.forge_challenges as any;
                               return (
                                  <div key={entry.id} className="bg-surface/30 border border-white/10 rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between hover:border-primary/50 transition-colors group">
                                     <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent opacity-50" />
                                     <div>
                                        <div className="flex justify-between items-start mb-4">
                                           <span className="px-2 py-1 rounded-md bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] font-bold uppercase tracking-widest animate-pulse flex items-center gap-1">
                                              <AlertTriangle className="w-3 h-3" /> {ch.status}
                                           </span>
                                           <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest bg-black px-2 py-1 rounded-md border border-white/5">{entry.codename}</span>
                                        </div>
                                        <h3 className="text-xl font-black text-white mb-6 line-clamp-2">{ch.title}</h3>
                                     </div>
                                     <div className="flex justify-between items-end border-t border-white/5 pt-4">
                                        <div>
                                           <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Current Votes</div>
                                           <div className="text-2xl font-mono font-black text-emerald-400">{entry.vote_count || 0}</div>
                                        </div>
                                        <Link href={`/forge/${ch.id}`} className="text-xs font-bold uppercase tracking-widest text-primary hover:text-primary-light flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                           View Grid <ArrowRight className="w-4 h-4" />
                                        </Link>
                                     </div>
                                  </div>
                               )
                            })}
                         </div>
                      )}
                   </div>
                )}

                {/* COMBAT ARCHIVE TAB */}
                {activeTab === 'history' && (
                   <div className="bg-surface/30 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-md">
                      {history.length === 0 ? (
                         <div className="py-20 flex flex-col items-center justify-center text-center">
                            <FileText className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                            <h3 className="text-xl font-black text-white uppercase tracking-widest mb-2">Archive Empty</h3>
                            <p className="text-sm font-mono text-muted-foreground">Complete a bounty to generate history.</p>
                         </div>
                      ) : (
                         <div className="w-full overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                               <thead>
                                  <tr className="bg-black/40 border-b border-white/5">
                                     <th className="p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Bounty Name</th>
                                     <th className="p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Codename Used</th>
                                     <th className="p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Final Rank</th>
                                     <th className="p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">AI Score</th>
                                     <th className="p-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Identity</th>
                                  </tr>
                               </thead>
                               <tbody className="divide-y divide-white/5">
                                  {history.map(entry => {
                                     const ch = entry.forge_challenges as any;
                                     return (
                                        <tr key={entry.id} className="hover:bg-white/5 transition-colors">
                                           <td className="p-4 font-bold text-white max-w-[200px] truncate">{ch.title}</td>
                                           <td className="p-4 font-mono text-primary-light text-sm">{entry.codename}</td>
                                           <td className="p-4 font-mono font-black text-amber-500 text-right">{entry.rank ? `#${entry.rank}` : '-'}</td>
                                           <td className="p-4 font-mono font-black text-emerald-400 text-right">{entry.ai_score || '-'}</td>
                                           <td className="p-4 text-center">
                                              {entry.is_revealed 
                                                ? <span className="px-2 py-1 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] font-bold uppercase tracking-widest">Revealed</span>
                                                : <span className="px-2 py-1 rounded bg-black border border-white/10 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Hidden</span>}
                                           </td>
                                        </tr>
                                     )
                                  })}
                               </tbody>
                            </table>
                         </div>
                      )}
                   </div>
                )}

                {/* SQUAD INTEGRATION TAB */}
                {activeTab === 'squad' && (
                   <SquadTab candidateProfile={profile} />
                )}

             </motion.div>
          </AnimatePresence>

       </div>
    </div>
  );
}
