"use client";

import React, { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { 
  forceCompleteChallenge, 
  cancelChallenge, 
  featureChallenge, 
  approveFlaggedEntry, 
  removeSubmission, 
  banCandidate,
  triggerJobSeed
} from "./actions";
import Button from "@/components/ui/Button";
import { DollarSign, Zap, Flag, CheckCircle, ShieldBan, Trash, Crown, Target, Users } from "lucide-react";
import Badge from "@/components/ui/Badge";

export function AdminDashboardClient({
  challenges,
  entries,
  votes,
  badges,
  flaggedEntries,
}: {
  challenges: any[];
  entries: any[];
  votes: any[];
  badges: any[];
  flaggedEntries: any[];
}) {

  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handleAction = async (actionFn: () => Promise<void>, actionName: string) => {
     setLoadingAction(actionName);
     try {
       await actionFn();
     } catch(e) {
       console.error(e);
     }
     setLoadingAction(null);
  };

  // ----- STATS CALCULATION -----
  const liveCount = challenges.filter(c => c.status === "live").length;
  const completedThisMonth = challenges.filter(c => c.status === "completed" && new Date(c.created_at).getMonth() === new Date().getMonth()).length;
  const hiredCount = entries.filter(e => e.status === "hired").length;
  
  // Total Revenue derived from challenges payment_amount
  const totalRevenue = challenges.reduce((acc, curr) => acc + (Number(curr.payment_amount) || 0), 0);
  
  // Example product split for Pie Chart (Simulated mapping from challenge tiers)
  const revByProduct = [
    { name: 'Standard Drop ($9.99)', value: challenges.filter(c => Number(c.payment_amount) === 9.99).length * 9.99 },
    { name: 'Sponsored Drop ($19.99)', value: challenges.filter(c => Number(c.payment_amount) === 19.99).length * 19.99 },
    { name: 'Elite Push ($99.00)', value: challenges.filter(c => Number(c.payment_amount) >= 99).length * 99 },
  ].filter(i => i.value > 0);

  const COLORS = ['#7C3AED', '#3B82F6', '#10B981', '#F59E0B'];

  return (
    <div className="space-y-8 pb-32">
       
       {/* 1. HUD Stats */}
       <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="p-6 bg-surface border border-border rounded-3xl col-span-2">
             <div className="flex items-center gap-3 text-muted-foreground mb-4">
                <DollarSign className="w-5 h-5 text-emerald-500" />
                <span className="font-mono text-xs uppercase tracking-widest font-bold">30D Revenue</span>
             </div>
             <div className="text-5xl font-black text-white">${totalRevenue.toFixed(2)}</div>
          </div>
          {[
            { label: "Live Drops", val: liveCount, icon: <Zap className="w-5 h-5 text-rose-500" /> },
            { label: "Total Entries", val: entries.length, icon: <Target className="w-5 h-5 text-primary" /> },
            { label: "Votes Cast", val: votes.length, icon: <Users className="w-5 h-5 text-amber-500" /> },
            { label: "Hired Talent", val: hiredCount, icon: <Crown className="w-5 h-5 text-emerald-500" /> },
          ].map(s => (
             <div key={s.label} className="p-6 bg-surface border border-border rounded-3xl">
                <div className="flex items-center gap-2 text-muted-foreground mb-4">
                   {s.icon} <span className="font-mono text-[10px] uppercase tracking-widest font-bold">{s.label}</span>
                </div>
                <div className="text-3xl font-black text-white">{s.val}</div>
             </div>
          ))}
       </div>

       {/* 2. Charts / Analytics Telemetry */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="p-8 bg-surface border border-border rounded-3xl">
               <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-6">Revenue Mix</h3>
               <div className="h-[250px] w-full">
                  {revByProduct.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={revByProduct} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {revByProduct.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#05050A', borderColor: '#333' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground font-mono text-sm border-dashed border border-white/10 rounded-xl">No Revenue Hooked</div>
                  )}
               </div>
               <div className="space-y-2 mt-4 mt-8 flex flex-wrap gap-4">
                  {revByProduct.map((p, i) => (
                     <div key={i} className="flex items-center gap-2 text-xs font-mono">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                        <span className="text-white">{p.name}</span>
                     </div>
                  ))}
               </div>
           </div>

           {/* Employer Leaderboard Telemetry */}
           <div className="p-8 bg-surface border border-border rounded-3xl col-span-2">
               <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-6">Aggregate Telemetry</h3>
               <div className="grid grid-cols-2 gap-8">
                 <div>
                    <h4 className="text-xs uppercase font-bold text-muted-foreground tracking-widest mb-4">Employer Analytics</h4>
                    <p className="text-sm text-foreground mb-2">Total Unique Employers: {new Set(challenges.map(c => c.employer_id)).size}</p>
                    <p className="text-sm text-foreground">Avg Entries / Drop: {(entries.length / (challenges.length || 1)).toFixed(1)}</p>
                 </div>
                 <div>
                    <h4 className="text-xs uppercase font-bold text-muted-foreground tracking-widest mb-4">Candidate Analytics</h4>
                    <p className="text-sm text-foreground mb-2">Total Badges Minted: {badges.length}</p>
                    <p className="text-sm text-foreground">Average Fraud Risk: {(entries.reduce((acc, c) => acc + (c.fraud_score || 0), 0) / (entries.length || 1)).toFixed(1)}%</p>
                 </div>
               </div>
           </div>
       </div>

       {/* 3. Fraud Queue */}
       <div className="p-8 bg-surface border border-rose-500/20 rounded-3xl shadow-[0_0_40px_rgba(244,63,94,0.05)]">
           <div className="flex items-center gap-3 mb-6">
              <ShieldBan className="w-6 h-6 text-rose-500" />
              <h3 className="text-xl font-bold uppercase tracking-tight text-white">The Fraud Queue</h3>
           </div>
           
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left font-mono">
               <thead className="text-xs text-muted-foreground uppercase bg-black/20">
                 <tr>
                   <th className="px-4 py-3">Score</th>
                   <th className="px-4 py-3">Codename</th>
                   <th className="px-4 py-3">Candidate</th>
                   <th className="px-4 py-3">Challenge ID</th>
                   <th className="px-4 py-3">Actions</th>
                 </tr>
               </thead>
               <tbody>
                  {flaggedEntries.length === 0 && (
                     <tr><td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">Queue is clean.</td></tr>
                  )}
                  {flaggedEntries.map(entry => (
                     <tr key={entry.id} className="border-b border-border/50 bg-rose-500/5">
                        <td className="px-4 py-3 font-bold text-rose-500">{entry.fraud_score || 'FLAGGED'}</td>
                        <td className="px-4 py-3">{entry.codename}</td>
                        <td className="px-4 py-3">{entry.candidates?.first_name} {entry.candidates?.last_name}</td>
                        <td className="px-4 py-3">{entry.challenge_id.slice(0,8)}...</td>
                        <td className="px-4 py-3 flex gap-2">
                           <button onClick={() => handleAction(() => approveFlaggedEntry(entry.id), `app_entry_${entry.id}`)} className="p-1 hover:bg-emerald-500/20 text-emerald-500 rounded"><CheckCircle className="w-4 h-4" /></button>
                           <button onClick={() => handleAction(() => removeSubmission(entry.id), `rem_entry_${entry.id}`)} className="p-1 hover:bg-rose-500/20 text-rose-500 rounded"><Trash className="w-4 h-4" /></button>
                           {!entry.candidates?.is_banned && <button onClick={() => handleAction(() => banCandidate(entry.candidate_id), `ban_${entry.candidate_id}`)} className="p-1 hover:bg-red-900/40 text-red-600 rounded" title="Ban Candidate"><Flag className="w-4 h-4" /></button>}
                        </td>
                     </tr>
                  ))}
               </tbody>
             </table>
           </div>
       </div>

       {/* 4. Challenge Management */}
       <div className="p-8 bg-surface border border-border rounded-3xl">
           <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-6">Drop Command</h3>
           
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
               <thead className="text-xs text-muted-foreground uppercase bg-black/20 font-bold tracking-widest font-mono">
                 <tr>
                   <th className="px-4 py-4 rounded-tl-xl">Challenge Title</th>
                   <th className="px-4 py-4">Company</th>
                   <th className="px-4 py-4">Status</th>
                   <th className="px-4 py-4">Rev</th>
                   <th className="px-4 py-4">Entries</th>
                   <th className="px-4 py-4 rounded-tr-xl">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-border/50">
                 {challenges.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(c => (
                   <tr key={c.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-4 font-medium text-white">{c.title}</td>
                      <td className="px-4 py-4 text-muted-foreground">{c.employers?.company_name}</td>
                      <td className="px-4 py-4"><Badge variant="default" className="bg-primary/20 text-primary border-0">{c.status.toUpperCase()}</Badge></td>
                      <td className="px-4 py-4 text-emerald-400 font-mono">${c.payment_amount || 0}</td>
                      <td className="px-4 py-4 font-mono">{entries.filter(e => e.challenge_id === c.id).length}</td>
                      <td className="px-4 py-4 flex flex-wrap gap-2">
                         {c.status !== "completed" && c.status !== "judging" && c.status !== "cancelled" && (
                            <Button size="sm" variant="outline" className="text-xs h-7 px-2 border-primary/20 text-primary" onClick={() => handleAction(() => forceCompleteChallenge(c.id), `fc_${c.id}`)}>
                               {loadingAction === `fc_${c.id}` ? '...' : 'Force Complete'}
                            </Button>
                         )}
                         {c.status !== "cancelled" && (
                            <Button size="sm" variant="outline" className="text-xs h-7 px-2 border-rose-500/20 text-rose-500" onClick={() => handleAction(() => cancelChallenge(c.id), `cc_${c.id}`)}>
                               Cancel
                            </Button>
                         )}
                      </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
       </div>

       {/* 5. Job Seeding Management */}
       <div className="p-8 bg-surface border border-border rounded-3xl">
           <h3 className="text-xl font-bold uppercase tracking-tight text-white mb-6">Job Seeding Command</h3>
           <div className="flex flex-col gap-4">
             <p className="text-muted-foreground text-sm max-w-2xl">
               Manually trigger the Adzuna job seeder API. This will fetch jobs for the configured countries and insert them into the global job board. Note: A pg_cron job already does this daily at 6:00 AM UTC.
             </p>
             <div className="flex items-center gap-4">
               <Button 
                 onClick={async () => {
                    setLoadingAction('seed_jobs');
                    try {
                      const data = await triggerJobSeed();
                      let msg = data.message || data.error || 'Done.';
                      if (data.errors && data.errors.length > 0) {
                         msg += '\n\nErrors:\n' + data.errors.join('\n');
                      }
                      alert(msg);
                    } catch (err: any) {
                      alert(`Failed to seed jobs: ${err.message}`);
                    }
                    setLoadingAction(null);
                 }}
                 disabled={loadingAction === 'seed_jobs'}
                 className="bg-primary text-white"
               >
                 {loadingAction === 'seed_jobs' ? 'Seeding...' : 'Seed Jobs via Adzuna'}
               </Button>
             </div>
           </div>
       </div>

    </div>
  );
}
