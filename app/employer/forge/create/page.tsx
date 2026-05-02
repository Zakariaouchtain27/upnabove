"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import { 
  ArrowLeft, ArrowRight, CheckCircle2, Wand2, Palette, Code2, 
  Lightbulb, PenTool, Database, Video, Clock, Users, Trophy, 
  Target, Calendar, CreditCard, Sparkles, Loader2, AlertTriangle, Copy, BrainCircuit,
  Megaphone, Crown, UploadCloud, Flame
} from "lucide-react";

type ChallengeType = 'design' | 'code' | 'strategy' | 'writing' | 'data' | 'video';
type Difficulty = 'junior' | 'mid' | 'senior';
type Tier = 'standard' | 'premium' | 'enterprise';
type PrizeType = 'Cash' | 'Gift Card' | 'Product' | 'Job Offer';
type AnnounceStyle = 'Quiet' | 'Public post' | 'Press release';

const TypeIcons = {
  design: <Palette className="w-6 h-6" />,
  code: <Code2 className="w-6 h-6" />,
  strategy: <Lightbulb className="w-6 h-6" />,
  writing: <PenTool className="w-6 h-6" />,
  data: <Database className="w-6 h-6" />,
  video: <Video className="w-6 h-6" />,
};

interface ImprovedBriefData {
  suggested_title: string;
  improved_description: string;
  checklist: string[];
  red_flags: string[];
}

interface ValidationWarning {
  severity: 'high' | 'low';
  message: string;
}

