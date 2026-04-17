"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { Shield, Zap, Users, UserMinus, Plus, LogOut, Check, X, ShieldAlert, ArrowRight } from "lucide-react";
import Link from "next/link";

export function SquadTab({ candidateProfile }: { candidateProfile: any }) {
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [activeSquad, setActiveSquad] = useState<any>(null);
  const [squadMembers, setSquadMembers] = useState<any[]>([]);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      if (!candidateProfile) return;
      
      const supabase = createClient();

      const { data: memberships } = await supabase
         .from('forge_squad_members')
         .select('status, role, squad_id, forge_squads(*)')
         .eq('candidate_id', candidateProfile.id);

      if (memberships) {
         const pendings = memberships.filter(m => m.status === 'pending');
         setPendingInvites(pendings);

         const active = memberships.find(m => m.status === 'accepted');
         if (active && active.forge_squads) {
            setActiveSquad({ ...active.forge_squads, myRole: active.role });
            
            const { data: roster } = await supabase
               .from('forge_squad_members')
               .select('role, joined_at, status, candidates(id, first_name, last_name, avatar_url)')
               .eq('squad_id', active.squad_id);
            if (roster) setSquadMembers(roster);

            const { data: historyData } = await supabase
               .from('forge_entries')
               .select('id, codename, rank, ai_score, vote_count, status, forge_challenges(title, status)')
               .eq('squad_id', active.squad_id)
               .order('entered_at', { ascending: false });
            if (historyData) setHistory(historyData);
         }
      }

      setLoading(false);
    }
    loadData();
  }, [candidateProfile]);

  const respondToInvite = async (squadId: string, action: 'accepted' | 'declined') => {
    const supabase = createClient();
    if (action === 'declined') {
       await supabase.from('forge_squad_members').delete().eq('squad_id', squadId).eq('candidate_id', candidateProfile.id);
       setPendingInvites(prev => prev.filter(i => i.squad_id !== squadId));
       addToast("Deployment declined.", "info");
    } else {
       if (activeSquad) return addToast("You must leave your current squad first.", "error");
       
       const { error } = await supabase.from('forge_squad_members').update({ status: 'accepted' }).eq('squad_id', squadId).eq('candidate_id', candidateProfile.id);
       if (error) return addToast(error.message, "error");
       addToast("Squad deployment confirmed.", "success");
       window.location.reload(); 
    }
  };

  const handleLeaveSquad = async () => {
    const supabase = createClient();
    if (activeSquad.myRole === 'leader' && squadMembers.filter(m => m.status === 'accepted').length > 1) {
       return addToast("Leaders must pass command or disband squad securely first.", "error"); 
    }
    
    await supabase.from('forge_squad_members').delete().eq('squad_id', activeSquad.id).eq('candidate_id', candidateProfile.id);
    
    if (activeSquad.myRole === 'leader') {
       await supabase.from('forge_squads').delete().eq('id', activeSquad.id);
    }
    
    addToast("Squad deployment terminated.", "info");
    setActiveSquad(null);
    setSquadMembers([]);
  };

  const getInitials = (str: string) => {
    if (!str) return "SQ";
    const words = str.trim().split(" ");
    if (words.length >= 2) return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
    return str.substring(0, 2).toUpperCase();
  };

  if (loading) return <div className="py-20 flex justify-center"><Zap className="w-8 h-8 text-primary animate-pulse" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
       
       {pendingInvites.length > 0 && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 shadow-inner">
             <h3 className="text-sm font-bold text-rose-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                <ShieldAlert className="w-4 h-4" /> Pending Squad Drafts
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingInvites.map(invite => (
                   <div key={invite.squad_id} className="bg-white/50 dark:bg-black/50 border border-black/10 dark:border-white/10 rounded-xl p-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div>
                         <div className="font-bold text-zinc-900 dark:text-white tracking-wide">{invite.forge_squads.name}</div>
                         <div className="text-xs font-mono text-muted-foreground mt-1">"{invite.forge_squads.tagline}"</div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                         <button onClick={() => respondToInvite(invite.squad_id, 'declined')} className="p-2 rounded-lg bg-black/5 dark:bg-white/5 text-muted-foreground hover:bg-rose-500/20 hover:text-rose-500 transition-colors">
                            <X className="w-4 h-4" />
                         </button>
                         <button onClick={() => respondToInvite(invite.squad_id, 'accepted')} className="px-4 py-2 rounded-lg bg-rose-500 text-zinc-900 dark:text-white font-bold text-xs uppercase tracking-widest hover:bg-rose-400 transition-colors flex items-center gap-2">
                            <Check className="w-4 h-4" /> Accept Draft
                         </button>
                      </div>
                   </div>
                ))}
             </div>
          </div>
       )}

       {activeSquad ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-1 space-y-8">
                <div className="bg-surface/30 border border-black/5 dark:border-white/5 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden group hover:border-amber-500/30 transition-all">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[50px] pointer-events-none group-hover:bg-amber-500/20 transition-all" />
                   <div className="flex flex-col items-center">
                      <div className="w-24 h-24 rounded-full border border-amber-500/30 bg-gradient-to-br from-black to-amber-900/20 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
                         <span className="text-2xl font-black font-mono text-amber-500 tracking-widest">{getInitials(activeSquad.name)}</span>
                      </div>
                      <h2 className="text-2xl font-black text-zinc-900 dark:text-white tracking-widest uppercase text-center">{activeSquad.name}</h2>
                      <p className="text-xs text-muted-foreground font-mono mt-2 text-center break-words">"{activeSquad.tagline}"</p>
                   </div>

                   <div className="flex items-center justify-between mt-8 pt-6 border-t border-black/5 dark:border-white/5">
                      <div className="text-center">
                         <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">Streak</div>
                         <div className="text-xl font-mono text-primary-light flex justify-center items-center gap-1"><Zap className="w-4 h-4 fill-primary-light" /> {activeSquad.streak}</div>
                      </div>
                      <div className="text-center">
                         <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest mb-1">Badges</div>
                         <div className="text-xl font-mono text-emerald-400 flex justify-center items-center gap-1"><Shield className="w-4 h-4 fill-emerald-500/20" /> {activeSquad.badges?.length || 0}</div>
                      </div>
                   </div>

                   <div className="mt-8">
                      <Link href={`/forge/squad/${activeSquad.id}`} className="w-full flex justify-center items-center py-3 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 text-zinc-900 dark:text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-colors">
                         View Public Holo
                      </Link>
                   </div>
                </div>

                {activeSquad.myRole === 'leader' && squadMembers.length < 4 && (
                   <Link href="/forge/squad/create" className="w-full h-24 border-2 border-dashed border-primary/30 rounded-2xl flex flex-col items-center justify-center text-primary hover:bg-primary/5 hover:border-primary/50 transition-all cursor-pointer">
                      <Plus className="w-6 h-6 mb-1" />
                      <span className="text-xs font-mono uppercase tracking-widest">Draft 00{squadMembers.length + 1}</span>
                   </Link>
                )}
             </div>

             <div className="lg:col-span-2 space-y-8">
                <div className="bg-surface/30 border border-black/5 dark:border-white/5 rounded-3xl p-8 backdrop-blur-md">
                   <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-widest text-primary-light">Current Roster</h3>
                   </div>
                   <div className="space-y-3">
                      {squadMembers.map((member, i) => {
                         const c = member.candidates as any;
                         return (
                         <div key={i} className={`flex items-center gap-4 p-4 rounded-xl border ${member.status === 'pending' ? 'bg-black/20 border-black/5 dark:border-white/5 opacity-50' : 'bg-white/40 dark:bg-black/40 border-black/10 dark:border-white/10'}`}>
                            <img src={c.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback"} className="w-10 h-10 rounded-full bg-white dark:bg-black border border-white/20 shrink-0" />
                            <div className="flex-1 min-w-0">
                               <div className="font-bold text-zinc-900 dark:text-white truncate text-sm flex items-center gap-2">
                                  {c.first_name} {c.last_name}
                                  {member.status === 'pending' && <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 text-[9px] uppercase tracking-widest border border-amber-500/20">Awaiting Comm</span>}
                               </div>
                               <div className={`text-xs uppercase tracking-widest mt-1 font-mono ${member.role === 'leader' ? 'text-primary' : 'text-muted-foreground'}`}>{member.role}</div>
                            </div>
                            {activeSquad.myRole === 'leader' && c.id !== candidateProfile.id && (
                               <button onClick={() => addToast("Member discharge protected by protocol for MVP", "error")} className="p-2 text-muted-foreground hover:text-rose-500 transition-colors">
                                  <UserMinus className="w-4 h-4" />
                               </button>
                            )}
                         </div>
                         );
                      })}
                   </div>
                   <div className="mt-8 pt-6 border-t border-black/5 dark:border-white/5 flex justify-end">
                      <button onClick={handleLeaveSquad} className="flex items-center gap-2 px-4 py-2 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 transition-all rounded-lg">
                         <LogOut className="w-4 h-4" /> Desync Identity
                      </button>
                   </div>
                </div>

                <div className="bg-surface/30 border border-black/5 dark:border-white/5 rounded-3xl p-8 backdrop-blur-md">
                   <h3 className="text-lg font-bold text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-2 mb-6">
                      <Users className="w-5 h-5 text-emerald-400" /> Commanded Bounties
                   </h3>
                   {history.length === 0 ? (
                      <div className="text-center py-12 px-4 border border-dashed border-black/10 dark:border-white/10 rounded-2xl">
                         <h4 className="text-zinc-700 dark:text-gray-300 font-bold tracking-widest uppercase text-sm mb-2">Zero Deployments</h4>
                         <p className="text-muted-foreground font-mono text-xs max-w-sm mx-auto">This squad has not executed any combined Bounties under the current Commander.</p>
                      </div>
                   ) : (
                      <div className="space-y-4">
                         {history.map((entry, idx) => (
                            <div key={idx} className="flex items-center justify-between p-4 bg-white/40 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl">
                               <div className="flex-1">
                                  <div className="text-xs font-bold uppercase tracking-widest text-primary-light mb-1">{(entry.forge_challenges as any)?.status || "Live"}</div>
                                  <div className="font-bold text-zinc-900 dark:text-white truncate max-w-[200px] sm:max-w-md">{(entry.forge_challenges as any)?.title || "Classified Bounty"}</div>
                               </div>
                               <div className="text-right">
                                  <div className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-1">Team AI Score</div>
                                  <div className="font-black text-xl text-emerald-400">{entry.ai_score || "-"}</div>
                               </div>
                            </div>
                         ))}
                      </div>
                   )}
                </div>
             </div>
          </div>
       ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center bg-surface/30 border border-black/5 dark:border-white/5 rounded-3xl backdrop-blur-md px-4 relative overflow-hidden group">
             <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary-light to-transparent opacity-30" />
             <div className="w-24 h-24 rounded-full border border-primary/30 flex items-center justify-center mb-6 bg-primary/5 shadow-inner">
                <Users className="w-10 h-10 text-primary-light" />
             </div>
             <h2 className="text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-widest mb-4">No Squad Detected</h2>
             <p className="text-muted-foreground font-mono max-w-lg mb-10 leading-relaxed">
                The Arena is brutal for a Solo run. Generate a Squad handle, deploy invites to your network, and combine output variables to dominate Leaderboards collectively.
             </p>
             <Link href="/forge/squad/create" className="btn-glow px-10 py-4 bg-primary hover:bg-primary-light text-zinc-900 dark:text-white rounded-xl font-bold uppercase tracking-widest text-sm flex items-center gap-2 shadow-[0_0_30px_rgba(124,58,237,0.3)] transition-all">
                Deploy New Squad <ArrowRight className="w-5 h-5 ml-1" />
             </Link>
          </div>
       )}
    </div>
  );
}
