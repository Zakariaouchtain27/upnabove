"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, TrendingUp, Sparkles, Users, Radio, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { WinnerManagementBoard } from "@/components/forge/WinnerManagementBoard";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell,
} from 'recharts';

const PIE_COLORS = ['#7C3AED', '#3B82F6', '#F59E0B', '#F43F5E', '#10B981', '#4B5563'];

export default function EmployerForgeAnalytics() {
  const params = useParams();
  const challengeId = params.id as string;

  const [isBroadcasting, setIsBroadcasting] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [entries, setEntries] = React.useState<any[]>([]);
  const [companyName, setCompanyName] = React.useState("");
  const [volumeData, setVolumeData] = React.useState<any[]>([]);
  const [scoreHistogram, setScoreHistogram] = React.useState<any[]>([]);
  const [voteShares, setVoteShares] = React.useState<any[]>([]);
  const [totalVotes, setTotalVotes] = React.useState(0);

  const supabase = createClient();

  React.useEffect(() => {
    async function loadData() {
      setIsLoading(true);

      // 1. Challenge company name
      const { data: challenge } = await supabase
        .from('forge_challenges')
        .select('employers(company_name)')
        .eq('id', challengeId)
        .single();
      if (challenge?.employers) {
        const emp = Array.isArray(challenge.employers) ? challenge.employers[0] : challenge.employers;
        if (emp) setCompanyName((emp as any).company_name);
      }

      // 2. All entries with scores and votes
      const { data: allEntries } = await supabase
        .from('forge_entries')
        .select('id, codename, ai_score, vote_count, rank, candidate_id, entered_at, candidates(first_name, last_name, avatar_url)')
        .eq('challenge_id', challengeId)
        .order('rank', { ascending: true });

      if (allEntries) {
        // Top 3 for winner board
        setEntries(allEntries.filter(e => e.ai_score !== null).slice(0, 3));

        // Entry velocity: bucket by day
        const dayMap: Record<string, number> = {};
        allEntries.forEach(e => {
          if (!e.entered_at) return;
          const key = new Date(e.entered_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          dayMap[key] = (dayMap[key] || 0) + 1;
        });
        setVolumeData(Object.entries(dayMap).map(([time, entries]) => ({ time, entries })));

        // AI score histogram (buckets of 20)
        const buckets: Record<string, number> = {
          '0–20': 0, '21–40': 0, '41–60': 0, '61–80': 0, '81–100': 0,
        };
        allEntries.forEach(e => {
          const s = e.ai_score;
          if (s === null || s === undefined) return;
          if (s <= 20) buckets['0–20']++;
          else if (s <= 40) buckets['21–40']++;
          else if (s <= 60) buckets['41–60']++;
          else if (s <= 80) buckets['61–80']++;
          else buckets['81–100']++;
        });
        setScoreHistogram(Object.entries(buckets).map(([range, count]) => ({ range, count })));

        // Vote share: top 5 entries by vote_count
        const topVoted = [...allEntries]
          .sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0))
          .slice(0, 5);
        setVoteShares(topVoted.map(e => ({ name: e.codename, votes: e.vote_count || 0 })));
        setTotalVotes(allEntries.reduce((s, e) => s + (e.vote_count || 0), 0));
      }

      setIsLoading(false);
    }
    loadData();
  }, [challengeId, supabase]);

  const handleTriggerReveal = async () => {
    if (!confirm("Are you sure? All watchers will see results and emails will be sent to winners.")) return;
    setIsBroadcasting(true);
    try {
      const res = await fetch("/api/forge/trigger-reveal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId }),
      });
      if (!res.ok) throw new Error("API Failed");
      const channel = supabase.channel(`challenge-${challengeId}`);
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          channel.send({ type: 'broadcast', event: 'trigger-reveal', payload: { challengeId } });
          setTimeout(() => {
            supabase.removeChannel(channel);
            setIsBroadcasting(false);
            alert("Reveal Triggered Successfully!");
            window.location.reload();
          }, 1000);
        }
      });
    } catch {
      alert("Failed to trigger reveal.");
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen text-foreground relative z-10">
      <header className="mb-10">
        <Link href={`/employer/forge/${challengeId}`} className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-white transition-colors mb-4 font-mono uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Back to War Room
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
              Bounty Analytics <span className="text-emerald-500/80 font-mono text-sm border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 rounded-md">Live</span>
            </h1>
            <p className="text-muted-foreground font-mono mt-2">Entry velocity, grading distribution, and vote share.</p>
          </div>
          <button
            onClick={handleTriggerReveal}
            disabled={isBroadcasting}
            className="flex items-center gap-2 bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 px-6 rounded-xl shadow-[0_0_20px_rgba(219,39,119,0.3)] transition-all uppercase tracking-widest text-sm active:scale-95 disabled:opacity-50"
          >
            <Radio className={isBroadcasting ? "w-5 h-5 animate-pulse" : "w-5 h-5"} />
            {isBroadcasting ? "Broadcasting..." : "Trigger Live Reveal"}
          </button>
        </div>
      </header>

      {/* Winner Pipeline */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <Users className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl font-black uppercase tracking-widest dark:text-white">Winner Pipeline</h2>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center p-12 text-zinc-500"><Loader2 className="w-8 h-8 animate-spin" /></div>
        ) : (
          <WinnerManagementBoard entries={entries} challengeId={challengeId} companyName={companyName || "The Employer"} />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Entry Velocity */}
        <div className="p-6 rounded-2xl bg-white/40 dark:bg-black/40 border border-black/5 dark:border-white/5 shadow-2xl col-span-1 lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold uppercase tracking-widest dark:text-white">Entry Velocity</h2>
            <span className="ml-auto text-xs font-mono text-zinc-500">{entries.length ? `${(entries as any[]).length}+ entries` : 'No entries yet'}</span>
          </div>
          <div className="h-[280px] w-full">
            {isLoading ? (
              <div className="w-full h-full bg-white/5 rounded-xl animate-pulse" />
            ) : volumeData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={volumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEntries" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="time" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#05050a', borderColor: '#ffffff20', borderRadius: '12px' }} itemStyle={{ color: '#fff', fontWeight: 'bold' }} />
                  <Area type="monotone" dataKey="entries" stroke="#7C3AED" strokeWidth={3} fillOpacity={1} fill="url(#colorEntries)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500 font-mono text-xs uppercase">No entries yet</div>
            )}
          </div>
        </div>

        {/* AI Score Histogram */}
        <div className="p-6 rounded-2xl bg-white/40 dark:bg-black/40 border border-black/5 dark:border-white/5 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-bold uppercase tracking-widest dark:text-white">AI Grading Curve</h2>
          </div>
          <div className="h-[280px] w-full">
            {isLoading ? (
              <div className="w-full h-full bg-white/5 rounded-xl animate-pulse" />
            ) : scoreHistogram.some(b => b.count > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreHistogram} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="range" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip cursor={{ fill: '#ffffff05' }} contentStyle={{ backgroundColor: '#05050a', borderColor: '#ffffff20', borderRadius: '12px' }} />
                  <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500 font-mono text-xs uppercase">No scored entries yet</div>
            )}
          </div>
        </div>

        {/* Vote Share */}
        <div className="p-6 rounded-2xl bg-white/40 dark:bg-black/40 border border-black/5 dark:border-white/5 shadow-2xl flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold uppercase tracking-widest dark:text-white">Spectator Vote Share</h2>
          </div>
          <div className="flex-1 flex items-center justify-center relative min-h-[280px]">
            {isLoading ? (
              <div className="w-full h-full bg-white/5 rounded-xl animate-pulse" />
            ) : voteShares.length > 0 && totalVotes > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={voteShares} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={2} dataKey="votes" nameKey="name" stroke="none">
                      {voteShares.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#05050a', borderColor: '#ffffff20', borderRadius: '12px' }} itemStyle={{ color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="font-mono text-3xl font-bold dark:text-white">{totalVotes}</span>
                  <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Total Votes</span>
                </div>
              </>
            ) : (
              <div className="text-zinc-500 font-mono text-xs uppercase">No votes yet</div>
            )}
          </div>
          {/* Legend */}
          {voteShares.length > 0 && (
            <div className="mt-4 space-y-1">
              {voteShares.map((entry, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="font-mono text-zinc-400 truncate max-w-[120px]">{entry.name}</span>
                  </div>
                  <span className="font-black text-white">{entry.votes}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
