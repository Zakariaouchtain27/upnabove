import React from "react";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Shield, Zap, Users, Trophy } from "lucide-react";
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  return {
    title: "Squad Profile - The Forge",
    description: "View Arena Squad Statistics and Rankings",
  };
}

export default async function SquadProfilePage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  // 1. Resolve Squad Base Data
  const { data: squad } = await supabase
     .from('forge_squads')
     .select('*')
     .eq('id', params.id)
     .single();

  if (!squad) {
     return notFound();
  }

  // 2. Resolve Roster
  const { data: roster } = await supabase
     .from('forge_squad_members')
     .select('role, joined_at, status, candidates(first_name, last_name, avatar_url, user_name)')
     .eq('squad_id', params.id);

  // We only display members who actually Accepted the draft
  const activeRoster = roster ? roster.filter(m => m.status === 'accepted') : [];

  const getInitials = (str: string) => {
    if (!str) return "SQ";
    const words = str.trim().split(" ");
    if (words.length >= 2) return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
    return str.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#05050a] text-foreground font-sans pt-32 pb-32 relative">
       {/* Holographic BG */}
       <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-amber-500/10 via-transparent to-transparent pointer-events-none" />
       
       <div className="max-w-4xl mx-auto px-6 space-y-12 relative z-10">
          
          {/* Hero Banner */}
          <div className="flex flex-col items-center justify-center text-center space-y-6">
             <div className="w-40 h-40 rounded-full border-4 border-[#05050a] bg-gradient-to-br from-amber-600 to-orange-400 flex items-center justify-center shadow-[0_0_80px_rgba(245,158,11,0.3)] relative">
                <span className="text-5xl font-black font-mono text-black uppercase tracking-widest">{getInitials(squad.name)}</span>
                
                {/* Visual Flair */}
                <div className="absolute -bottom-4 bg-teal-500/10 border border-teal-500/30 text-teal-400 font-bold px-4 py-1.5 rounded-full text-[10px] uppercase tracking-[0.3em] backdrop-blur-md shadow-[0_0_20px_rgba(20,184,166,0.3)] flex items-center gap-1">
                   <Shield className="w-3 h-3" /> VERIFIED SQUAD
                </div>
             </div>
             
             <div className="space-y-2 mt-4">
                <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter drop-shadow-md">{squad.name}</h1>
                <p className="text-lg text-amber-500 font-mono tracking-widest italic">"{squad.tagline || 'We hack the planet.'}"</p>
             </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 border border-white/5 rounded-3xl bg-black/40 backdrop-blur-md p-6 divide-x divide-white/5">
             <div className="flex flex-col items-center justify-center">
                <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-2">Members</span>
                <span className="text-3xl font-black text-white font-mono">{activeRoster.length}<span className="text-lg text-muted-foreground">/4</span></span>
             </div>
             <div className="flex flex-col items-center justify-center">
                <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-2">Deployments</span>
                <span className="text-3xl font-black text-primary-light font-mono flex items-center gap-1"><Zap className="w-5 h-5" /> {squad.streak} <span className="text-lg">Streak</span></span>
             </div>
             <div className="flex flex-col items-center justify-center">
                <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-2">Badges</span>
                <span className="text-3xl font-black text-emerald-400 font-mono flex items-center gap-1"><Trophy className="w-5 h-5" /> {squad.badges?.length || 0}</span>
             </div>
          </div>

          {/* Loadout Section */}
          <div className="space-y-6">
             <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-white flex items-center gap-2 border-b border-white/10 pb-4">
                <Users className="w-4 h-4 text-primary" /> Active Duty Roster
             </h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeRoster.map((member, idx) => {
                   const c = member.candidates as any;
                   return (
                   <div key={idx} className="bg-surface/30 border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:border-white/10 transition-colors">
                      <img src={c.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback"} className="w-12 h-12 rounded-xl bg-black border border-white/10 shrink-0" />
                      <div>
                         <div className="font-bold text-white tracking-wide">{c.first_name} {c.last_name}</div>
                         <div className={`text-[10px] font-mono uppercase tracking-[0.2em] mt-1 ${member.role === 'leader' ? 'text-amber-500' : 'text-primary-light'}`}>
                            {member.role === 'leader' ? 'Squad Commander' : 'Tactical Operator'}
                         </div>
                      </div>
                   </div>
                   );
                })}
             </div>
          </div>

       </div>
    </div>
  );
}
