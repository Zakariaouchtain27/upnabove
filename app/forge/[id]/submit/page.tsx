"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { CountdownTimer } from "@/components/forge/CountdownTimer";
import { Save, Terminal, ShieldAlert, ArrowRight, Code2, Link as LinkIcon, UploadCloud, AlertTriangle } from "lucide-react";
import confetti from "canvas-confetti";

export default function SubmitForgePage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState<any>(null);
  const [entryInfo, setEntryInfo] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    submission_text: "",
    submission_url: "",
    submission_file_url: "" // Usually a mock S3 link for this phase
  });
  
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    async function loadTerminal() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/auth");

      const { data: candidate } = await supabase.from('candidates').select('id').eq('user_id', user.id).single();
      if (!candidate) return router.push("/forge");

      const { data: cData, error: cErr } = await supabase.from('forge_challenges').select('*').eq('id', id).single();
      if (cErr || !cData) return router.push("/forge");
      setChallenge(cData);

      const { data: eData, error: eErr } = await supabase.from('forge_entries')
        .select('*')
        .eq('challenge_id', id)
        .eq('candidate_id', candidate.id)
        .single();
        
      if (eErr || !eData) {
        // Did not go through Modal `/api/forge/enter`
        addToast("Terminal Access Denied. Initiate entry from the Hub.", "error");
        return router.push(`/forge/${id}`);
      }

      setEntryInfo(eData);

      // Hydrate from DB first
      let loadedData = {
        submission_text: eData.submission_text || "",
        submission_url: eData.submission_url || "",
        submission_file_url: eData.submission_file_url || ""
      };

      // Attempt to hydrate from LocalStorage if newer/exists
      const local = localStorage.getItem(`forge_draft_${id}`);
      if (local) {
        try {
           const parsed = JSON.parse(local);
           // Merge local if fields exist
           if(parsed.submission_text || parsed.submission_url) {
              loadedData = { ...loadedData, ...parsed };
              addToast("Restored from local draft.", "info");
           }
        } catch (e) {}
      }
      
      setFormData(loadedData);
      setLoading(false);
    }
    loadTerminal();
  }, [id, router]);

  // Auto-Save Effect
  useEffect(() => {
    if (loading || isSuccess) return;

    const interval = setInterval(() => {
       localStorage.setItem(`forge_draft_${id}`, JSON.stringify(formData));
       setLastSaved(new Date());
    }, 60000); // 60s

    return () => clearInterval(interval);
  }, [formData, loading, isSuccess, id]);

  const handleManualSave = () => {
    localStorage.setItem(`forge_draft_${id}`, JSON.stringify(formData));
    setLastSaved(new Date());
    addToast("Draft securely buffered.", "success");
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('forge_entries')
        .update({
           submission_text: formData.submission_text,
           submission_url: formData.submission_url,
           submission_file_url: formData.submission_file_url,
           status: 'submitted', // Triggers AI grading cron eventually
           entered_at: new Date().toISOString()
        })
        .eq('id', entryInfo.id);

      if (error) throw error;

      // Clear draft
      localStorage.removeItem(`forge_draft_${id}`);
      
      // Fire Celebration
      triggerConfetti();
      setIsSuccess(true);
      window.scrollTo(0,0);
      
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
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
        colors: ['#7C3AED', '#ffffff', '#10B981']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#7C3AED', '#ffffff', '#10B981']
      });

      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  if (loading) return <div className="min-h-screen bg-[#05050a] flex items-center justify-center font-mono text-primary animate-pulse">BOOTING TERMINAL...</div>;

  if (isSuccess) {
    return (
       <div className="min-h-screen bg-[#05050a] flex items-center justify-center p-6 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
          <div className="w-full max-w-2xl bg-black border border-emerald-500/30 rounded-3xl p-12 text-center shadow-[0_0_80px_rgba(16,185,129,0.1)] relative z-10">
             <div className="w-24 h-24 bg-emerald-500/10 rounded-full border border-emerald-500/50 flex items-center justify-center mx-auto mb-8 shadow-inner">
                 <ShieldAlert className="w-12 h-12 text-emerald-400" />
             </div>
             <h1 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tighter mb-4">Transmission Locked</h1>
             <p className="text-lg text-emerald-500 font-mono mb-8 uppercase tracking-widest">
               Your payload is secure.
             </p>
             <div className="bg-surface border border-white/5 rounded-xl py-8 mb-8">
                 <div className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-2">Assigned Identity</div>
                 <div className="text-4xl font-black font-mono text-primary-light drop-shadow-[0_0_10px_rgba(124,58,237,0.5)]">{entryInfo.codename}</div>
             </div>
             <div className="flex gap-4 justify-center">
                <button onClick={() => router.push('/forge')} className="px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-xs border border-white/10 hover:bg-white/5 transition-all text-white">
                  Return to Hub
                </button>
             </div>
          </div>
       </div>
    );
  }

  const renderInputFields = () => {
    const type = challenge.challenge_type;

    if (type === 'code' || type === 'writing' || type === 'strategy') {
       return (
          <div className="space-y-4 animate-in fade-in duration-500">
             <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary-light">
               <Code2 className="w-4 h-4" /> Tactical Text Buffer
             </label>
             <textarea 
               value={formData.submission_text}
               onChange={e => setFormData({ ...formData, submission_text: e.target.value })}
               className="w-full h-96 bg-black/50 border border-primary/20 rounded-xl p-6 text-gray-300 font-mono text-sm leading-relaxed focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/30 shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]"
               placeholder={type === 'code' ? "// Paste your master algorithm here..." : "Draft your strategy here..."}
             />
             <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span>{(formData.submission_text || "").length} bytes</span>
                <span>Supports Markdown</span>
             </div>
          </div>
       );
    }

    if (type === 'design' || type === 'video' || type === 'data') {
       return (
          <div className="space-y-6 animate-in fade-in duration-500">
             <div className="space-y-4">
               <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-primary-light">
                 <LinkIcon className="w-4 h-4" /> Primary Endpoint URL
               </label>
               <input 
                 type="url"
                 value={formData.submission_url}
                 onChange={e => setFormData({ ...formData, submission_url: e.target.value })}
                 className="w-full bg-black/50 border border-primary/20 rounded-xl px-4 py-4 text-white font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/30"
                 placeholder={type === 'design' ? "https://figma.com/file/..." : "https://youtube.com/watch?v=..."}
               />
             </div>
             <div className="space-y-4">
               <label className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">
                 <UploadCloud className="w-4 h-4" /> Payload Upload (Mock)
               </label>
               <div className="w-full border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-white/5 transition-colors cursor-pointer group">
                  <UploadCloud className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors mb-3" />
                  <span className="font-bold text-sm text-gray-300">Click to select raw payload</span>
                  <span className="text-xs font-mono text-muted-foreground mt-1">Accepts .zip, .pdf (URL simulation mode)</span>
               </div>
               <input 
                 type="text"
                 value={formData.submission_file_url}
                 onChange={e => setFormData({ ...formData, submission_file_url: e.target.value })}
                 className="w-full bg-black/50 border border-white/5 rounded-xl px-4 py-3 text-muted-foreground text-xs font-mono outline-none"
                 placeholder="Mock S3 Bucket String (paste a fake URL here if you want)"
               />
             </div>
          </div>
       );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-[#05050a] text-foreground font-sans flex flex-col pt-16">
       
       {/* Top Status Bar */}
       <div className="fixed top-0 inset-x-0 h-16 bg-black/80 backdrop-blur-md border-b border-white/10 z-40 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
             <Terminal className="w-5 h-5 text-primary" />
             <span className="font-bold font-mono text-sm uppercase tracking-widest text-white hidden md:inline">Arena Terminal :: Active</span>
          </div>
          <div className="flex items-center gap-6">
             {lastSaved && (
                <span className="text-xs font-mono text-emerald-500 flex items-center gap-2 animate-pulse">
                   <Save className="w-3 h-3" /> Auto-saved {lastSaved.toLocaleTimeString()}
                </span>
             )}
             <span className="px-3 py-1 rounded-md bg-white/10 font-bold font-mono text-xs uppercase tracking-widest text-primary-light hidden sm:block">
                {entryInfo.codename}
             </span>
             <div className="flex items-center gap-2 font-mono text-rose-500 bg-rose-500/10 px-3 py-1 rounded-md border border-rose-500/20">
                <CountdownTimer targetTime={challenge.expires_at} size="sm" />
             </div>
          </div>
       </div>

       <div className="flex-1 flex flex-col lg:flex-row mt-16 max-w-7xl mx-auto w-full">
         
         {/* Left Column: The Brief */}
         <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-white/10 p-6 lg:p-8 bg-black/20 overflow-y-auto h-[50vh] lg:h-[calc(100vh-64px)] scrollbar-hide">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-6 flex items-center gap-2">
               <AlertTriangle className="w-4 h-4 text-amber-500" /> Objective Specs
            </h2>
            <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-6 leading-tight">
               {challenge.title}
            </h1>
            <div className="prose prose-sm prose-invert text-muted-foreground font-mono leading-relaxed mb-8">
               {challenge.description}
            </div>

            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white mb-4">Judging Matrix</h3>
            <div className="space-y-2 mb-8">
               {challenge.judging_criteria && challenge.judging_criteria.map((c: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
                     <span className="text-sm font-bold text-gray-300">{c.name}</span>
                     <span className="text-xs font-mono text-primary-light font-bold">{c.weight}%</span>
                  </div>
               ))}
            </div>
         </div>

         {/* Right Column: Submission Area */}
         <div className="w-full lg:w-2/3 p-6 lg:p-10 bg-surface/30 relative flex flex-col">
            <div className="flex-1">
               {renderInputFields()}
            </div>

            <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
               <button onClick={handleManualSave} className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:bg-white/5 transition-all w-full sm:w-auto">
                 <Save className="w-4 h-4" /> Force Buffer Save
               </button>

               <button 
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting || (!formData.submission_text && !formData.submission_url && !formData.submission_file_url)}
                  className="btn-glow flex items-center justify-center gap-2 px-10 py-4 rounded-xl bg-primary text-white text-sm font-black uppercase tracking-[0.2em] hover:bg-primary-light transition-all shadow-[0_0_30px_rgba(124,58,237,0.4)] disabled:opacity-50 disabled:grayscale w-full sm:w-auto"
               >
                 {isSubmitting ? "Encrypting..." : "Lock & Transmit"} <ArrowRight className="w-4 h-4" />
               </button>
            </div>
         </div>

       </div>

    </div>
  );
}
