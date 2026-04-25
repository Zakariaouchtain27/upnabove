"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, FileText, CheckCircle2, Loader2, Info } from "lucide-react";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

interface JobApplyModalProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
}

export default function JobApplyModal({ jobId, jobTitle, companyName }: JobApplyModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Form State
  const [motivationType, setMotivationType] = useState<'text' | 'file'>('text');
  const [motivationText, setMotivationText] = useState("");
  const [motivationFile, setMotivationFile] = useState<File | null>(null);
  const motivationFileRef = useRef<HTMLInputElement>(null);
  
  // Candidate State
  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  // New CV Upload State (in case they don't have one)
  const [newCvFile, setNewCvFile] = useState<File | null>(null);
  const cvFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && !candidateId) {
       checkAuthAndCandidate();
    }
  }, [isOpen]);

  async function checkAuthAndCandidate() {
     setLoading(true);
     setError(null);
     const { data: { user } } = await supabase.auth.getUser();
     if (!user) {
        setError("You must be logged in to apply for jobs.");
        setLoading(false);
        return;
     }
     setUserId(user.id);
     
     const { data: candidate, error: candErr } = await supabase
        .from('candidates')
        .select('id, resume_url')
        .eq('id', user.id)
        .single();
        
     if (candErr || !candidate) {
        setError("You need to complete your Candidate profile before applying.");
        setLoading(false);
        return;
     }
     
     setCandidateId(candidate.id);
     setResumeUrl(candidate.resume_url);
     setLoading(false);
  }

  async function handleSubmit() {
     if (!candidateId || !userId) return;
     setSubmitting(true);
     setError(null);
     
     try {
        let finalResumeUrl = resumeUrl;
        let finalMotUrl = null;
        
        // 1. Upload new CV if provided
        if (newCvFile) {
           if (newCvFile.type !== 'application/pdf' || newCvFile.size > 10 * 1024 * 1024) {
              throw new Error("CV must be a PDF under 10MB.");
           }
           const fileName = `${Date.now()}_${newCvFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
           const { error: uploadErr } = await supabase.storage.from('cvs').upload(`${userId}/${fileName}`, newCvFile);
           if (uploadErr) throw uploadErr;
           
           const { data: urlData } = supabase.storage.from('cvs').getPublicUrl(`${userId}/${fileName}`);
           finalResumeUrl = urlData.publicUrl;
           
           // Update default CV for candidate
           await supabase.from('candidates').update({ resume_url: finalResumeUrl }).eq('id', candidateId);
        }
        
        if (!finalResumeUrl) {
           throw new Error("A CV is required to apply. Please upload one.");
        }
        
        // 2. Upload motivation letter file if provided
        if (motivationType === 'file' && motivationFile) {
           if (motivationFile.type !== 'application/pdf' || motivationFile.size > 10 * 1024 * 1024) {
              throw new Error("Motivation letter must be a PDF under 10MB.");
           }
           const fileName = `${Date.now()}_${motivationFile.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
           const { error: uploadErr } = await supabase.storage.from('motivation-letters').upload(`${userId}/${fileName}`, motivationFile);
           if (uploadErr) throw uploadErr;
           
           const { data: urlData } = supabase.storage.from('motivation-letters').getPublicUrl(`${userId}/${fileName}`);
           finalMotUrl = urlData.publicUrl;
        }

        // 3. Insert Application
        const { error: appErr } = await supabase.from('applications').insert({
           job_id: jobId,
           candidate_id: candidateId,
           resume_url: finalResumeUrl,
           motivation_text: motivationType === 'text' ? motivationText : null,
           motivation_letter_url: finalMotUrl
        });

        if (appErr) {
           if (appErr.code === '23505') {
              throw new Error("You have already applied for this job.");
           }
           throw appErr;
        }

        setSuccess(true);
     } catch (err: any) {
        setError(err.message || "Failed to submit application.");
     } finally {
        setSubmitting(false);
     }
  }

  if (!isOpen) {
     return (
        <Button size="lg" className="flex-1 sm:flex-none w-full sm:w-auto" onClick={() => setIsOpen(true)}>
           Apply Now
        </Button>
     );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
       <div className="w-full max-w-2xl bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface/50 sticky top-0">
             <div>
                <h3 className="text-xl font-bold text-foreground">Submit Application</h3>
                <p className="text-sm text-muted">Applying to <span className="font-semibold text-primary">{jobTitle}</span> at {companyName}</p>
             </div>
             <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-surface-hover text-muted hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
             </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
             {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                   <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                   <p className="text-sm text-muted">Verifying candidate profile...</p>
                </div>
             ) : success ? (
                <div className="flex flex-col items-center justify-center py-12 text-center animate-in zoom-in-95 duration-300">
                   <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                   </div>
                   <h2 className="text-2xl font-bold text-foreground mb-2">Application Submitted!</h2>
                   <p className="text-muted mb-8 max-w-sm">Your application for {jobTitle} has been successfully sent to {companyName}. Good luck!</p>
                   <Button onClick={() => setIsOpen(false)}>Close Window</Button>
                </div>
             ) : (
                <div className="space-y-8">
                   
                   {error && (
                      <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-500 flex items-start gap-3">
                         <Info className="w-5 h-5 shrink-0 mt-0.5" />
                         <p>{error}</p>
                      </div>
                   )}

                   {/* CV Section */}
                   <div className="space-y-4">
                      <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                         <FileText className="w-4 h-4 text-primary" /> 1. Resume / CV
                      </h4>
                      
                      {resumeUrl && !newCvFile ? (
                         <div className="p-4 rounded-xl border border-border bg-background flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                  <CheckCircle2 className="w-5 h-5 text-primary" />
                               </div>
                               <div>
                                  <p className="text-sm font-semibold text-foreground">Using Default CV</p>
                                  <a href={resumeUrl} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">View File</a>
                               </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => cvFileRef.current?.click()}>
                               Upload Different CV
                            </Button>
                         </div>
                      ) : (
                         <div 
                            onClick={() => cvFileRef.current?.click()}
                            className="p-6 rounded-xl border-2 border-dashed border-border bg-background hover:border-primary/50 text-center cursor-pointer transition-colors"
                         >
                            <Upload className="w-6 h-6 text-muted mx-auto mb-2" />
                            <p className="text-sm font-medium text-foreground">
                               {newCvFile ? newCvFile.name : "Upload a new CV (PDF)"}
                            </p>
                            <p className="text-xs text-muted mt-1">{newCvFile ? "Click to change" : "Max 10MB"}</p>
                         </div>
                      )}
                      <input 
                         type="file" 
                         accept=".pdf" 
                         className="hidden" 
                         ref={cvFileRef} 
                         onChange={(e) => {
                            if (e.target.files?.[0]) setNewCvFile(e.target.files[0]);
                         }} 
                      />
                   </div>

                   {/* Motivation Letter Section */}
                   <div className="space-y-4">
                      <div className="flex items-center justify-between">
                         <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <FileText className="w-4 h-4 text-primary" /> 2. Motivation Letter <span className="text-muted font-normal text-xs">(Optional)</span>
                         </h4>
                         <div className="flex bg-surface-hover rounded-lg p-1">
                            <button 
                               onClick={() => setMotivationType('text')}
                               className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${motivationType === 'text' ? 'bg-background text-foreground shadow' : 'text-muted hover:text-foreground'}`}
                            >
                               Write Text
                            </button>
                            <button 
                               onClick={() => setMotivationType('file')}
                               className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${motivationType === 'file' ? 'bg-background text-foreground shadow' : 'text-muted hover:text-foreground'}`}
                            >
                               Upload PDF
                            </button>
                         </div>
                      </div>

                      {motivationType === 'text' ? (
                         <textarea 
                            value={motivationText}
                            onChange={(e) => setMotivationText(e.target.value)}
                            placeholder="Introduce yourself and explain why you're a great fit for this role..."
                            className="w-full h-40 p-4 rounded-xl border border-border bg-background text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all resize-none placeholder:text-muted/50"
                         />
                      ) : (
                         <div 
                            onClick={() => motivationFileRef.current?.click()}
                            className="p-6 rounded-xl border-2 border-dashed border-border bg-background hover:border-primary/50 text-center cursor-pointer transition-colors"
                         >
                            <Upload className="w-6 h-6 text-muted mx-auto mb-2" />
                            <p className="text-sm font-medium text-foreground">
                               {motivationFile ? motivationFile.name : "Upload Motivation Letter (PDF)"}
                            </p>
                            <p className="text-xs text-muted mt-1">{motivationFile ? "Click to change" : "Max 10MB"}</p>
                         </div>
                      )}
                      <input 
                         type="file" 
                         accept=".pdf" 
                         className="hidden" 
                         ref={motivationFileRef} 
                         onChange={(e) => {
                            if (e.target.files?.[0]) setMotivationFile(e.target.files[0]);
                         }} 
                      />
                   </div>

                </div>
             )}
          </div>

          {/* Footer */}
          {!loading && !success && (
             <div className="p-4 border-t border-border bg-surface flex justify-end gap-3 shrink-0">
                <Button variant="outline" onClick={() => setIsOpen(false)} disabled={submitting}>Cancel</Button>
                <Button 
                   onClick={handleSubmit} 
                   disabled={submitting || (!resumeUrl && !newCvFile)} 
                   className="min-w-[140px]"
                >
                   {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Submit Application"}
                </Button>
             </div>
          )}

       </div>
    </div>
  );
}
