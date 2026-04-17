"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, TrendingUp, Sparkles, Users, Radio, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { WinnerManagementBoard } from "@/components/forge/WinnerManagementBoard";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

// Data Mocks
const volumeData = [
  { time: "00:00", entries: 12 },
  { time: "04:00", entries: 28 },
  { time: "08:00", entries: 84 },
  { time: "12:00", entries: 165 },
  { time: "16:00", entries: 290 },
  { time: "20:00", entries: 341 },
];

const scoreHistogram = [
  { range: "< 50", count: 12 },
  { range: "50-60", count: 45 },
  { range: "60-70", count: 89 },
  { range: "70-80", count: 124 },
  { range: "80-90", count: 56 },
  { range: "90+", count: 15 },
];

const voteShares = [
  { name: "NeonPhantom", votes: 142 },
  { name: "ByteWeaver", votes: 89 },
  { name: "CipherWolf", votes: 310 },
  { name: "GhostCoder", votes: 45 },
  { name: "ZeroDay", votes: 12 },
  { name: "Others", votes: 245 },
];

const PIE_COLORS = ['#7C3AED', '#3B82F6', '#F59E0B', '#F43F5E', '#10B981', '#4B5563'];

export default function EmployerAnalytics() {
  const params = useParams();
  const challengeId = params.id as string;
  const [isBroadcasting, setIsBroadcasting] = React.useState(false);
  const [entries, setEntries] = React.useState<any[]>([]);
  const [companyName, setCompanyName] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const supabase = createClient();

  React.useEffect(() => {
    async function loadData() {
      // 1. Fetch challenge company info
      const { data: challenge } = await supabase
        .from('forge_challenges')
        .select('employers(company_name)')
        .eq('id', challengeId)
        .single();
      if (challenge?.employers) {
        const emp = Array.isArray(challenge.employers) ? challenge.employers[0] : challenge.employers;
        if (emp) setCompanyName(emp.company_name);
      }

      // 2. Fetch top 3 entries
      const { data: entryData } = await supabase
        .from('forge_entries')
        .select('*, candidates(first_name, last_name, avatar_url, id)')
        .eq('challenge_id', challengeId)
        .not('ai_score', 'is', null)
        .order('rank', { ascending: true })
        .limit(3);
      
      if (entryData) setEntries(entryData);
      setIsLoading(false);
    }
    loadData();
  }, [challengeId, supabase]);

  const handleTriggerReveal = async () => {
     if (!confirm("Are you sure you want to trigger the live reveal sequence? All watchers will immediately see the results, and emails will be sent to the winners!")) return;
     
     setIsBroadcasting(true);
     
     try {
       // 1. Call secure API to send emails and update db status
       const res = await fetch("/api/forge/trigger-reveal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ challengeId })
       });
       if (!res.ok) throw new Error("API Failed");
       
       // 2. Broadcast immediately over websockets so UI reacts
       const channel = supabase.channel(`challenge-${challengeId}`);
       channel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
             channel.send({
               type: 'broadcast',
               event: 'trigger-reveal',
               payload: { challengeId }
             });
             setTimeout(() => {
                supabase.removeChannel(channel);
                setIsBroadcasting(false);
                alert("Reveal Triggered Successfully!");
                // Optionally reload to fetch new 'revealed' status
                window.location.reload();
             }, 1000);
          }
       });
     } catch (err) {
       alert("Failed to trigger reveal.");
       setIsBroadcasting(false);
     }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen text-foreground relative z-10">
       
       {/* Header */}
       <header className="mb-10">
          <Link href={`/employer/forge/${challengeId}`} className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-zinc-900 dark:text-white transition-colors mb-4 font-mono uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Back to War Room
          </Link>
          <div className="flex items-center justify-between">
             <div>
                <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
                   Bounty Analytics <span className="text-emerald-500/80 font-mono text-sm border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 rounded-md">Realtime</span>
                </h1>
                <p className="text-muted-foreground font-mono mt-2">
                   Deep-dive entry velocity, grading distributions, and spectator engagement.
                </p>
             </div>
             <div>
                <button 
                  onClick={handleTriggerReveal}
                  disabled={isBroadcasting}
                  className="flex items-center gap-2 bg-pink-600 hover:bg-pink-500 text-white font-bold py-3 px-6 rounded-xl shadow-[0_0_20px_rgba(219,39,119,0.3)] transition-all uppercase tracking-widest text-sm active:scale-95 disabled:opacity-50"
                >
                  <Radio className={isBroadcasting ? "w-5 h-5 animate-pulse" : "w-5 h-5"} />
                  {isBroadcasting ? "Broadcasting..." : "Trigger Live Reveal"}
                </button>
             </div>
          </div>
       </header>

        {/* Winner Management Pipeline */}
        <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
                <Users className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xl font-black uppercase tracking-widest text-zinc-900 dark:text-white">Winner Pipeline</h2>
            </div>
            {isLoading ? (
               <div className="flex items-center justify-center p-12 text-zinc-500">
                  <Loader2 className="w-8 h-8 animate-spin" />
               </div>
            ) : (
               <WinnerManagementBoard 
                 entries={entries} 
                 challengeId={challengeId} 
                 companyName={companyName || "The Employer"} 
               />
            )}
        </div>

       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Velocity Area Chart */}
          <div className="p-6 rounded-2xl bg-white/40 dark:bg-black/40 border border-black/5 dark:border-white/5 shadow-2xl col-span-1 lg:col-span-2">
             <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold uppercase tracking-widest text-zinc-900 dark:text-white">Entry Velocity</h2>
             </div>
             <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={volumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                         <linearGradient id="colorEntries" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.5}/>
                           <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                         </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="time" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                         contentStyle={{ backgroundColor: '#05050a', borderColor: '#ffffff20', borderRadius: '12px' }}
                         itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="entries" stroke="#7C3AED" strokeWidth={3} fillOpacity={1} fill="url(#colorEntries)" />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* AI Score Histogram */}
          <div className="p-6 rounded-2xl bg-white/40 dark:bg-black/40 border border-black/5 dark:border-white/5 shadow-2xl">
             <div className="flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold uppercase tracking-widest text-zinc-900 dark:text-white">AI Grading Curve</h2>
             </div>
             <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={scoreHistogram} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                      <XAxis dataKey="range" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                         cursor={{ fill: '#ffffff05' }}
                         contentStyle={{ backgroundColor: '#05050a', borderColor: '#ffffff20', borderRadius: '12px' }}
                      />
                      <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Vote Share Pie Chart */}
          <div className="p-6 rounded-2xl bg-white/40 dark:bg-black/40 border border-black/5 dark:border-white/5 shadow-2xl flex flex-col">
             <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-bold uppercase tracking-widest text-zinc-900 dark:text-white">Spectator Vote Share</h2>
             </div>
             <div className="flex-1 flex items-center justify-center relative min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                      <Pie
                         data={voteShares}
                         cx="50%"
                         cy="50%"
                         innerRadius={80}
                         outerRadius={110}
                         paddingAngle={2}
                         dataKey="votes"
                         stroke="none"
                      >
                         {voteShares.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                         ))}
                      </Pie>
                      <Tooltip 
                         contentStyle={{ backgroundColor: '#05050a', borderColor: '#ffffff20', borderRadius: '12px' }}
                         itemStyle={{ color: '#fff' }}
                      />
                   </PieChart>
                </ResponsiveContainer>
                {/* Center Label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-2">
                   <span className="font-mono text-3xl font-bold text-zinc-900 dark:text-white">843</span>
                   <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Total Votes</span>
                </div>
             </div>
          </div>

       </div>
    </div>
  );
}
