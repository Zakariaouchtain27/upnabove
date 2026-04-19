"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Briefcase, MapPin, DollarSign, UploadCloud, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";

export default function CreateJobPage() {
  const router = useRouter();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [employerId, setEmployerId] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    job_type: "full-time",
    location: "",
    salary_range: "",
    description: "",
    requirements: "",
    benefits: ""
  });

  useEffect(() => {
    async function loadEmployer() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmployerId(user.id);
        const { data: emp } = await supabase.from('employers').select('company_logo_url').eq('id', user.id).single();
        if (emp?.company_logo_url) {
          setLogoUrl(emp.company_logo_url);
        }
      } else {
        router.push("/login");
      }
    }
    loadEmployer();
  }, [router, supabase]);

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !employerId) return;

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${employerId}-${Date.now()}.${fileExt}`;

    const { error, data } = await supabase.storage
      .from('logos')
      .upload(fileName, file, { upsert: true });

    if (error) {
      alert("Failed to upload logo: " + error.message);
    } else {
      const { data: urlData } = supabase.storage.from('logos').getPublicUrl(fileName);
      setLogoUrl(urlData.publicUrl);

      // Update employer profile implicitly
      await supabase.from('employers').update({ company_logo_url: urlData.publicUrl }).eq('id', employerId);
    }
    setIsUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employerId) return;

    setIsLoading(true);

    const reqs = formData.requirements.split('\\n').filter(r => r.trim() !== '');
    const bens = formData.benefits.split('\\n').filter(b => b.trim() !== '');

    const payload = {
      employer_id: employerId,
      title: formData.title,
      job_type: formData.job_type,
      location: formData.location,
      salary_range: formData.salary_range || null,
      description: formData.description,
      requirements: reqs,
      benefits: bens,
      is_active: true
    };

    const { error } = await supabase.from('jobs').insert([payload]);

    if(error){
       alert("Error posting job: " + error.message);
       setIsLoading(false);
    } else {
       alert("Job posted successfully!");
       router.push("/jobs");
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4">
        <Link href="/employer" className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-black text-foreground uppercase tracking-tight">Post a New Job</h1>
          <p className="text-muted mt-2">Publish an open role to the global network.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-surface border border-border p-8 rounded-3xl shadow-sm">
          
          {/* Company Logo Widget */}
          <div className="flex items-center gap-6 pb-6 border-b border-border">
             <div 
               className="w-20 h-20 rounded-2xl border-2 border-dashed border-border bg-background flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors overflow-hidden"
               onClick={() => fileInputRef.current?.click()}
             >
               <input type="file" className="hidden" accept="image/*" ref={fileInputRef} onChange={handleUploadLogo} />
               {isUploading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
               ) : logoUrl ? (
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
               ) : (
                  <>
                     <UploadCloud className="w-6 h-6 text-muted mb-1" />
                     <span className="text-[10px] text-muted font-bold uppercase">Upload</span>
                  </>
               )}
             </div>
             <div>
                <h3 className="text-foreground font-bold text-lg leading-tight">Company Logo</h3>
                <p className="text-muted text-sm">Upload your brand mark. This carries over to all your jobs.</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="text-sm font-bold uppercase tracking-widest text-foreground">Job Title</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-foreground"
                placeholder="e.g. Senior Frontend Engineer"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-widest text-foreground flex items-center gap-2"><Briefcase className="w-4 h-4"/> Job Type</label>
              <select 
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none text-foreground appearance-none"
                value={formData.job_type}
                onChange={e => setFormData({ ...formData, job_type: e.target.value })}
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-widest text-foreground flex items-center gap-2"><MapPin className="w-4 h-4"/> Location</label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none text-foreground"
                placeholder="e.g. Remote, Global"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="text-sm font-bold uppercase tracking-widest text-foreground flex items-center gap-2"><DollarSign className="w-4 h-4"/> Salary Range</label>
              <input 
                type="text" 
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none text-foreground"
                placeholder="e.g. $120k - $150k (Optional)"
                value={formData.salary_range}
                onChange={e => setFormData({ ...formData, salary_range: e.target.value })}
              />
            </div>

            <div className="space-y-2 col-span-1 md:col-span-2 border-t border-border pt-6">
              <label className="text-sm font-bold uppercase tracking-widest text-foreground">Role Description</label>
              <textarea 
                required
                rows={5}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none text-foreground resize-none"
                placeholder="Describe the day-to-day responsibilities and impact..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="text-sm font-bold uppercase tracking-widest text-foreground">Requirements (One per line)</label>
              <textarea 
                rows={5}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none text-foreground resize-none"
                placeholder="5+ years of React experience&#10;Strong understanding of UI/UX"
                value={formData.requirements}
                onChange={e => setFormData({ ...formData, requirements: e.target.value })}
              />
            </div>

            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="text-sm font-bold uppercase tracking-widest text-foreground">Benefits (One per line)</label>
              <textarea 
                rows={3}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none text-foreground resize-none"
                placeholder="Unlimited PTO&#10;Full Health Coverage"
                value={formData.benefits}
                onChange={e => setFormData({ ...formData, benefits: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-border flex justify-end">
             <Button type="submit" disabled={isLoading} className="gap-2">
               {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
               {isLoading ? "Publishing..." : "Launch Job Post"}
             </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
