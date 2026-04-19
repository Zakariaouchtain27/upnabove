"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Plus, Eye, FileEdit, Copy, Trash2, ShieldAlert,
  Trophy, Users, Activity, Target, Sparkles, MoreVertical, Loader2, Inbox
} from "lucide-react";
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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> LIVE
          </span>
        );
      case "scheduled":
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-blue-500/10 text-blue-400 border border-blue-500/20">Scheduled</span>;
      case "judging":
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20">Judging</span>;
      case "completed":
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">Completed</span>;
      case "draft":
      default:
        return <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-zinc-100 dark:bg-black/5 dark:bg-white/5 text-muted-foreground border border-black/10 dark:border-black/10 dark:border-white/10">Draft</span>;
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-[1600px] mx-auto min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen text-foreground relative">
       
       <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

       <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10 relative z-10">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-zinc-900 dark:text-white flex items-center gap-3">
               The Arena Command <ShieldAlert className="w-6 h-6 text-primary" />
            </h1>
            <p className="text-muted-foreground font-mono mt-2">
               Deploy Bounties. Monitor Competitors. Unmask the Elite.
            </p>
          </div>
          <Link href="/employer/forge/create" className="btn-glow px-6 py-3 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary-light transition-all shadow-[0_0_20px_rgba(124,58,237,0.4)] flex items-center gap-2 uppercase tracking-wide">
             <Plus className="w-4 h-4" /> Drop New Bounty
          </Link>
       </div>

       {/* Matrix Stats */}
       <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10 relative z-10">
           {statCards.map((stat) => (
             <div key={stat.label} className="p-5 rounded-2xl border border-black/5 dark:border-black/5 dark:border-white/5 bg-white/40 dark:bg-white/40 dark:bg-black/40 backdrop-blur-md shadow-xl hover:bg-black/5 dark:hover:bg-black/5 dark:bg-white/5 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                      {stat.icon}
                   </div>
                </div>
                <div className="text-3xl font-bold font-mono text-zinc-900 dark:text-zinc-900 dark:text-white tracking-tight">{stat.value}</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1 font-semibold">{stat.label}</div>
             </div>
          ))}
       </div>

       {/* Bounties Master Table */}
       <div className="bg-white/40 dark:bg-white/40 dark:bg-black/40 border border-black/5 dark:border-black/5 dark:border-white/5 rounded-3xl overflow-hidden shadow-2xl relative z-10">
          <div className="p-6 border-b border-black/5 dark:border-black/5 dark:border-white/5 bg-zinc-100 dark:bg-black/5 dark:bg-white/5 flex items-center justify-between">
             <h2 className="text-lg font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-900 dark:text-white">Active Operations</h2>
             <div className="font-mono text-xs text-muted-foreground">Sorted by Status</div>
          </div>
          
          <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
                <thead className="bg-zinc-100 dark:bg-zinc-100 dark:bg-black/60 text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                   <tr>
                      <th className="px-6 py-4">Bounty Title</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Drop Timing</th>
                      <th className="px-6 py-4">Total Entries</th>
                      <th className="px-6 py-4">Top AI Score</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-black/5 dark:divide-white/5">
                    {bounties.map((bounty) => (
                      <tr key={bounty.id} className="hover:bg-black/5 dark:hover:bg-black/5 dark:bg-white/5 transition-colors group">
                         <td className="px-6 py-5">
                             <Link href={`/employer/forge/${bounty.id}`} className="font-bold text-base text-zinc-800 dark:text-zinc-800 dark:text-gray-200 group-hover:text-primary-light transition-colors line-clamp-1">
                                {bounty.title}
                             </Link>
                          </td>
                          <td className="px-6 py-5">
                             <StatusBadge status={bounty.status} />
                          </td>
                          <td className="px-6 py-5 font-mono text-muted-foreground">
                             {bounty.drop_time ? new Date(bounty.drop_time).toLocaleDateString() : '—'}
                          </td>
                         <td className="px-6 py-5 font-mono">
                            <span className="text-emerald-400 font-bold">{bounty.entries}</span>
                         </td>
                         <td className="px-6 py-5 font-mono text-muted-foreground">
                            {bounty.top_score}
                         </td>
                         <td className="px-6 py-5">
                            <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                               <Link href={`/employer/forge/${bounty.id}`} className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-black/10 dark:bg-white/10 text-muted-foreground hover:text-zinc-900 dark:hover:text-zinc-900 dark:text-white transition-colors" title="View War Room">
                                  <Eye className="w-4 h-4" />
                               </Link>
                               {bounty.status === 'draft' && (
                                  <button className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-black/10 dark:bg-white/10 text-muted-foreground hover:text-zinc-900 dark:hover:text-zinc-900 dark:text-white transition-colors" title="Edit Draft">
                                     <FileEdit className="w-4 h-4" />
                                  </button>
                               )}
                               <button className="p-2 rounded-lg hover:bg-black/10 dark:hover:bg-black/10 dark:bg-white/10 text-muted-foreground hover:text-zinc-900 dark:hover:text-zinc-900 dark:text-white transition-colors" title="Duplicate">
                                  <Copy className="w-4 h-4" />
                               </button>
                               <button className="p-2 rounded-lg hover:bg-rose-500/20 text-muted-foreground hover:text-rose-500 transition-colors" title="Cancel/Delete">
                                  <Trash2 className="w-4 h-4" />
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
  );
}
