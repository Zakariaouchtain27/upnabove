"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { Users, Shield, Search, Plus, X, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import { Database } from "@/lib/database.types";

type CandidateResult = Pick<Database['public']['Tables']['candidates']['Row'], "id" | "first_name" | "last_name" | "avatar_url">;

export default function CreateSquadPage() {
  const router = useRouter();
  const { addToast } = useToast();

  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<CandidateResult[]>([]);
  const [searching, setSearching] = useState(false);
  
  const [invites, setInvites] = useState<CandidateResult[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getInitials = (str: string) => {
    if (!str) return "SQ";
    const words = str.trim().split(" ");
    if (words.length >= 2) return `${words[0].charAt(0)}${words[1].charAt(0)}`.toUpperCase();
    return str.substring(0, 2).toUpperCase();
  };

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.length < 2) {
       setSearchResults([]);
       return;
    }
    
    setSearching(true);
    const supabase = createClient();
    // In a real app we'd also filter out our own ID and already-invited IDs
    const { data, error } = await supabase
      .from("candidates")
      .select("id, first_name, last_name, avatar_url")
      .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%`)
      .limit(5);

    setSearching(false);
    if (!error && data) {
       setSearchResults(data);
    }
  };

  const addInvite = (candidate: CandidateResult) => {
    if (invites.length >= 3) {
       return addToast("Squads are limited to 4 members (You + 3 Invites)", "error");
    }
    if (invites.find(i => i.id === candidate.id)) {
       return addToast("Candidate already in staging.", "error");
    }
    setInvites([...invites, candidate]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const removeInvite = (id: string) => {
    setInvites(invites.filter(i => i.id !== id));
  };

  const handleCreateSquad = async () => {
    if (!name.trim()) return addToast("Squad Name is required.", "error");
    
    setIsSubmitting(true);
    try {
       const res = await fetch("/api/forge/squad/create", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
            name,
            tagline,
            inviteIds: invites.map(i => i.id)
         })
       });

       const data = await res.json();
       if (!res.ok) throw new Error(data.error || "Failed to establish Squad.");

       addToast("Squad established! Invites deployed to members.", "success");
       router.push("/dashboard/squad");
    } catch (e: any) {
       addToast(e.message, "error");
    } finally {
       setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05050a] text-foreground font-sans pt-24 pb-32">
       <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
       
       <div className="max-w-3xl mx-auto px-6 relative z-10 space-y-8">
          
          <div className="text-center space-y-4 mb-12">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border bg-amber-500/10 text-amber-500 border-amber-500/20 text-xs font-bold uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                <Shield className="w-4 h-4" /> Multiplayer Enabled
             </div>
             <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight">Form Your Squad</h1>
             <p className="text-muted-foreground font-mono">Team up. Share Streaks. Dominate the Leaderboard.</p>
          </div>

          <div className="bg-black/40 border border-white/5 rounded-3xl p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
             
             {/* Holographic abstract background element */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[100px] pointer-events-none" />

             <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                
                {/* Left: Avatar Preview */}
                <div className="flex flex-col items-center justify-start pt-4 border-b md:border-b-0 md:border-r border-white/5 pb-8 md:pb-0 z-10">
                   <div className="w-32 h-32 rounded-full border-2 border-amber-500/30 bg-gradient-to-br from-[#0a0a0f] to-[#1a1405] shadow-[0_0_40px_rgba(245,158,11,0.15)] flex items-center justify-center mb-6">
                      <span className="text-4xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-br from-amber-400 to-amber-600 tracking-widest">
                         {getInitials(name)}
                      </span>
                   </div>
                   <div className="text-center">
                      <div className="text-sm font-bold text-white uppercase tracking-widest leading-tight">{name || "STEALTH SQUAD"}</div>
                      <div className="text-xs font-mono text-muted-foreground mt-2 px-2">"{tagline || "We hack the planet."}"</div>
                   </div>
                   <div className="mt-8 flex items-center justify-center gap-1">
                      {/* Visual representations of slots */}
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-white border-2 border-black z-10 shrink-0">L</div>
                      {[0, 1, 2].map(idx => (
                         <div key={idx} className={`w-8 h-8 rounded-full border-2 border-black shrink-0 -ml-2 transition-all ${invites[idx] ? 'bg-amber-500' : 'bg-white/5 border-dashed border-white/20'}`} />
                      ))}
                   </div>
                   <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mt-2">{invites.length + 1}/4 Slots Filled</div>
                </div>

                {/* Right: Form Settings */}
                <div className="md:col-span-2 space-y-8 z-10">
                   
                   <div className="space-y-5">
                      <div>
                         <label className="block text-xs font-bold uppercase tracking-widest text-gray-300 mb-2">Squad Handle</label>
                         <input 
                            type="text" 
                            className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white text-lg font-bold placeholder:font-normal focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all placeholder:text-muted-foreground"
                            placeholder="e.g. The Night Owls"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            maxLength={30}
                         />
                      </div>
                      <div>
                         <label className="block text-xs font-bold uppercase tracking-widest text-gray-300 mb-2">Battle Tagline</label>
                         <input 
                            type="text" 
                            className="w-full bg-surface border border-white/10 rounded-xl px-4 py-3 text-white font-mono text-sm focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all placeholder:text-muted-foreground/50"
                            placeholder="Short, punchy intimidation factor."
                            value={tagline}
                            onChange={e => setTagline(e.target.value)}
                            maxLength={60}
                         />
                      </div>
                   </div>

                   {/* Invite Candidates Block */}
                   <div className="pt-6 border-t border-white/5">
                      <div className="flex justify-between items-end mb-4">
                         <label className="block text-xs font-bold uppercase tracking-widest text-gray-300 flex items-center gap-2">
                           <Users className="w-4 h-4 text-amber-500" /> Draft Members (Max 3)
                         </label>
                      </div>

                      <div className="relative mb-4">
                         <Search className="w-4 h-4 text-muted-foreground absolute left-4 top-4" />
                         <input 
                            type="text" 
                            className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white font-mono text-sm focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all placeholder:text-muted-foreground/50"
                            placeholder="Search alias or real name..."
                            value={searchQuery}
                            onChange={handleSearch}
                         />
                         
                         {/* Dropdown Results */}
                         <AnimatePresence>
                            {searchQuery.length > 1 && (
                               <motion.div 
                                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                  className="absolute top-full left-0 right-0 mt-2 bg-surface/90 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 max-h-64 overflow-y-auto"
                               >
                                  {searching ? (
                                     <div className="p-4 flex items-center justify-center"><Loader2 className="w-4 h-4 text-muted-foreground animate-spin" /></div>
                                  ) : searchResults.length > 0 ? (
                                     searchResults.map(res => (
                                        <div key={res.id} className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                                           <div className="flex items-center gap-3">
                                              <img src={res.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback"} className="w-8 h-8 rounded-full bg-black" />
                                              <span className="text-sm font-bold text-white">{res.first_name} {res.last_name}</span>
                                           </div>
                                           <button 
                                              onClick={() => addInvite(res)}
                                              className="p-1.5 rounded-md bg-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-black transition-all"
                                           >
                                              <Plus className="w-4 h-4" />
                                           </button>
                                        </div>
                                     ))
                                  ) : (
                                     <div className="p-4 text-xs font-mono text-muted-foreground text-center">No candidates match protocols.</div>
                                  )}
                               </motion.div>
                            )}
                         </AnimatePresence>
                      </div>

                      {/* Staged Invites */}
                      <div className="space-y-2">
                         {invites.map(invite => (
                            <div key={invite.id} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10 animate-in fade-in zoom-in-95 duration-300">
                               <div className="flex items-center gap-3">
                                  <img src={invite.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=fallback"} className="w-8 h-8 rounded-full bg-black" />
                                  <span className="text-sm font-bold text-gray-300">{invite.first_name} {invite.last_name}</span>
                                  <span className="px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-amber-500/10 text-amber-500 border border-amber-500/20">Pending Invite</span>
                               </div>
                               <button onClick={() => removeInvite(invite.id)} className="text-muted-foreground hover:text-rose-500 transition-colors p-1"><X className="w-4 h-4" /></button>
                            </div>
                         ))}
                         {invites.length === 0 && (
                            <div className="p-4 rounded-xl border border-dashed border-white/10 text-center flex flex-col items-center justify-center opacity-50">
                               <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">No squadmates added. Solo leader start.</span>
                            </div>
                         )}
                      </div>
                      
                   </div>

                </div>
             </div>
          </div>

          <div className="flex justify-between items-center px-4">
             <Link href="/dashboard/squad" className="text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-white transition-colors">
                Cancel Generation
             </Link>
             <button 
                onClick={handleCreateSquad}
                disabled={isSubmitting || !name.trim()}
                className="btn-glow px-8 py-4 rounded-xl font-black font-mono text-xs uppercase tracking-widest bg-gradient-to-r from-amber-500 to-orange-500 text-black hover:from-amber-400 hover:to-orange-400 transition-all shadow-[0_0_25px_rgba(245,158,11,0.5)] flex items-center gap-2 disabled:opacity-50 disabled:grayscale"
             >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                {isSubmitting ? "Generating Base..." : "Establish Squad"} <ArrowRight className="w-4 h-4 ml-1" />
             </button>
          </div>

       </div>
    </div>
  );
}
