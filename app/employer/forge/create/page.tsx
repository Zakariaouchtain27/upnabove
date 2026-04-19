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
  Megaphone, Crown, UploadCloud
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

  const defaultDrop = new Date();
  defaultDrop.setDate(defaultDrop.getDate() + 1);
  const defaultExpire = new Date(defaultDrop);
  defaultExpire.setDate(defaultExpire.getDate() + 3);

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
    drop_time: defaultDrop.toISOString().slice(0, 16),
    expires_at: defaultExpire.toISOString().slice(0, 16),
    
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
    setIsSubmitting(true);
    try {
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
           const supabase = createClient();
           const { data: { user } } = await supabase.auth.getUser();
           
           const insertData = {
              employer_id: user?.id || null, 
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
           if (error) throw new Error(error.message);

           addToast("Sponsorship Paid + Drop is scheduled via Lemon Squeezy!", "success");
           router.push(checkoutData.checkoutUrl);
           return;
       }

       // Otherwise standard 'Free' push to supabase
       const supabase = createClient();
       const { data: { user } } = await supabase.auth.getUser();
       const insertData = {
          employer_id: user?.id || null, 
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
       if (error) throw new Error(error.message);

       addToast("Free Standard Drop Created!", "success");
       router.push("/employer/forge");
    } catch (err: any) {
       addToast(`Checkout failed: ${err.message}`, "error");
    } finally {
       setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05050a] text-foreground font-sans pt-20 pb-32">
       <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
       
       <div className="max-w-5xl mx-auto px-6 relative z-10">
          
          <div className="mb-12">
             <Link href="/employer/forge" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-zinc-900 dark:text-white transition-colors mb-8 font-mono tracking-widest uppercase">
                <ArrowLeft className="w-4 h-4" /> Back to Overview
             </Link>
             <h1 className="text-4xl font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-6">Forge a Drop</h1>
             
             <div className="h-2 w-full bg-surface border border-black/5 dark:border-white/5 rounded-full overflow-hidden">
                <motion.div 
                   className="h-full bg-gradient-to-r from-primary-dark via-primary to-primary-light"
                   initial={{ width: "33%" }}
                   animate={{ width: `${(step / 3) * 100}%` }}
                   transition={{ ease: "circOut", duration: 0.5 }}
                />
             </div>
             <div className="flex justify-between mt-3 text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
                <span className={step >= 1 ? "text-primary-light drop-shadow-[0_0_8px_rgba(124,58,237,0.5)]" : ""}>1. Basics</span>
                <span className={step >= 2 ? "text-primary-light drop-shadow-[0_0_8px_rgba(124,58,237,0.5)]" : ""}>2. The Brief</span>
                <span className={step === 3 ? "text-primary-light drop-shadow-[0_0_8px_rgba(124,58,237,0.5)]" : ""}>3. Deploy</span>
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
                        <label className="block text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-white mb-3">Combat Type</label>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                           {['design', 'code', 'strategy', 'writing', 'data', 'video'].map((type) => (
                              <button 
                                 key={type}
                                 onClick={() => updateForm('challenge_type', type)}
                                 className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all ${
                                    formData.challenge_type === type 
                                      ? "bg-primary/20 border-primary shadow-[0_0_20px_rgba(124,58,237,0.2)] text-primary-light" 
                                      : "bg-surface border-black/5 dark:border-white/5 hover:bg-black/5 dark:bg-white/5 text-muted-foreground hover:text-zinc-900 dark:text-white"
                                 }`}
                              >
                                 {TypeIcons[type as ChallengeType]}
                                 <span className="mt-4 font-bold uppercase tracking-wider text-xs">{type}</span>
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
                           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              <div className="flex flex-col border border-black/10 dark:border-white/10 rounded-xl bg-white/40 dark:bg-black/40 h-80 overflow-y-auto">
                                 <div className="sticky top-0 bg-white/80 dark:bg-black/80 backdrop-blur-md py-2 px-4 text-xs font-mono uppercase font-bold text-muted-foreground border-b border-black/10 dark:border-white/10 z-10">Original Draft</div>
                                 <div className="p-4 text-sm text-muted-foreground line-through opacity-70 whitespace-pre-wrap font-mono">{originalDescription}</div>
                              </div>
                              <div className="flex flex-col border border-primary/50 rounded-xl bg-primary/5 h-80 overflow-y-auto w-full">
                                 <div className="sticky top-0 bg-primary-dark/80 backdrop-blur-md py-2 px-4 text-xs font-mono uppercase font-bold text-primary-light border-b border-primary/20 flex items-center gap-2 z-10">
                                    <Sparkles className="w-3.5 h-3.5" /> Improved Draft
                                 </div>
                                 <div className="p-4 text-sm text-zinc-800 dark:text-gray-200 whitespace-pre-wrap font-mono">{improvedBrief.improved_description}</div>
                              </div>
                           </div>
                           <div className="flex gap-4 p-4 border-t border-black/10 dark:border-white/10 justify-end bg-surface/50 rounded-xl">
                              <button onClick={rejectImprovedBrief} className="px-5 py-2.5 rounded-lg border border-black/10 dark:border-white/10 bg-surface hover:bg-black/5 dark:bg-white/5 text-xs font-bold uppercase tracking-wider text-muted-foreground">Keep Original</button>
                              <button onClick={acceptImprovedBrief} className="btn-glow px-6 py-2.5 rounded-lg bg-primary text-white text-xs font-bold uppercase flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Use Improved Version</button>
                           </div>
                        </div>
                     ) : (
                        <div className="space-y-3 relative">
                           {claudeThinking && (
                              <div className="absolute inset-0 z-10 bg-white/50 dark:bg-black/50 backdrop-blur-sm rounded-xl flex items-center justify-center pointer-events-none">
                                 <div className="flex flex-col items-center gap-3"><BrainCircuit className="w-8 h-8 text-primary animate-pulse" /></div>
                              </div>
                           )}
                           <textarea className="w-full h-64 bg-surface border border-black/10 dark:border-white/10 rounded-xl p-5 text-zinc-700 dark:text-gray-300 font-mono leading-relaxed outline-none" placeholder="Describe the objective..." value={formData.description} onChange={e => updateForm('description', e.target.value)} />
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
                           <div className="text-center space-y-2 mb-8">
                              <h2 className="text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white drop-shadow-md flex justify-center items-center gap-3">
                                 Sponsor Monetization <Crown className="w-6 h-6 text-amber-400" />
                              </h2>
                              <p className="text-muted-foreground font-mono">Select a tier to schedule your Drop via Lemon Squeezy.</p>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div onClick={() => updateForm('tier', 'standard')} className={`relative p-6 rounded-2xl border cursor-pointer transition-all ${formData.tier === 'standard' ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]' : 'bg-surface border-black/5 dark:border-white/5 hover:border-white/20'}`}>
                                 {formData.tier === 'standard' && <div className="absolute top-4 right-4"><CheckCircle2 className="w-5 h-5 text-amber-500" /></div>}
                                 <h4 className="text-lg font-bold uppercase tracking-widest text-zinc-900 dark:text-white mb-2">Standard Sponsored</h4>
                                 <div className="text-3xl font-bold font-mono text-zinc-700 dark:text-gray-300 mb-6">$9.99</div>
                                 <ul className="text-sm font-mono text-muted-foreground space-y-2"><li>• Golden Outline</li><li>• Brand Logo rendering</li><li>• Public Trophy Tag</li></ul>
                              </div>
                              <div onClick={() => updateForm('tier', 'premium')} className={`relative p-6 rounded-2xl border cursor-pointer transition-all scale-105 z-10 ${formData.tier === 'premium' ? 'bg-gradient-to-b from-amber-500/20 to-surface border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.4)]' : 'bg-gradient-to-b from-amber-500/5 to-surface border-amber-500/20 hover:border-amber-500/50'}`}>
                                 <div className="absolute -top-3 inset-x-0 flex justify-center"><span className="bg-amber-500 text-black text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">Most Popular</span></div>
                                 {formData.tier === 'premium' && <div className="absolute top-4 right-4"><CheckCircle2 className="w-5 h-5 text-amber-400" /></div>}
                                 <h4 className="text-lg font-bold uppercase tracking-widest text-amber-400 mb-2">Premium Sponsored</h4>
                                 <div className="text-3xl font-bold font-mono text-zinc-900 dark:text-white mb-6 drop-shadow-md">$19.99</div>
                                 <ul className="text-sm font-mono text-muted-foreground space-y-2"><li>• Homepage Pin</li><li>• Analytics Post-Drop</li><li>• Notification Push</li></ul>
                              </div>
                              <div onClick={() => updateForm('tier', 'enterprise')} className={`relative p-6 rounded-2xl border cursor-pointer transition-all ${formData.tier === 'enterprise' ? 'bg-black/10 dark:bg-white/10 border-white shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-surface border-black/5 dark:border-white/5 hover:border-white/20'}`}>
                                 {formData.tier === 'enterprise' && <div className="absolute top-4 right-4"><CheckCircle2 className="w-5 h-5 text-zinc-900 dark:text-white" /></div>}
                                 <h4 className="text-lg font-bold uppercase tracking-widest text-zinc-700 dark:text-gray-300 mb-2">Enterprise</h4>
                                 <div className="text-3xl font-bold font-mono text-zinc-900 dark:text-white mb-6">$99</div>
                                 <ul className="text-sm font-mono text-muted-foreground space-y-2"><li>• Multiple Auto-Drops</li><li>• Press Release API</li><li>• Private CRM DB Export</li></ul>
                              </div>
                           </div>
                        </>
                     ) : (
                        <div className="text-center space-y-4 py-16 bg-surface border border-black/5 dark:border-white/5 rounded-2xl">
                           <Megaphone className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                           <h2 className="text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white flex justify-center items-center gap-3">
                              Free Drop Initiation
                           </h2>
                           <p className="text-muted-foreground font-mono max-w-sm mx-auto">You've chosen a standard, un-sponsored Arena drop. There is zero checkout fee required to launch.</p>
                        </div>
                     )}
                   </motion.div>
                )}

             </AnimatePresence>
          </div>

          <div className="flex justify-between mt-8">
             <button onClick={handleBack} disabled={step === 1 || isSubmitting} className="px-6 py-3 rounded-xl font-bold font-mono text-xs uppercase tracking-widest border border-black/5 dark:border-white/5 hover:bg-black/5 dark:bg-white/5 text-muted-foreground hover:text-zinc-900 dark:text-white transition-colors disabled:opacity-30 flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Go Back
             </button>

             {step < 3 ? (
                <button onClick={handleNext} className="px-8 py-3 rounded-xl font-bold font-mono text-xs uppercase tracking-widest bg-white text-black hover:bg-gray-200 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.2)] flex items-center gap-2">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
             ) : (
                <button onClick={handleCheckout} disabled={isSubmitting} className={`btn-glow px-8 py-3 rounded-xl font-bold font-mono text-xs uppercase tracking-widest transition-all gap-2 flex items-center disabled:opacity-50 disabled:grayscale ${formData.is_sponsored ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-[0_0_25px_rgba(245,158,11,0.5)]' : 'bg-primary text-white shadow-[0_0_20px_rgba(124,58,237,0.5)]'}`}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                  {isSubmitting ? "Processing..." : formData.is_sponsored ? `Lemon Squeezy Checkout` : `Deploy Free Challenge`}
                </button>
             )}
          </div>

       </div>
    </div>
  );
}