export default function CreateChallengePage() {
  const router = useRouter();
  const { addToast } = useToast();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [claudeThinking, setClaudeThinking] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // AI Augmentation States
  const [improvedBrief, setImprovedBrief] = useState<ImprovedBriefData | null>(null);
  const [originalDescription, setOriginalDescription] = useState("");
  const [originalTitle, setOriginalTitle] = useState("");
  const [warnings, setWarnings] = useState<ValidationWarning[] | null>(null);

  // Timezone-aware date formatting for datetime-local input
  const toLocalISO = (date: Date) => {
    const tzOffset = date.getTimezoneOffset() * 60000; // offset in milliseconds
    const localISOTime = (new Date(date.getTime() - tzOffset)).toISOString().slice(0, 16);
    return localISOTime;
  };

  const defaultDrop = new Date();
  defaultDrop.setDate(defaultDrop.getDate() + 1);
  defaultDrop.setHours(19, 0, 0, 0); // Default to 7 PM

  const defaultExpire = new Date(defaultDrop);
  defaultExpire.setDate(defaultExpire.getDate() + 3);
  defaultExpire.setHours(23, 59, 0, 0); // Default to end of day

  const [formData, setFormData] = useState({
    title: "",
    challenge_type: "code" as ChallengeType,
    difficulty: "mid" as Difficulty,
    time_limit_minutes: 60,
    max_participants: 100,
    
    description: "",
    judging_criteria: [{ name: "Performance", weight: 50 }, { name: "Code Quality", weight: 50 }],
    
    prize_description: "Origin Bounty",
    prize_value: 500,
    drop_time: toLocalISO(defaultDrop),
    expires_at: toLocalISO(defaultExpire),
    
    // Sponsorship Toggle & Fields
    is_sponsored: false,
    sponsor_name: "",
    sponsor_logo_url: "",
    prize_type: "Cash" as PrizeType,
    announcement_style: "Public post" as AnnounceStyle,
    
    tier: "standard" as Tier
  });

  const updateForm = (key: string, value: any) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNext = () => {
    if (step === 2) {
      triggerValidation();
    }
    setStep(prev => Math.min(prev + 1, 3));
  };

  const handleBack = () => setStep(prev => Math.max(prev - 1, 1));

  const handleAIImprove = async () => {
    if (!formData.description) return addToast("Provide a raw brief description first.", "error");
    setClaudeThinking(true);
    setOriginalDescription(formData.description);
    setOriginalTitle(formData.title);

    try {
      const res = await fetch("/api/forge/improve-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          challenge_type: formData.challenge_type,
          difficulty: formData.difficulty,
          judging_criteria: formData.judging_criteria
        })
      });
      if (!res.ok) throw new Error("Anthropic API Error");
      const data: ImprovedBriefData = await res.json();
      setImprovedBrief(data);
      addToast("Claude expertly analyzed and audited your brief.", "success");
    } catch (err) {
      addToast("AI Augmentation failed. Check your API key.", "error");
      console.error(err);
    } finally {
      setClaudeThinking(false);
    }
  };

  const acceptImprovedBrief = () => {
    if(!improvedBrief) return;
    updateForm('description', improvedBrief.improved_description);
    updateForm('title', improvedBrief.suggested_title);
    setImprovedBrief(null);
    addToast("Applied AI architectural improvements.", "success");
  };

  const rejectImprovedBrief = () => {
    updateForm('description', originalDescription);
    updateForm('title', originalTitle);
    setImprovedBrief(null);
  };

  const triggerValidation = async () => {
    setIsValidating(true);
    setWarnings(null);
    try {
      const res = await fetch("/api/forge/validate-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error("Validation API error");
      const data = await res.json();
      setWarnings(data.warnings || []);
    } catch (e) {
      console.error("Validation failed", e);
    } finally {
      setIsValidating(false);
    }
  };

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const supabase = createClient();

    const { error } = await supabase.storage
      .from('logos')
      .upload(fileName, file, { upsert: true });

    if (error) {
      addToast("Failed to upload logo: " + error.message, "error");
    } else {
      const { data: urlData } = supabase.storage.from('logos').getPublicUrl(fileName);
      updateForm('sponsor_logo_url', urlData.publicUrl);
      addToast("Logo uploaded!", "success");
    }
    setIsUploading(false);
  };

  const handleCheckout = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    addToast("Initiating orbital drop sequence...", "info");
    
    try {
       const supabase = createClient();
       const { data: { user } } = await supabase.auth.getUser();
       
       if (!user) {
         throw new Error("Authentication session lost. Please log in again.");
       }

       // Only execute Lemon Squeezy integration if Sponsored Toggle is ON
       if (formData.is_sponsored) {
           const checkoutRes = await fetch("/api/forge/sponsor/checkout", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({ tier: formData.tier, challengeData: formData })
           });
           
           if(!checkoutRes.ok) throw new Error("Lemon Squeezy Checkout Failed");
           
           const checkoutData = await checkoutRes.json();
           
           // Mimic sending them to Stripe/Lemon Squeezy by waiting
           // and instead immediately inserting directly here for mock purposes.
           const insertData = {
              employer_id: user.id, 
              title: formData.title || "The Arena Challenge",
              description: formData.description || "Survive the brief.",
              challenge_type: formData.challenge_type,
              difficulty: formData.difficulty,
              time_limit_minutes: formData.time_limit_minutes,
              max_participants: formData.max_participants,
              prize_description: formData.prize_description,
              prize_value: formData.prize_value,
              drop_time: new Date(formData.drop_time).toISOString(),
              expires_at: new Date(formData.expires_at).toISOString(),
              status: 'scheduled',
              is_sponsored: true,
              sponsor_name: formData.sponsor_name,
              sponsor_logo_url: formData.sponsor_logo_url || "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Square_Cash_app_logo.svg/2048px-Square_Cash_app_logo.svg.png",
              prize_type: formData.prize_type,
              announcement_style: formData.announcement_style
           };

           const { error } = await supabase.from('forge_challenges').insert(insertData);
           if (error) throw new Error(`Database error: ${error.message}`);

           addToast("Sponsorship Paid + Drop is scheduled via Lemon Squeezy!", "success");
           router.push(checkoutData.checkoutUrl);
           return;
       }

       // Otherwise standard 'Free' push to supabase
       const insertData = {
          employer_id: user.id, 
          title: formData.title,
          description: formData.description,
          challenge_type: formData.challenge_type,
          difficulty: formData.difficulty,
          time_limit_minutes: formData.time_limit_minutes,
          max_participants: formData.max_participants,
          prize_description: formData.prize_description,
          prize_value: formData.prize_value,
          drop_time: new Date(formData.drop_time).toISOString(),
          expires_at: new Date(formData.expires_at).toISOString(),
          status: 'scheduled',
          is_sponsored: false
       };

       const { error } = await supabase.from('forge_challenges').insert(insertData);
       if (error) throw new Error(`Database error: ${error.message}`);

       addToast("Free Standard Drop Created!", "success");
       router.push("/employer/forge");
    } catch (err: any) {
       console.error("Deploy failure:", err);
       addToast(`Deployment failed: ${err.message}`, "error");
       setIsSubmitting(false); // Reset state so they can try again
    } finally {
       // We don't necessarily set isSubmitting(false) if we are redirecting
       // but for errors it's handled in catch.
    }
  };

  return (
    <div className="min-h-screen bg-[#05050a] text-white font-sans pt-20 pb-32 relative overflow-hidden">
       {/* Background Aesthetics */}
       <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />
       <div className="glow-orb-primary -top-40 -right-40 opacity-30" />
       <div className="glow-orb-cyan -bottom-40 -left-40 opacity-20" />
       <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
       
       <div className="max-w-5xl mx-auto px-6 relative z-10">
          
          <div className="mb-12">
             <Link href="/employer/forge" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-zinc-900 dark:text-white transition-colors mb-8 font-mono tracking-widest uppercase">
                <ArrowLeft className="w-4 h-4" /> Back to Overview
             </Link>
             <h1 className="text-5xl font-black text-white uppercase tracking-tighter mb-8 flex items-center gap-4">
                <span className="p-3 rounded-2xl bg-primary/20 border border-primary/50 shadow-[0_0_20px_rgba(255,111,97,0.3)]">
                  <Flame className="w-8 h-8 text-primary" />
                </span>
                Forge a Drop
             </h1>
             
             {/* Styled Step Nodes */}
             <div className="flex items-center gap-4 max-w-2xl">
                {[
                  { id: 1, label: "Basics" },
                  { id: 2, label: "The Brief" },
                  { id: 3, label: "Deploy" }
                ].map((s, i) => (
                  <React.Fragment key={s.id}>
                    <div className="flex flex-col items-center gap-2">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                          step >= s.id 
                            ? "bg-primary border-primary shadow-[0_0_15px_rgba(255,111,97,0.6)] text-white" 
                            : "bg-surface border-white/10 text-muted-foreground"
                       }`}>
                          {step > s.id ? <CheckCircle2 className="w-5 h-5" /> : <span className="text-xs font-black">{s.id}</span>}
                       </div>
                       <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${step >= s.id ? "text-primary" : "text-muted-foreground"}`}>
                          {s.label}
                       </span>
                    </div>
                    {i < 2 && (
                       <div className="flex-1 h-px bg-white/10 relative overflow-hidden">
                          <motion.div 
                             className="absolute inset-0 bg-primary shadow-[0_0_10px_rgba(255,111,97,0.5)]"
                             initial={{ x: "-100%" }}
                             animate={{ x: step > s.id ? "0%" : "-100%" }}
                             transition={{ duration: 0.5 }}
                          />
                       </div>
                    )}
                  </React.Fragment>
                ))}
             </div>
          </div>

          <div className="bg-white/40 dark:bg-black/40 border border-black/5 dark:border-white/5 shadow-2xl rounded-3xl p-8 md:p-12 backdrop-blur-md">
             <AnimatePresence mode="wait">
                
                {/* STEP 1: BASICS */}
                {step === 1 && (
                   <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                     <div>
                        <label className="block text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white mb-3">Challenge Title</label>
                        <input 
                           type="text" 
                           placeholder="e.g. Build a High-Frequency Trading UI"
                           className="w-full bg-surface border border-black/10 dark:border-white/10 rounded-xl px-5 py-4 text-zinc-900 dark:text-white text-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground placeholder:font-mono"
                           value={formData.title}
                           onChange={e => updateForm('title', e.target.value)}
                        />
                     </div>
                     <div>
                        <label className="block text-sm font-bold uppercase tracking-widest text-white mb-3 flex items-center gap-2">
                           <Target className="w-4 h-4 text-primary" /> Combat Type
                        </label>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                           {Object.entries(TypeIcons).map(([type, icon]) => (
                              <button 
                                 key={type}
                                 onClick={() => updateForm('challenge_type', type)}
                                 className={`relative group flex flex-col items-center justify-center p-8 rounded-3xl border-2 transition-all duration-300 ${
                                    formData.challenge_type === type 
                                      ? "bg-primary/10 border-primary shadow-[0_0_30px_rgba(255,111,97,0.2)]" 
                                      : "bg-surface border-white/5 hover:border-white/20 hover:bg-white/5"
                                 }`}
                              >
                                 {formData.challenge_type === type && (
                                    <motion.div 
                                       layoutId="activeType"
                                       className="absolute inset-0 rounded-3xl border-2 border-primary shadow-[inset_0_0_15px_rgba(255,111,97,0.3)]"
                                       initial={false}
                                       transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                 )}
                                 <div className={`relative z-10 transition-transform duration-300 group-hover:scale-110 ${formData.challenge_type === type ? "text-primary-light" : "text-muted-foreground"}`}>
                                    {icon}
                                 </div>
                                 <span className={`relative z-10 mt-4 font-black uppercase tracking-[0.2em] text-[10px] transition-colors ${formData.challenge_type === type ? "text-white" : "text-muted-foreground"}`}>
                                    {type}
                                 </span>
                              </button>
                           ))}
                        </div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                           <label className="block text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white mb-3">Difficulty</label>
                           <select 
                              className="w-full bg-surface border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none font-mono"
                              value={formData.difficulty}
                              onChange={e => updateForm('difficulty', e.target.value)}
                           >
                              <option value="junior">Junior</option>
                              <option value="mid">Mid</option>
                              <option value="senior">Senior</option>
                           </select>
                        </div>
                        <div>
                           <label className="block text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-500" /> Time (Min)</label>
                           <input 
                              type="number" 
                              className="w-full bg-surface border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none font-mono"
                              value={formData.time_limit_minutes}
                              onChange={e => updateForm('time_limit_minutes', parseInt(e.target.value))}
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-amber-500" /> Max Entrants</label>
                           <input 
                              type="number" 
                              className="w-full bg-surface border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none font-mono"
                              value={formData.max_participants}
                              onChange={e => updateForm('max_participants', parseInt(e.target.value))}
                           />
                        </div>
                     </div>
                   </motion.div>
                )}

                {/* STEP 2: THE BRIEF, AI & SPONSORSHIP */}
                {step === 2 && (
                   <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                     
                     <div className="flex justify-end mb-6">
                         <label className="relative inline-flex items-center cursor-pointer group">
                             <input type="checkbox" className="sr-only peer" checked={formData.is_sponsored} onChange={e => updateForm('is_sponsored', e.target.checked)} />
                             <div className="w-14 h-7 bg-black/10 dark:bg-white/10 rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-amber-400 peer-checked:to-amber-600 border border-black/10 dark:border-white/10 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]">
                                 <div className={`w-5 h-5 bg-white rounded-full mt-1 ml-1 transition-all flex items-center justify-center shadow-lg ${formData.is_sponsored ? 'translate-x-7' : ''}`}>
                                    {formData.is_sponsored && <Crown className="w-3 h-3 text-amber-500" />}
                                 </div>
                             </div>
                             <span className="ml-3 text-xs font-bold uppercase tracking-widest text-muted-foreground group-hover:text-amber-400 transition-colors">
                               Make it Sponsored <Sparkles className="inline w-3 h-3 ml-1" />
                             </span>
                         </label>
                     </div>

                     <AnimatePresence>
                        {formData.is_sponsored && (
                           <motion.div 
                              initial={{ opacity: 0, height: 0 }} 
                              animate={{ opacity: 1, height: 'auto' }} 
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden"
                           >
                              <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 shadow-[0_0_30px_rgba(245,158,11,0.05)] mb-8 space-y-6">
                                 <h3 className="text-sm font-bold uppercase tracking-widest text-amber-500 flex items-center gap-2">
                                    <Crown className="w-5 h-5" /> Brand Hype Setup
                                 </h3>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                       <label className="block text-xs font-bold uppercase tracking-widest text-zinc-700 dark:text-gray-300 mb-2">Company Name</label>
                                       <input type="text" placeholder="e.g. Acme Corp" className="w-full bg-surface border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none" value={formData.sponsor_name} onChange={e => updateForm('sponsor_name', e.target.value)} />
                                    </div>
                                    <div>
                                       <label className="block text-xs font-bold uppercase tracking-widest text-zinc-700 dark:text-gray-300 mb-2">Announcement Style</label>
                                       <select className="w-full bg-surface border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none font-mono" value={formData.announcement_style} onChange={e => updateForm('announcement_style', e.target.value)}>
                                          <option value="Quiet">Quiet</option>
                                          <option value="Public post">Public post</option>
                                          <option value="Press release">Press release</option>
                                       </select>
                                    </div>
                                    <div className="md:col-span-2 flex items-center gap-4">
                                       <div onClick={() => fileInputRef.current?.click()} className="w-16 h-16 rounded-xl bg-white dark:bg-black border border-black/10 dark:border-white/10 flex items-center justify-center flex-shrink-0 cursor-pointer overflow-hidden relative">
                                          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUploadLogo} />
                                          {isUploading ? <Loader2 className="w-6 h-6 text-primary animate-spin" /> : formData.sponsor_logo_url ? <img src={formData.sponsor_logo_url} className="w-full h-full object-cover" alt="logo" /> : <UploadCloud className="w-6 h-6 text-muted-foreground" />}
                                       </div>
                                       <div className="flex-1">
                                          <label className="block text-xs font-bold uppercase tracking-widest text-zinc-700 dark:text-gray-300 mb-2">Logo URL</label>
                                          <input type="text" placeholder="https://cdn.example.com/logo.png" className="w-full bg-surface border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none font-mono" value={formData.sponsor_logo_url} onChange={e => updateForm('sponsor_logo_url', e.target.value)} />
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </motion.div>
                        )}
                     </AnimatePresence>

                     <div className="flex items-center justify-between pt-4 border-t border-black/5 dark:border-white/5">
                         <label className="block text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white">The Brief</label>
                         <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-xs font-bold font-mono text-muted-foreground opacity-60">
                            <Wand2 className="w-3.5 h-3.5" />
                            AI Improve (Coming Soon)
                         </div>
                     </div>

                      {/* AI Side-by-Side Diff Viewer */}
                      {improvedBrief ? (
                         <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                               <div className="flex flex-col border border-white/5 rounded-2xl bg-black/40 h-96 overflow-hidden">
                                  <div className="bg-white/5 py-3 px-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-white/5 flex items-center justify-between">
                                     <span>Original Logic</span>
                                     <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                  </div>
                                  <div className="p-6 text-sm text-muted-foreground line-through opacity-50 whitespace-pre-wrap font-mono overflow-y-auto leading-relaxed">{originalDescription}</div>
                               </div>
                               <div className="flex flex-col border border-primary/30 rounded-2xl bg-primary/5 h-96 overflow-hidden shadow-[0_0_40px_rgba(255,111,97,0.1)]">
                                  <div className="bg-primary/20 py-3 px-5 text-[10px] font-black uppercase tracking-[0.2em] text-primary-light border-b border-primary/20 flex items-center justify-between">
                                     <span className="flex items-center gap-2"><Sparkles className="w-3 h-3" /> Augmented Brief</span>
                                     <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                  </div>
                                  <div className="p-6 text-sm text-gray-200 whitespace-pre-wrap font-mono overflow-y-auto leading-relaxed">{improvedBrief.improved_description}</div>
                               </div>
                            </div>
                            <div className="flex gap-4 p-4 border border-white/5 justify-end bg-white/5 rounded-2xl">
                               <button onClick={rejectImprovedBrief} className="px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 text-[10px] font-black uppercase tracking-widest text-muted-foreground transition-all">Discard Changes</button>
                               <button onClick={acceptImprovedBrief} className="px-8 py-3 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(255,111,97,0.4)] hover:shadow-[0_0_30px_rgba(255,111,97,0.6)] transition-all"><CheckCircle2 className="w-4 h-4" /> Merge AI Brief</button>
                            </div>
                         </div>
                      ) : (
                         <div className="space-y-3 relative group">
                            {claudeThinking && (
                               <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-md rounded-2xl flex items-center justify-center border border-primary/30">
                                  <div className="flex flex-col items-center gap-4">
                                     <div className="relative">
                                        <BrainCircuit className="w-12 h-12 text-primary animate-pulse" />
                                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-ping" />
                                     </div>
                                     <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary animate-pulse">Analyzing Architectural Logic...</span>
                                  </div>
                               </div>
                            )}
                            <div className="absolute top-4 right-4 z-20">
                               <button 
                                  onClick={handleAIImprove}
                                  disabled={!formData.description || claudeThinking}
                                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 border border-primary/50 text-primary-light text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all disabled:opacity-30"
                                >
                                  <Wand2 className="w-3 h-3" /> Auditing Brief
                                </button>
                            </div>
                            <textarea 
                               className="w-full h-80 bg-surface border-2 border-white/5 rounded-2xl p-8 text-gray-300 font-mono leading-relaxed outline-none focus:border-primary/50 transition-all placeholder:opacity-30" 
                               placeholder="Input the mission parameters..." 
                               value={formData.description} 
                               onChange={e => updateForm('description', e.target.value)} 
                            />
                         </div>
                      )}

                     <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-6 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5">
                        <div className="md:col-span-1">
                           <label className="block text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-white mb-2 flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-500" /> Prize Type</label>
                           <select className="w-full bg-surface border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none font-mono" value={formData.prize_type} onChange={e => updateForm('prize_type', e.target.value)}>
                              <option value="Cash">Cash</option>
                              <option value="Gift Card">Gift Card</option>
                              <option value="Product">Product</option>
                              <option value="Job Offer">Job Offer</option>
                           </select>
                        </div>
                        <div>
                           <label className="block text-xs font-bold uppercase tracking-widest text-zinc-900 dark:text-white mb-2">Short Description</label>
                           <input type="text" className="w-full bg-surface border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none" value={formData.prize_description} onChange={e => updateForm('prize_description', e.target.value)} />
                        </div>
                        <div>
                           <label className="block text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">Value Amount ($)</label>
                           <input type="number" className="w-full bg-surface border border-emerald-500/30 rounded-xl px-4 py-3 text-emerald-400 font-bold outline-none" value={formData.prize_value} onChange={e => updateForm('prize_value', parseInt(e.target.value))} />
                        </div>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                           <label className="block text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white mb-3 flex items-center gap-2"><Calendar className="w-4 h-4 text-rose-500" /> Drop Time</label>
                           <input type="datetime-local" className="w-full bg-surface border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-muted-foreground outline-none font-mono" value={formData.drop_time} onChange={e => updateForm('drop_time', e.target.value)} />
                        </div>
                        <div>
                           <label className="block text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white mb-3 flex items-center gap-2"><Target className="w-4 h-4 text-purple-500" /> Expiration</label>
                           <input type="datetime-local" className="w-full bg-surface border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-muted-foreground outline-none font-mono" value={formData.expires_at} onChange={e => updateForm('expires_at', e.target.value)} />
                        </div>
                     </div>
                   </motion.div>
                )}

                {/* STEP 3: DEPLOYMENT & PRICING */}
                {step === 3 && (
                   <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                     
                     <div className="p-6 rounded-2xl bg-white/40 dark:bg-black/40 border border-black/5 dark:border-white/5 mb-8">
                        <div className="flex items-center gap-2 mb-4">
                           <BrainCircuit className="w-5 h-5 text-amber-500 opacity-50" />
                           <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white opacity-50">Claude Fairness Validation</h3>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-muted-foreground rounded-xl font-mono text-sm opacity-70">
                           <BrainCircuit className="w-5 h-5" /> AI Audits are temporarily disabled. Features coming soon.
                        </div>
                     </div>

                      {/* Sponsor Checking */}
                      {formData.is_sponsored ? (
                         <>
                            <div className="text-center space-y-4 mb-12">
                               <h2 className="text-4xl font-black uppercase tracking-tighter text-white flex justify-center items-center gap-3">
                                  Boost the Drop <Crown className="w-8 h-8 text-amber-400" />
                               </h2>
                               <p className="text-muted-foreground font-mono text-sm max-w-lg mx-auto">Elevate your mission with sponsored perks. Select a tier to initialize deployment via Lemon Squeezy.</p>
                            </div>
 
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                               {/* Standard */}
                               <div onClick={() => updateForm('tier', 'standard')} className={`group relative p-8 rounded-3xl border-2 cursor-pointer transition-all duration-300 ${formData.tier === 'standard' ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)]' : 'bg-surface border-white/5 hover:border-white/20'}`}>
                                  {formData.tier === 'standard' && <motion.div layoutId="activeTier" className="absolute inset-0 rounded-3xl border-2 border-amber-500 shadow-[inset_0_0_20px_rgba(245,158,11,0.2)]" />}
                                  <h4 className="relative z-10 text-sm font-black uppercase tracking-[0.2em] text-white mb-2">Standard</h4>
                                  <div className="relative z-10 text-4xl font-black font-mono text-amber-500 mb-6">$9.99</div>
                                  <ul className="relative z-10 text-xs font-mono text-muted-foreground space-y-3">
                                     <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-amber-500" /> Golden Outline</li>
                                     <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-amber-500" /> Brand Logo Render</li>
                                  </ul>
                               </div>
                               
                               {/* Premium */}
                               <div onClick={() => updateForm('tier', 'premium')} className={`group relative p-8 rounded-3xl border-2 cursor-pointer transition-all duration-500 scale-105 z-10 ${formData.tier === 'premium' ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_50px_rgba(245,158,11,0.3)]' : 'bg-gradient-to-b from-amber-500/5 to-transparent border-amber-500/20 hover:border-amber-400'}`}>
                                  <div className="absolute -top-4 inset-x-0 flex justify-center"><span className="bg-amber-500 text-black text-[9px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.5)]">Elite Pick</span></div>
                                  {formData.tier === 'premium' && <motion.div layoutId="activeTier" className="absolute inset-0 rounded-3xl border-2 border-amber-400 shadow-[inset_0_0_30px_rgba(245,158,11,0.3)]" />}
                                  <h4 className="relative z-10 text-sm font-black uppercase tracking-[0.2em] text-amber-400 mb-2">Premium</h4>
                                  <div className="relative z-10 text-4xl font-black font-mono text-white mb-6">$19.99</div>
                                  <ul className="relative z-10 text-xs font-mono text-gray-300 space-y-3">
                                     <li className="flex items-center gap-2"><Sparkles className="w-3 h-3 text-amber-400" /> Homepage Pin</li>
                                     <li className="flex items-center gap-2"><Sparkles className="w-3 h-3 text-amber-400" /> Analytics Suite</li>
                                     <li className="flex items-center gap-2"><Sparkles className="w-3 h-3 text-amber-400" /> Push Notification</li>
                                  </ul>
                               </div>
 
                               {/* Enterprise */}
                               <div onClick={() => updateForm('tier', 'enterprise')} className={`group relative p-8 rounded-3xl border-2 cursor-pointer transition-all duration-300 ${formData.tier === 'enterprise' ? 'bg-white/10 border-white shadow-[0_0_40px_rgba(255,255,255,0.2)]' : 'bg-surface border-white/5 hover:border-white/20'}`}>
                                  {formData.tier === 'enterprise' && <motion.div layoutId="activeTier" className="absolute inset-0 rounded-3xl border-2 border-white shadow-[inset_0_0_20px_rgba(255,255,255,0.1)]" />}
                                  <h4 className="relative z-10 text-sm font-black uppercase tracking-[0.2em] text-white mb-2">Enterprise</h4>
                                  <div className="relative z-10 text-4xl font-black font-mono text-white mb-6">$99</div>
                                  <ul className="relative z-10 text-xs font-mono text-muted-foreground space-y-3">
                                     <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-white" /> Multiple Drops</li>
                                     <li className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-white" /> Press Release API</li>
                                  </ul>
                               </div>
                            </div>
                         </>
                      ) : (
                         <div className="text-center space-y-6 py-24 bg-white/5 border border-white/5 rounded-3xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                            <Megaphone className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                            <h2 className="relative z-10 text-4xl font-black uppercase tracking-tighter text-white">
                               Standard Drop
                            </h2>
                            <p className="relative z-10 text-muted-foreground font-mono text-sm max-w-sm mx-auto">You've chosen a standard, un-sponsored Arena drop. Initiation is free of charge.</p>
                         </div>
                      )}
                    </motion.div>
                 )}

             </AnimatePresence>
          </div>

          <div className="flex justify-between items-center mt-12">
             <button onClick={handleBack} disabled={step === 1 || isSubmitting} className="px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] border border-white/10 hover:bg-white/5 text-muted-foreground hover:text-white transition-all disabled:opacity-30 flex items-center gap-3">
                <ArrowLeft className="w-4 h-4" /> Abort Phase
             </button>

             {step < 3 ? (
                <button onClick={handleNext} className="px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] bg-white text-black hover:bg-primary hover:text-white transition-all shadow-[0_10px_30px_rgba(255,255,255,0.1)] flex items-center gap-3">
                  Advance Phase <ArrowRight className="w-4 h-4" />
                </button>
             ) : (
                <button 
                  onClick={handleCheckout} 
                  disabled={isSubmitting} 
                  className={`relative px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.4em] transition-all gap-4 flex items-center disabled:opacity-50 group overflow-hidden ${
                     formData.is_sponsored 
                       ? 'bg-amber-500 text-black shadow-[0_0_40px_rgba(245,158,11,0.4)] hover:shadow-[0_0_60px_rgba(245,158,11,0.6)]' 
                       : 'bg-primary text-white shadow-[0_0_30px_rgba(255,111,97,0.4)] hover:shadow-[0_0_50px_rgba(255,111,97,0.6)]'
                  }`}
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                  <span className="relative z-10">{isSubmitting ? "Initiating..." : formData.is_sponsored ? `Lemon Squeezy Checkout` : `Deploy Drop`}</span>
                </button>
             )}
          </div>

       </div>
    </div>
  );
}
