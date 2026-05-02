"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, Eye, FileEdit, Copy, Trash2, ShieldAlert,
  Trophy, Users, Activity, Target, Sparkles, Loader2, Inbox, ArrowRight, ArrowLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export default function EmployerForgeOverview() {
  const [bounties, setBounties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ active: 0, entries: 0, hires: 0, avgScore: '—', revealRate: '—' });

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Fetch real challenges by this employer
      const { data: challenges } = await supabase
        .from('forge_challenges')
        .select('*')
        .eq('employer_id', user.id)
        .order('created_at', { ascending: false });

      const realBounties = challenges || [];
      setBounties(realBounties);

      // Calculate stats
      const active = realBounties.filter(b => b.status === 'live').length;
      const { count: entryCount } = await supabase
        .from('forge_entries')
        .select('id', { count: 'exact', head: true })
        .in('challenge_id', realBounties.map(b => b.id));

      setStats({
        active,
        entries: entryCount || 0,
        hires: 0,
        avgScore: '—',
        revealRate: '—',
      });

      setLoading(false);
    }
    load();
  }, []);

  const statCards = [
    { label: "Active Drops", value: stats.active.toString(), icon: <Activity className="w-5 h-5" />, color: "text-rose-500", bg: "bg-rose-500/10" },
    { label: "Total Entries", value: stats.entries.toLocaleString(), icon: <Users className="w-5 h-5" />, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Hires Made", value: stats.hires.toString(), icon: <Trophy className="w-5 h-5" />, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Avg AI Score", value: stats.avgScore, icon: <Sparkles className="w-5 h-5" />, color: "text-primary-light", bg: "bg-primary/10" },
    { label: "Reveal Rate", value: stats.revealRate, icon: <Target className="w-5 h-5" />, color: "text-emerald-500", bg: "bg-emerald-500/10" }
  ];

  const StatusBadge = ({ status }: { status: string }) => {
    switch (status) {
      case "live":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.3)]">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> LIVE
          </span>
        );
      case "scheduled":
        return <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20">Scheduled</span>;
      case "judging":
        return <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20">Judging</span>;
      case "completed":
        return <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Completed</span>;
      case "draft":
      default:
        return <span className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-white/5 text-muted-foreground border border-white/10">Draft</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05050a] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05050a] text-white font-sans pt-24 pb-32 relative overflow-hidden">
       {/* Background Aesthetics */}
       <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
       <div className="glow-orb-primary -top-40 -right-40 opacity-20" />
       <div className="glow-orb-cyan -bottom-40 -left-40 opacity-10" />
       
       <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
             <div>
               <h1 className="text-5xl font-black uppercase tracking-tighter text-white flex items-center gap-4">
                  The Arena Command <ShieldAlert className="w-8 h-8 text-primary shadow-[0_0_20px_rgba(255,111,97,0.4)]" />
               </h1>
               <p className="text-muted-foreground font-mono mt-3 text-sm tracking-wide">
                  Strategic Deployment Hub. Monitor Active Operations.
               </p>
             </div>
             <Link href="/employer/forge/create" className="group relative px-8 py-4 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-[0.3em] overflow-hidden transition-all shadow-[0_0_30px_rgba(255,111,97,0.4)] hover:shadow-[0_0_50px_rgba(255,111,97,0.6)]">
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative z-10 flex items-center gap-2"><Plus className="w-4 h-4" /> Drop New Bounty</span>
             </Link>
          </div>

          {/* Matrix Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-16">
              {statCards.map((stat, i) => (
                <motion.div 
                  key={stat.label} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative p-6 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-xl hover:bg-white/10 transition-all duration-300"
                >
                   <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg} ${stat.color} shadow-lg transition-transform group-hover:scale-110`}>
                         {stat.icon}
                      </div>
                   </div>
                   <div className="text-4xl font-black font-mono text-white tracking-tighter mb-1">{stat.value}</div>
                   <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-black">{stat.label}</div>
                   <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-white/20 rounded-tr" />
                </motion.div>
             ))}
          </div>

          {/* Bounties Master Table */}
          <div className="border border-white/5 bg-white/5 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden shadow-2xl relative">
             <div className="p-8 border-b border-white/5 bg-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-2 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(255,111,97,0.5)]" />
                   <div>
                      <h2 className="text-xl font-black uppercase tracking-[0.1em] text-white">Active Operations</h2>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1 font-mono">Bounty Intelligence Feed</p>
                   </div>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-black/40 border border-white/5">
                   <Activity className="w-4 h-4 text-primary animate-pulse" />
                   <span className="font-mono text-[10px] text-primary tracking-widest uppercase">System Live</span>
                </div>
             </div>
             
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                   <thead className="bg-white/5 text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-black">
                      <tr>
                         <th className="px-10 py-6">Mission / Bounty</th>
                         <th className="px-10 py-6 text-center">Status</th>
                         <th className="px-10 py-6">Inception</th>
                         <th className="px-10 py-6 text-center">Infiltration</th>
                         <th className="px-10 py-6 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-white/5">
                       {bounties.length === 0 ? (
                          <tr>
                             <td colSpan={5} className="px-10 py-24 text-center">
                                <div className="flex flex-col items-center gap-6 opacity-30">
                                   <Inbox className="w-16 h-16" />
                                   <p className="font-mono text-sm uppercase tracking-[0.3em]">No Active Operations Detected</p>
                                </div>
                             </td>
                          </tr>
                       ) : bounties.map((bounty) => (
                         <tr key={bounty.id} className="hover:bg-white/5 transition-all duration-300 group">
                            <td className="px-10 py-10">
                                <Link href={`/employer/forge/${bounty.id}`} className="block group/link">
                                   <div className="font-black text-xl text-white group-hover/link:text-primary transition-colors leading-none mb-2">
                                      {bounty.title}
                                   </div>
                                   <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-mono opacity-50">CID: {bounty.id.slice(0, 12)}</div>
                                </Link>
                             </td>
                             <td className="px-10 py-10 text-center">
                                <StatusBadge status={bounty.status} />
                             </td>
                             <td className="px-10 py-10">
                                <div className="flex flex-col">
                                   <span className="text-white font-mono text-base">{bounty.drop_time ? new Date(bounty.drop_time).toLocaleDateString() : '—'}</span>
                                   <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-black mt-1">Inception Date</span>
                                </div>
                             </td>
                            <td className="px-10 py-10 text-center">
                               <div className="inline-flex flex-col items-center px-5 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                                  <span className="text-emerald-400 font-black text-2xl font-mono leading-none mb-1">{bounty.entries || 0}</span>
                                  <span className="text-[9px] uppercase tracking-widest text-emerald-500/60 font-black">Entries</span>
                               </div>
                            </td>
                            <td className="px-10 py-10">
                               <div className="flex items-center justify-end gap-3">
                                  <Link href={`/employer/forge/${bounty.id}`} className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-muted-foreground hover:text-white hover:border-primary/50 transition-all shadow-sm" title="View War Room">
                                     <Eye className="w-5 h-5" />
                                  </Link>
                                  {bounty.status === 'draft' && (
                                     <Link href={`/employer/forge/create?id=${bounty.id}`} className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-muted-foreground hover:text-white hover:border-primary/50 transition-all shadow-sm" title="Edit Draft">
                                        <FileEdit className="w-5 h-5" />
                                     </Link>
                                  )}
                                  <button className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-muted-foreground hover:text-white hover:border-primary/50 transition-all shadow-sm" title="Duplicate Operation">
                                     <Copy className="w-5 h-5" />
                                  </button>
                                  <button className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500/60 hover:text-rose-500 hover:bg-rose-500/20 transition-all shadow-sm" title="Terminate Operation">
                                     <Trash2 className="w-5 h-5" />
                                  </button>
                               </div>
                            </td>
                         </tr>
                       ))}
                   </tbody>
                </table>
             </div>
          </div>
       </div>
    </div>
  );
}
