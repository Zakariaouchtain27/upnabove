"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, BarChart3, Star, Mail, CheckCircle, Eye,
  X, Sparkles, BrainCircuit, ExternalLink, Trophy, Loader2, Inbox
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { createClient } from "@/lib/supabase/client";

export default function EmployerWarRoom() {
  const params = useParams();
  const challengeId = params.id as string;
  const { addToast } = useToast();

  const [entries, setEntries] = useState<any[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEntries() {
      const supabase = createClient();
      const { data } = await supabase
        .from('forge_entries')
        .select('*, candidates(first_name, last_name, avatar_url, id)')
        .eq('challenge_id', challengeId)
        .order('rank', { ascending: true });

      if (data) {
        setEntries(data.map((e: any) => ({
          id: e.id,
          rank: e.rank || 0,
          name: e.candidates ? `${e.candidates.first_name || ''} ${e.candidates.last_name || ''}`.trim() || e.codename : e.codename,
          codename: e.codename,
          score: e.ai_score || 0,
          votes: e.vote_count || 0,
          status: e.status || 'pending',
          ai_critique: e.ai_feedback || 'No AI analysis available yet.',
          repo: e.submission_url || '',
        })));
      }
      setLoading(false);
    }
    loadEntries();
  }, [challengeId]);

  const updateStatus = (id: string, newStatus: string) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));
    if (newStatus === 'hired') addToast("Bounty awarded! Candidate has been marked as Hired.", "success");
    else if (newStatus === 'shortlisted') addToast("Candidate added to your Shortlist.", "success");
    else if (newStatus === 'interviewing') addToast("Interview invitation dispatched.", "info");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-[#05050a] relative">
       
       <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 blur-[150px] rounded-full pointer-events-none" />

       {/* Header */}
       <header className="flex-shrink-0 px-8 py-6 border-b border-black/5 dark:border-white/5 relative z-10 bg-white/40 dark:bg-black/40 backdrop-blur-md">
          <Link href="/employer/forge" className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-zinc-900 dark:text-white transition-colors mb-4 font-mono uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> Back to Overview
          </Link>
          <div className="flex items-center justify-between">
             <div>
                <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white flex items-center gap-3">
                   War Room <span className="text-primary-light font-mono text-sm border border-primary/20 bg-primary/10 px-3 py-1 rounded-md">ID: {challengeId}</span>
                </h1>
                <p className="text-muted-foreground font-mono mt-2">
                   Live candidate unmasking and AI-assisted grading.
                </p>
             </div>
             
             <div className="flex items-center gap-3">
                 <Link href={`/employer/forge/${challengeId}/godview`} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-black hover:shadow-[0_0_20px_rgba(255,111,97,0.4)] transition-all uppercase tracking-widest text-xs">
                    <Eye className="w-4 h-4" /> Enter God View
                 </Link>
                 <Link href={`/employer/forge/${challengeId}/analytics`} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-surface border border-black/10 dark:border-white/10 text-zinc-900 dark:text-white font-bold hover:bg-black/5 dark:bg-white/5 transition-all uppercase tracking-widest text-xs">
                    <BarChart3 className="w-4 h-4 text-emerald-400" /> View Analytics
                 </Link>
              </div>
          </div>
       </header>

       {/* Main Content Split */}
       <div className="flex flex-1 overflow-hidden relative z-10">
          
          {/* Candidates List */}
          <div className={`flex-1 overflow-y-auto p-8 transition-all duration-500 ${selectedEntry ? 'md:pr-[450px]' : ''}`}>
             <div className="space-y-4">
                {entries.map((entry) => (
                   <div 
                      key={entry.id}
                      onClick={() => setSelectedEntry(entry)}
                      className={`group flex items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer ${
                         selectedEntry?.id === entry.id 
                           ? 'bg-primary/10 border-primary/50 shadow-[0_0_20px_rgba(124,58,237,0.15)] ring-1 ring-primary' 
                           : 'bg-surface border-black/5 dark:border-white/5 hover:bg-black/5 dark:bg-white/5 hover:border-white/20'
                      }`}
                   >
                     <div className="flex items-center gap-5">
                        <div className={`font-mono text-xl font-bold w-6 ${entry.rank <= 3 ? 'text-amber-500' : 'text-muted-foreground'}`}>{entry.rank}.</div>
                        
                        <div>
                           <div className="font-bold text-lg text-zinc-900 dark:text-white group-hover:text-primary-light transition-colors flex items-center gap-2">
                              {entry.name}
                              {entry.status === 'shortlisted' && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                              {entry.status === 'hired' && <Trophy className="w-4 h-4 text-emerald-500" />}
                           </div>
                           <div className="font-mono text-xs text-muted-foreground uppercase tracking-widest mt-1">
                              Alias: {entry.codename}
                           </div>
                        </div>
                     </div>

                     <div className="flex items-center gap-12">
                        {/* Scores */}
                        <div className="flex items-center gap-6">
                           <div className="text-center">
                              <div className="font-mono font-bold text-emerald-400 text-xl">{entry.score}</div>
                              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center justify-center gap-1 mt-0.5"><Sparkles className="w-3 h-3"/> AI Score</div>
                           </div>
                           <div className="text-center opacity-50">
                              <div className="font-mono font-bold text-zinc-900 dark:text-white text-xl">{entry.votes}</div>
                              <div className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-0.5">Votes</div>
                           </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                           <button onClick={() => updateStatus(entry.id, 'shortlisted')} disabled={entry.status === 'hired'} className="p-2.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-amber-500/20 text-muted-foreground hover:text-amber-500 transition-colors disabled:opacity-30" title="Shortlist">
                              <Star className="w-4 h-4" />
                           </button>
                           <button onClick={() => updateStatus(entry.id, 'interviewing')} disabled={entry.status === 'hired'} className="p-2.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-blue-500/20 text-muted-foreground hover:text-blue-500 transition-colors disabled:opacity-30" title="Send Interview Invite">
                              <Mail className="w-4 h-4" />
                           </button>
                           <button onClick={() => updateStatus(entry.id, 'hired')} disabled={entry.status === 'hired'} className="p-2.5 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-emerald-500/20 text-muted-foreground hover:text-emerald-500 transition-colors disabled:opacity-30" title="Mark as Hired">
                              <CheckCircle className="w-4 h-4" />
                           </button>
                        </div>
                     </div>
                   </div>
                ))}
             </div>
          </div>

          {/* Sliding AI Summary Panel */}
          <AnimatePresence>
             {selectedEntry && (
                <motion.div
                   initial={{ x: "100%", opacity: 0 }}
                   animate={{ x: 0, opacity: 1 }}
                   exit={{ x: "100%", opacity: 0 }}
                   transition={{ type: "spring", stiffness: 300, damping: 30 }}
                   className="absolute top-0 right-0 bottom-0 w-[450px] bg-black/90 backdrop-blur-3xl border-l border-black/10 dark:border-white/10 shadow-2xl p-8 overflow-y-auto"
                >
                   <div className="flex justify-between items-start mb-8">
                      <div>
                         <div className="font-mono text-xs uppercase tracking-widest text-primary-light font-bold mb-2 flex items-center gap-2">
                           <BrainCircuit className="w-4 h-4" /> Claude 3.5 Analysis
                         </div>
                         <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">{selectedEntry.name}</h2>
                         <p className="font-mono text-sm text-muted-foreground">Rank #{selectedEntry.rank} • Score {selectedEntry.score}/100</p>
                      </div>
                      <button onClick={() => setSelectedEntry(null)} className="p-2 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 text-zinc-900 dark:text-white transition-colors">
                         <X className="w-5 h-5" />
                      </button>
                   </div>

                   <div className="space-y-6">
                      <div className="p-5 rounded-2xl bg-primary/10 border border-primary/20">
                         <h3 className="text-sm font-bold uppercase tracking-widest text-primary-light mb-3">Technical Critique</h3>
                         <p className="text-zinc-700 dark:text-gray-300 font-mono text-sm leading-relaxed">
                            {selectedEntry.ai_critique}
                         </p>
                      </div>

                      <div>
                         <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3">Submission Artifacts</h3>
                         <a href={`https://${selectedEntry.repo}`} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 rounded-xl border border-black/10 dark:border-white/10 bg-surface hover:bg-black/5 dark:bg-white/5 transition-colors group">
                            <span className="font-mono text-sm text-zinc-700 dark:text-gray-300 flex items-center gap-2">
                              {selectedEntry.repo}
                            </span>
                            <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                         </a>
                      </div>

                      <div className="pt-6 border-t border-black/10 dark:border-white/10">
                         <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Quick CRM Actions</h3>
                         <div className="grid grid-cols-2 gap-3">
                            <button onClick={() => updateStatus(selectedEntry.id, 'shortlisted')} className="px-4 py-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 font-bold text-xs uppercase tracking-wider transition-colors">
                               Add to Shortlist
                            </button>
                            <button onClick={() => updateStatus(selectedEntry.id, 'interviewing')} className="px-4 py-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 border border-blue-500/20 font-bold text-xs uppercase tracking-wider transition-colors">
                               Send Invite
                            </button>
                            <button onClick={() => updateStatus(selectedEntry.id, 'hired')} className="col-span-2 px-4 py-3 rounded-xl bg-emerald-500 text-zinc-900 dark:text-white shadow-lg hover:bg-emerald-400 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2">
                               <Trophy className="w-4 h-4" /> Award Bounty & Hire
                            </button>
                         </div>
                      </div>
                   </div>
                </motion.div>
             )}
          </AnimatePresence>

       </div>
    </div>
  );
}
