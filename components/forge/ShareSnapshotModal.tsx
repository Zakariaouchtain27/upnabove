"use client";

import React from "react";
import Modal from "@/components/ui/Modal";
import { Copy, Sparkles, Twitter } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface ShareSnapshotModalProps {
  isOpen: boolean;
  onClose: () => void;
  challengeTitle: string;
  timeLimit: number;
  prizeValue: number;
  entryId?: string;       // Context: Sharing a specific ghost
  candidateRef?: string;  // Context: Sharing with +10 vote referral hook
}

export function ShareSnapshotModal({ isOpen, onClose, challengeTitle, timeLimit, prizeValue, entryId, candidateRef }: ShareSnapshotModalProps) {
  const { addToast } = useToast();
  
  // Construct the viral link merging referrals
  const getViralUrl = () => {
     let base = window.location.href;
     if (candidateRef) {
        // Drop any existing queries safely
        const url = new URL(base);
        url.searchParams.set("ref", candidateRef);
        base = url.toString();
     }
     return base;
  };

  const handleCopy = () => {
     navigator.clipboard.writeText(getViralUrl());
     addToast("Copied viral link to clipboard! Rally your votes.", "success");
     onClose();
  };

  const handleTwitter = () => {
    let text = `The Arena is live! I'm spectating "${challengeTitle}" on The Forge.\n\nCome vote for the ghosts:`;
    if (entryId) {
       text = `I just dropped into The Forge. I'm defending a Ghost with massive code quality on "${challengeTitle}".\n\nDrop a vote on my ghost! 🔥👇\n#TheForge #UpnAbove`;
    }
    const url = encodeURIComponent(getViralUrl());
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${url}`, '_blank');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Live Arena">
      <div className="flex flex-col gap-6">
        
        {/* The Generating Snapshot Card UI */}
        <div className="rounded-2xl bg-black/5 dark:bg-black/5 dark:bg-white/5 border border-border relative overflow-hidden group">
           {entryId ? (
              <div className="relative w-full aspect-[1200/630] rounded-xl overflow-hidden shadow-2xl">
                 <img src={`/api/forge/share-card/${entryId}`} alt="Dynamic Score Card" className="w-full h-full object-cover" />
              </div>
           ) : (
             <div className="p-1 rounded-2xl bg-gradient-to-br from-primary via-indigo-500 to-rose-500 shadow-xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-white/20 dark:bg-black/20 group-hover:bg-transparent transition-colors pointer-events-none" />
               <div className="bg-white dark:bg-white dark:bg-black rounded-xl p-8 relative z-10">
                  <div className="flex items-center justify-between mb-6">
                     <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                        The Forge: Live
                     </span>
                     <Sparkles className="w-5 h-5 text-amber-500" />
                  </div>
                  
                  <h3 className="text-2xl font-black text-gray-900 dark:text-zinc-900 dark:text-white uppercase leading-tight mb-4">
                    {challengeTitle}
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-black/5 dark:border-black/5 dark:border-white/5 font-mono text-sm">
                     <div>
                        <span className="text-muted-foreground block text-xs mb-1 uppercase">Time Limit</span>
                        <span className="font-bold text-gray-900 dark:text-zinc-900 dark:text-white">{timeLimit} Minutes</span>
                     </div>
                     <div>
                        <span className="text-muted-foreground block text-xs mb-1 uppercase">Bounty</span>
                        <span className="font-bold text-emerald-500">${prizeValue}</span>
                     </div>
                  </div>
               </div>
             </div>
           )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
           <button onClick={handleTwitter} className="flex items-center justify-center gap-2 py-3 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-zinc-900 dark:text-white rounded-xl font-bold transition-all">
              <Twitter className="w-4 h-4" /> Post
           </button>
           <button onClick={handleCopy} className="flex items-center justify-center gap-2 py-3 bg-surface border border-border hover:bg-black/5 dark:hover:bg-black/5 dark:bg-white/5 rounded-xl font-bold transition-all">
              <Copy className="w-4 h-4" /> Copy Link
           </button>
        </div>

      </div>
    </Modal>
  );
}
