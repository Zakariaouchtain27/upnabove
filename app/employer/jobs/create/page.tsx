"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft, ArrowRight, Briefcase, MapPin, DollarSign, Loader2, CheckCircle2,
  Globe, Navigation, Clock, Sparkles, FileText, Eye,
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";
import Button from "@/components/ui/Button";
import JobTemplates from "@/components/employer/JobTemplates";
import { Country, City } from 'country-state-city';
import cc from 'currency-codes';

const ALL_COUNTRIES = Country.getAllCountries().filter(c => c.name !== "Western Sahara");
const ALL_CURRENCIES = cc.codes()
  .filter(code => { const info = cc.code(code); return !code.startsWith('X') && info?.countries?.length; })
  .sort();

const STEPS = ['Role Details', 'Brief & Benefits', 'Preview & Post'];

const inputCls = "w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none text-foreground transition-all";
const labelCls = "text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 mb-2";

export default function CreateJobPage() {
  const router = useRouter();
  const supabase = createClient();
  const { addToast } = useToast();

  const [step, setStep] = useState(0); // 0 = templates, 1 = role details, 2 = brief, 3 = preview
  const [isLoading, setIsLoading] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [cities, setCities] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    title: "",
    job_type: "full-time",
    countryCode: "US",
    countryName: "United States",
    city: "",
    work_mode: "on-site",
    salary_amount: "",
    salary_currency: "USD",
    salary_period: "yearly",
    description: "",
    requirements: "",
    benefits: "",
  });

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push("/login");
    }
    checkAuth();
  }, [supabase, router]);

  useEffect(() => {
    const countryCities = City.getCitiesOfCountry(formData.countryCode) || [];
    setCities(countryCities);
    setFormData(prev => ({ ...prev, city: countryCities[0]?.name || "" }));
  }, [formData.countryCode]);

  const set = (k: keyof typeof formData, v: string) => setFormData(prev => ({ ...prev, [k]: v }));

  const handleTemplateSelect = (template: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...template }));
    setStep(1);
  };

  const handleImproveDescription = async () => {
    if (!formData.description.trim()) {
      addToast("Add a description first before improving it.", "warning");
      return;
    }
    setIsImproving(true);
    try {
      const res = await fetch('/api/jobs/improve-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: formData.title, description: formData.description, requirements: formData.requirements }),
      });
      const data = await res.json();
      if (res.ok && data.description) {
        set('description', data.description);
        addToast("Description improved!", "success");
      } else {
        addToast(data.error || "AI improvement unavailable.", "error");
      }
    } catch {
      addToast("AI improvement failed.", "error");
    } finally {
      setIsImproving(false);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    const reqs = formData.requirements.split('\n').filter(r => r.trim());
    const bens = formData.benefits.split('\n').filter(b => b.trim());
    const locationString = `${formData.city || "Remote"}, ${formData.countryName} (${formData.work_mode})`;
    const salaryString = `${formData.salary_currency} ${formData.salary_amount}/${formData.salary_period === 'yearly' ? 'yr' : formData.salary_period === 'monthly' ? 'mo' : 'hr'}`;
    try {
      const res = await fetch('/api/jobs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title, job_type: formData.job_type, location: locationString,
          salary_range: salaryString, description: formData.description,
          requirements: reqs, benefits: bens, is_active: true,
          country: formData.countryName, city: formData.city, work_mode: formData.work_mode,
          salary_amount: parseFloat(formData.salary_amount) || 0,
          salary_currency: formData.salary_currency, salary_period: formData.salary_period,
        }),
      });
      const data = await res.json();
      if (!res.ok) { addToast("Error: " + (data.error || "Unknown error"), "error"); }
      else { addToast("Job launched successfully!", "success"); router.push("/employer/jobs"); }
    } catch { addToast("An unexpected error occurred.", "error"); }
    finally { setIsLoading(false); }
  };

  // ── TEMPLATE PICKER ──────────────────────────────────────────────────────────
  if (step === 0) {
    return (
      <div className="min-h-screen bg-background pt-12 pb-32 px-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/employer/jobs" className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-primary transition-all mb-8 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
          </Link>
          <div className="mb-10">
            <h1 className="text-4xl font-black text-foreground uppercase tracking-tight mb-2">Launch New Job</h1>
            <p className="text-muted">Start from a template or build from scratch.</p>
          </div>
          <JobTemplates onSelect={handleTemplateSelect} onSkip={() => setStep(1)} />
        </div>
      </div>
    );
  }

  // ── STEP INDICATOR ───────────────────────────────────────────────────────────
  const currentStep = step - 1; // steps 1,2,3 map to STEPS[0,1,2]

  return (
    <div className="min-h-screen bg-background pt-12 pb-32 px-6">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => setStep(s => Math.max(0, s - 1))} className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-primary transition-all mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {step === 1 ? 'Change Template' : 'Back'}
        </button>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((label, i) => (
            <React.Fragment key={label}>
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${i < currentStep ? 'bg-emerald-500 text-white' : i === currentStep ? 'bg-primary text-white' : 'bg-border text-muted'}`}>
                  {i < currentStep ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-xs font-black uppercase tracking-widest hidden sm:block ${i === currentStep ? 'text-foreground' : 'text-muted'}`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-px ${i < currentStep ? 'bg-emerald-500' : 'bg-border'}`} />}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-surface border border-border p-8 rounded-3xl shadow-sm space-y-8">

          {/* ── STEP 1: Role Details ─────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">Role Details</h2>

              <div className="space-y-2">
                <label className={labelCls}><Navigation className="w-3.5 h-3.5" /> Job Title</label>
                <input type="text" required className={inputCls} placeholder="e.g. Senior Frontend Engineer" value={formData.title} onChange={e => set('title', e.target.value)} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={labelCls}><Briefcase className="w-3.5 h-3.5" /> Engagement Type</label>
                  <select className={inputCls} value={formData.job_type} onChange={e => set('job_type', e.target.value)}>
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="freelance">Freelance</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className={labelCls}><Clock className="w-3.5 h-3.5" /> Work Mode</label>
                  <select className={inputCls} value={formData.work_mode} onChange={e => set('work_mode', e.target.value)}>
                    <option value="on-site">On-site</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className={labelCls}><Globe className="w-3.5 h-3.5" /> Country</label>
                  <select className={inputCls} value={formData.countryCode} onChange={e => {
                    const c = ALL_COUNTRIES.find(c => c.isoCode === e.target.value);
                    setFormData(prev => ({ ...prev, countryCode: e.target.value, countryName: c?.name || "" }));
                  }}>
                    {ALL_COUNTRIES.map(c => <option key={c.isoCode} value={c.isoCode}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className={labelCls}><MapPin className="w-3.5 h-3.5" /> City</label>
                  <select className={inputCls} value={formData.city} onChange={e => set('city', e.target.value)}>
                    {cities.length > 0 ? cities.map(city => <option key={city.name + city.latitude} value={city.name}>{city.name}</option>)
                      : <option value="">Remote / Not listed</option>}
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <label className={labelCls}><DollarSign className="w-3.5 h-3.5" /> Compensation</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select className={`${inputCls} sm:w-52`} value={formData.salary_currency} onChange={e => set('salary_currency', e.target.value)}>
                    {ALL_CURRENCIES.map(code => {
                      const info = cc.code(code);
                      const countries = Array.isArray(info?.countries) ? info.countries : [];
                      return <option key={code} value={code}>{code} — {countries.filter(c => c !== "Western Sahara").slice(0, 2).join(', ')}</option>;
                    })}
                  </select>
                  <input type="number" className={`${inputCls} flex-1`} placeholder="120000" value={formData.salary_amount} onChange={e => set('salary_amount', e.target.value)} />
                  <select className={`${inputCls} sm:w-36`} value={formData.salary_period} onChange={e => set('salary_period', e.target.value)}>
                    <option value="yearly">Per Year</option>
                    <option value="monthly">Per Month</option>
                    <option value="hourly">Per Hour</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Brief & Benefits ─────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">Brief & Benefits</h2>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className={labelCls}><FileText className="w-3.5 h-3.5" /> Role Description</label>
                  <button type="button" onClick={handleImproveDescription} disabled={isImproving} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors disabled:opacity-50">
                    {isImproving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                    {isImproving ? 'Improving…' : 'Improve with AI'}
                  </button>
                </div>
                <textarea required rows={7} className={inputCls} placeholder="Describe responsibilities, day-to-day work, and impact…" value={formData.description} onChange={e => set('description', e.target.value)} />
              </div>

              <div className="space-y-2">
                <label className={labelCls}>Required Skills <span className="text-zinc-500 normal-case font-normal tracking-normal">(one per line)</span></label>
                <textarea rows={4} className={`${inputCls} font-mono text-sm`} placeholder={"5+ years React experience\nStrong TypeScript skills"} value={formData.requirements} onChange={e => set('requirements', e.target.value)} />
              </div>

              <div className="space-y-2">
                <label className={labelCls}>Perks & Benefits <span className="text-zinc-500 normal-case font-normal tracking-normal">(one per line)</span></label>
                <textarea rows={3} className={inputCls} placeholder={"Remote-first\nUnlimited PTO\nEquity package"} value={formData.benefits} onChange={e => set('benefits', e.target.value)} />
              </div>
            </div>
          )}

          {/* ── STEP 3: Preview ──────────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black uppercase tracking-tight text-foreground flex items-center gap-2"><Eye className="w-6 h-6 text-primary" /> Preview</h2>
              <div className="p-6 rounded-2xl border border-border bg-background space-y-4">
                <div>
                  <h3 className="text-2xl font-black text-foreground">{formData.title || '—'}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {[formData.job_type, formData.work_mode, `${formData.city || 'Remote'}, ${formData.countryName}`].map(tag => (
                      <span key={tag} className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2.5 py-1 rounded-full">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="h-px bg-border" />
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-muted mb-1">Salary</p>
                  <p className="font-mono text-foreground">{formData.salary_currency} {formData.salary_amount || '—'} / {formData.salary_period}</p>
                </div>
                {formData.description && (
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-muted mb-1">Description</p>
                    <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-6">{formData.description}</p>
                  </div>
                )}
                {formData.requirements && (
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-muted mb-2">Requirements</p>
                    <ul className="space-y-1">
                      {formData.requirements.split('\n').filter(r => r.trim()).map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground"><span className="text-primary mt-0.5">✓</span>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <button type="button" onClick={() => setStep(s => s - 1)} className="text-sm font-bold text-muted hover:text-foreground transition-colors">
              ← Back
            </button>
            {step < 3 ? (
              <Button type="button" onClick={() => {
                if (step === 1 && !formData.title.trim()) { addToast("Job title is required.", "warning"); return; }
                if (step === 2 && !formData.description.trim()) { addToast("Description is required.", "warning"); return; }
                setStep(s => s + 1);
              }} className="gap-2 px-8">
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button type="button" onClick={handleSubmit} disabled={isLoading} className="gap-2 px-12 py-4 text-sm uppercase tracking-widest font-black">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {isLoading ? "Publishing…" : "Deploy Job"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
