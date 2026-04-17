"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Fingerprint, Shield, Users, User, ArrowRight, Loader2 } from "lucide-react";

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  challengeId: string;
}

export function EntryModal({ isOpen, onClose, challengeId }: EntryModalProps) {
  const router = useRouter();
  
  const [step, setStep] = useState<"auth" | "decrypting" | "revealed">("auth");
  const [entryMode, setEntryMode] = useState<"solo" | "squad" | null>(null);
  const [codename, setCodename] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [mySquad, setMySquad] = useState<any>(null);

  useEffect(() => {
    async function resolveSquad() {
       const supabase = createClient();
       const { data: { user } } = await supabase.auth.getUser();
       if (!user) return;
       const { data: c } = await supabase.from('candidates').select('id').eq('user_id', user.id).single();
       if (!c) return;

       const { data: s } = await supabase.from('forge_squad_members')
           .select('squad_id, forge_squads(name)')
           .eq('candidate_id', c.id)
           .eq('status', 'accepted')
           .single();
       
       if (s && s.forge_squads) setMySquad({ id: s.squad_id, name: (s.forge_squads as any).name });
    }
    if (isOpen) resolveSquad();
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  const handleGenerateIdentity = async () => {
    if (!entryMode) return;
    setStep("decrypting");
    setErrorMsg("");

    try {
      const payload = {
         challenge_id: challengeId,
         squad_id: entryMode === 'squad' && mySquad ? mySquad.id : null
      };

      const res = await fetch("/api/forge/enter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to enter Arena.");
      }

      setCodename(data.codename);
      setTimeout(() => setStep("revealed"), 1500);
      
    } catch (e: any) {
      setErrorMsg(e.message);
      setStep("auth");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-md p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          className="w-full max-w-lg bg-[#0a0a0f] border border-black/10 dark:border-white/10 shadow-[0_0_50px_rgba(124,58,237,0.15)] rounded-3xl overflow-hidden relative"
        >
          <div className="absolute top-4 right-4 z-10">
             <button onClick={onClose} className="p-2 text-muted-foreground hover:text-zinc-900 dark:text-white transition-colors bg-white/50 dark:bg-black/50 rounded-full">✕</button>
          </div>

          {step === "auth" && (
            <div className="p-8 md:p-10 flex flex-col items-center text-center space-y-8">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shadow-[0_0_30px_rgba(124,58,237,0.3)]">
                <Fingerprint className="w-8 h-8 text-primary-light" />
              </div>
              
              <div>
                <h2 className="text-3xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter mb-2">Initialize Entry</h2>
                <p className="text-muted-foreground text-sm font-mono leading-relaxed">
                  Your true identity remains hidden to employers until the final Top 10 Reveal. The Arena demands anonymity.
                </p>
                {errorMsg && <p className="text-rose-500 font-bold text-xs mt-4 uppercase font-mono">{errorMsg}</p>}
              </div>

              <div className="w-full grid grid-cols-2 gap-4">
                <button 
                   onClick={() => setEntryMode("solo")}
                   className={`p-5 rounded-2xl border flex flex-col items-center justify-center gap-3 transition-all ${entryMode === 'solo' ? 'bg-primary/20 border-primary text-primary-light shadow-[inset_0_0_20px_rgba(124,58,237,0.2)]' : 'bg-surface border-black/10 dark:border-white/10 text-muted-foreground hover:bg-black/5 dark:bg-white/5 hover:text-zinc-900 dark:text-white'}`}
                >
                  <User className="w-6 h-6" />
                  <span className="font-bold text-xs uppercase tracking-widest">Solo Run</span>
                </button>
                <button 
                   onClick={() => mySquad ? setEntryMode("squad") : null}
                   className={`p-5 rounded-2xl border flex flex-col items-center justify-center gap-3 transition-all ${
                     !mySquad 
                       ? 'opacity-50 cursor-not-allowed bg-surface border-black/5 dark:border-white/5 text-muted-foreground' 
                       : entryMode === 'squad' 
                         ? 'bg-amber-500/20 border-amber-500 text-amber-500 shadow-[inset_0_0_20px_rgba(245,158,11,0.2)]' 
                         : 'bg-surface border-black/10 dark:border-white/10 text-amber-500/50 hover:bg-black/5 dark:bg-white/5 hover:text-amber-500'
                   }`}
                   title={!mySquad ? "You are not in an active Squad." : `Enter with ${mySquad.name}`}
                >
                  <Users className="w-6 h-6" />
                  <span className="font-bold text-xs uppercase tracking-widest">With Squad</span>
                  {!mySquad && <span className="text-[9px] text-rose-500 uppercase font-mono absolute bottom-2">No Active Squad</span>}
                </button>
              </div>

              <button 
                onClick={handleGenerateIdentity}
                disabled={!entryMode}
                className="w-full btn-glow bg-primary text-white font-bold uppercase tracking-widest text-xs py-4 rounded-xl hover:bg-primary-light transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Shield className="w-4 h-4" /> Generate Identity <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === "decrypting" && (
            <div className="p-16 flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]">
              <div className="relative flex items-center justify-center">
                 <Loader2 className="w-16 h-16 text-primary-light animate-spin absolute" />
                 <Lock className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-2">
                 <h2 className="text-xl font-bold text-zinc-900 dark:text-white uppercase tracking-widest animate-pulse">Decrypting Terminal</h2>
                 <p className="text-xs font-mono text-primary-light uppercase tracking-widest">Generating Secure Handle...</p>
              </div>
            </div>
          )}

          {step === "revealed" && (
            <div className="p-8 md:p-12 flex flex-col items-center text-center space-y-10 min-h-[400px]">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.2)]">
                <Shield className="w-10 h-10 text-emerald-400" />
              </div>
              
              <div className="space-y-4 w-full">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">{entryMode === 'squad' ? 'SQUAD PROTOCOL ENGAGED' : 'Your Temporary Handle'}</p>
                <div className="w-full py-6 bg-white dark:bg-black border border-black/10 dark:border-white/10 rounded-2xl shadow-inner relative overflow-hidden group">
                   <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
                   <h1 className="text-4xl md:text-5xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-primary-light via-white to-primary-light tracking-widest break-all px-4">
                     {entryMode === 'squad' ? mySquad?.name : codename}
                   </h1>
                </div>
              </div>

              <button 
                onClick={() => router.push(`/forge/${challengeId}/submit`)}
                className="w-full btn-glow bg-emerald-500 text-black font-black uppercase tracking-widest text-sm py-5 rounded-2xl hover:bg-emerald-400 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center justify-center gap-3"
              >
                Access Terminal <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
