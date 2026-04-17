"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { createClient } from "@/lib/supabase/client";
import { TopEntryCard } from "@/components/forge/TopEntryCard";
import { Share2, Mail } from "lucide-react";

type RevealState = "PRE_REVEAL" | "REVEALING" | "SHOW_3" | "SHOW_2" | "SHOW_1_DRAMA" | "POST_REVEAL";

interface RevealClientProps {
  challenge: any;
  entries: any[];
}

export function RevealClient({ challenge, entries }: RevealClientProps) {
  // If challenge is already completed natively on mount, we can skip the reveal or just show the final state 
  // But let's allow it to start at PRE_REVEAL for the drama anyway if they hit this page, unless forced
  const [revealState, setRevealState] = useState<RevealState>(
    challenge.status === "completed" ? "POST_REVEAL" : "PRE_REVEAL"
  );
  
  const supabase = createClient();

  useEffect(() => {
    // 1. Listen for Supabase Broadcast Event on "reveal-channel"
    const channel = supabase.channel(`challenge-${challenge.id}`);
    
    channel
      .on("broadcast", { event: "trigger-reveal" }, (payload) => {
         console.log("REVEAL INITIATED VIA BROADCAST!", payload);
         startRevealSequence();
      })
      .on(
        "postgres_changes", 
        { event: "UPDATE", schema: "public", table: "forge_challenges", filter: `id=eq.${challenge.id}` }, 
        (payload: any) => {
          if (payload.new.status === "completed" && revealState === "PRE_REVEAL") {
             console.log("REVEAL INITIATED VIA DB TRIGGER!");
             startRevealSequence();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [challenge.id, revealState, supabase]);

  const startRevealSequence = () => {
    // Prevent double triggers
    if (revealState !== "PRE_REVEAL") return;
    
    setRevealState("REVEALING");
    
    // State Machine Timing
    setTimeout(() => {
      setRevealState("SHOW_3");
      setTimeout(() => {
        setRevealState("SHOW_2");
        setTimeout(() => {
          setRevealState("SHOW_1_DRAMA");
          setTimeout(() => {
            setRevealState("POST_REVEAL");
            triggerConfetti();
          }, 3000); // 3 seconds dark drama
        }, 4000); // 4 seconds looking at #2
      }, 4000); // 4 seconds looking at #3
    }, 4000); // 4 seconds scanning REVEALING screen
  };

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#7C3AED', '#EAB308', '#ffffff']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#7C3AED', '#EAB308', '#ffffff']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  // Safe checks for arrays
  const rank1 = entries[0];
  const rank2 = entries[1];
  const rank3 = entries[2];

  // Helper boolean logic
  const isDark = revealState === "REVEALING" || revealState === "SHOW_1_DRAMA";
  const show3 = revealState === "SHOW_3" || revealState === "SHOW_2" || revealState === "POST_REVEAL";
  const show2 = revealState === "SHOW_2" || revealState === "POST_REVEAL";
  const postReveal = revealState === "POST_REVEAL";

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-1000 ${isDark ? 'bg-black' : 'bg-[#05050a]'}`}>
      
      {/* Background Ambience */}
      <AnimatePresence>
        {!isDark && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none"
          >
            <div className="absolute top-1/4 left-1/4 w-[50vh] h-[50vh] bg-violet-600/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[50vh] h-[50vh] bg-pink-600/10 rounded-full blur-[120px]" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6 container mx-auto">
        
        {/* State: PRE_REVEAL */}
        <AnimatePresence>
          {revealState === "PRE_REVEAL" && (
            <motion.div 
              key="pre-reveal"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
              transition={{ duration: 1 }}
              className="text-center space-y-8"
            >
              <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 font-mono text-sm tracking-widest uppercase">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                </span>
                LIVE EVENT
              </div>
              
              <h1 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter">
                The Forge <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-500">Results</span>
              </h1>
              
              <div className="font-mono text-xl md:text-3xl text-zinc-400 space-y-2">
                <p>AWAITING SIGNAL</p>
                <div className="flex justify-center space-x-4 text-violet-500 font-bold blur-[0.5px]">
                  <span>00</span>:<span>00</span>:<span>00</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* State: REVEALING & SHOW_1_DRAMA (Scanning dark screen) */}
        <AnimatePresence>
          {(revealState === "REVEALING" || revealState === "SHOW_1_DRAMA") && (
            <motion.div
              key="revealing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-black"
            >
              <div className="relative">
                <motion.h2 
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="text-3xl md:text-6xl font-black font-mono tracking-[0.5em] text-violet-600"
                >
                  DECRYPTING
                </motion.h2>
                <motion.div 
                  className="absolute inset-0 border-t-2 border-violet-400 opacity-50"
                  animate={{ top: ["-20%", "120%"] }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Stage (Shows during SHOW_3, SHOW_2, POST_REVEAL) */}
        {!isDark && revealState !== "PRE_REVEAL" && (
          <div className="w-full max-w-6xl w-full mx-auto space-y-12">
            
            {postReveal && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-4"
              >
                <h1 className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-500 tracking-tighter">
                  THE CHAMPIONS
                </h1>
                <p className="font-mono text-zinc-400 uppercase tracking-widest">{challenge.title}</p>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
               {/* Rank 2 (Left) */}
               <motion.div 
                 className="order-2 md:order-1 h-full flex flex-col justify-end"
                 initial={false}
               >
                 {rank2 && show2 && (
                   <motion.div
                     initial={{ opacity: 0, x: -50 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ type: "spring", stiffness: 100 }}
                   >
                     <TopEntryCard entry={rank2} rank={2} revealed={true} />
                   </motion.div>
                 )}
                 {rank2 && !show2 && show3 && (
                   <TopEntryCard entry={rank2} rank={2} revealed={false} />
                 )}
               </motion.div>

               {/* Rank 1 (Center) */}
               <motion.div 
                 className="order-1 md:order-2 z-10"
                 layoutId="rank1-card"
               >
                 {rank1 && postReveal && (
                   <TopEntryCard entry={rank1} rank={1} revealed={true} />
                 )}
                 {rank1 && !postReveal && show3 && (
                   <TopEntryCard entry={rank1} rank={1} revealed={false} />
                 )}
               </motion.div>

               {/* Rank 3 (Right) */}
               <motion.div 
                 className="order-3 md:order-3 h-full flex flex-col justify-end"
               >
                 {rank3 && show3 && (
                   <motion.div
                     initial={{ opacity: 0, x: 50 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ type: "spring", stiffness: 100 }}
                   >
                     <TopEntryCard entry={rank3} rank={3} revealed={true} />
                   </motion.div>
                 )}
               </motion.div>
            </div>

            {/* Post Reveal Actions */}
            <AnimatePresence>
               {postReveal && (
                 <motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 2 }}
                   className="pt-12 flex flex-col md:flex-row items-center justify-center gap-4"
                 >
                   <button className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(124,58,237,0.4)]">
                     <Share2 className="w-5 h-5" />
                     <span>Share Results</span>
                   </button>
                   <button className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-white hover:bg-zinc-200 text-zinc-900 font-bold transition-all hover:scale-105 active:scale-95">
                     <Mail className="w-5 h-5" />
                     <span>Contact Winners</span>
                   </button>
                 </motion.div>
               )}
            </AnimatePresence>
            
          </div>
        )}

      </div>
    </div>
  );
}
