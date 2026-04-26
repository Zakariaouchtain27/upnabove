"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  ArrowLeft, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Loader2, 
  CheckCircle2,
  Globe,
  Navigation,
  Clock
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";
import Button from "@/components/ui/Button";

// Import country-state-city
import { Country, City } from 'country-state-city';
// Import currency-codes
import cc from 'currency-codes';

const ALL_COUNTRIES = Country.getAllCountries().filter(c => c.name !== "Western Sahara");
const ALL_CURRENCIES = cc.codes()
  .filter(code => {
    const info = cc.code(code);
    // Exclude commodity codes (usually start with X) and those with no countries
    return !code.startsWith('X') && info && info.countries && info.countries.length > 0;
  })
  .sort();

export default function CreateJobPage() {
  const router = useRouter();
  const supabase = createClient();
  const { addToast } = useToast();

  const [isLoading, setIsLoading] = useState(false);
  const [employerId, setEmployerId] = useState<string | null>(null);
  
  // State for dependent dropdowns
  const [countries] = useState(ALL_COUNTRIES);
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
    benefits: ""
  });

  useEffect(() => {
    async function checkEmployer() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push("/login");

      const { data: employer } = await supabase.from('employers').select('id').eq('id', user.id).single();
      if (!employer) {
        setEmployerId(user.id);
      } else {
        setEmployerId(employer.id);
      }
    }
    checkEmployer();
  }, [supabase, router]);

  // Update cities when country changes
  useEffect(() => {
    if (formData.countryCode) {
      const countryCities = City.getCitiesOfCountry(formData.countryCode) || [];
      setCities(countryCities);
      // Set default city if available, else empty
      setFormData(prev => ({ 
        ...prev, 
        city: countryCities.length > 0 ? countryCities[0].name : "" 
      }));
    }
  }, [formData.countryCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employerId) {
      addToast("Authentication error. Please refresh.", "error");
      return;
    }

    setIsLoading(true);

    const reqs = formData.requirements.split('\n').filter(r => r.trim() !== '');
    const bens = formData.benefits.split('\n').filter(b => b.trim() !== '');

    // Construct human-readable strings for legacy columns
    const locationString = `${formData.city || "Remote"}, ${formData.countryName} (${formData.work_mode})`;
    const salaryString = `${formData.salary_currency} ${formData.salary_amount}/${formData.salary_period === 'yearly' ? 'yr' : formData.salary_period === 'monthly' ? 'mo' : 'hr'}`;

    const payload = {
      employer_id: employerId,
      title: formData.title,
      job_type: formData.job_type,
      location: locationString,
      salary_range: salaryString,
      description: formData.description,
      requirements: reqs,
      benefits: bens,
      is_active: true,
      // Structured data
      country: formData.countryName,
      city: formData.city,
      work_mode: formData.work_mode,
      salary_amount: parseFloat(formData.salary_amount) || 0,
      salary_currency: formData.salary_currency,
      salary_period: formData.salary_period
    };

    const { error } = await supabase.from('jobs').insert([payload]);

    if(error){
       console.error("Job post error:", error);
       addToast("Error posting job: " + error.message, "error");
       setIsLoading(false);
    } else {
       addToast("Job launched successfully!", "success");
       router.push("/employer");
    }
  };

  return (
    <div className="min-h-screen bg-background relative pt-12 pb-32 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/employer" className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-primary transition-all mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </Link>

        <div className="mb-10">
          <h1 className="text-4xl font-black text-foreground uppercase tracking-tight mb-2">Launch New Bounty</h1>
          <p className="text-muted">Fill the specs to deploy your job to the UpnAbove network.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-surface border border-border p-8 rounded-3xl shadow-sm">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title & Type */}
            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Navigation className="w-3.5 h-3.5" /> Job Title
              </label>
              <input 
                type="text" 
                required
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none text-foreground"
                placeholder="e.g. Lead Combat Architect"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5" /> Engagement Type
              </label>
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
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" /> Work Mode
              </label>
              <select 
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none text-foreground appearance-none"
                value={formData.work_mode}
                onChange={e => setFormData({ ...formData, work_mode: e.target.value })}
              >
                <option value="on-site">On-site</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            {/* Location Section */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Globe className="w-3.5 h-3.5" /> Country
              </label>
              <select 
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none text-foreground appearance-none"
                value={formData.countryCode}
                onChange={e => {
                  const country = countries.find(c => c.isoCode === e.target.value);
                  setFormData({ 
                    ...formData, 
                    countryCode: e.target.value, 
                    countryName: country ? country.name : "" 
                  });
                }}
              >
                {countries.map(c => (
                  <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" /> City
              </label>
              <select 
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none text-foreground appearance-none"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
              >
                {cities.length > 0 ? (
                  cities.map(city => (
                    <option key={city.name + city.latitude} value={city.name}>{city.name}</option>
                  ))
                ) : (
                  <option value="">No cities found / Remote</option>
                )}
              </select>
            </div>

            {/* Salary Section */}
            <div className="space-y-2 col-span-1 md:col-span-2 pt-4 border-t border-border">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 block">Compensation Payload</label>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-shrink-0 w-full sm:w-64">
                  <select 
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none text-foreground appearance-none"
                    value={formData.salary_currency}
                    onChange={e => setFormData({ ...formData, salary_currency: e.target.value })}
                  >
                    {ALL_CURRENCIES.map(code => {
                      const currencyInfo = cc.code(code);
                      let countries = currencyInfo ? (Array.isArray(currencyInfo.countries) ? currencyInfo.countries : [currencyInfo.countries]) : [];
                      
                      // Filter out Western Sahara from the country list
                      countries = countries.filter(c => c !== "Western Sahara");
                      
                      const countriesLabel = countries.join(', ');
                      
                      return (
                        <option key={code} value={code}>
                          {code} - {countriesLabel}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="flex-grow">
                  <div className="relative">
                    <input 
                      type="number" 
                      required
                      className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none text-foreground"
                      placeholder="e.g. 120000"
                      value={formData.salary_amount}
                      onChange={e => setFormData({ ...formData, salary_amount: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex-shrink-0 w-full sm:w-40">
                  <select 
                    className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none text-foreground appearance-none"
                    value={formData.salary_period}
                    onChange={e => setFormData({ ...formData, salary_period: e.target.value })}
                  >
                    <option value="yearly">Per Year</option>
                    <option value="monthly">Per Month</option>
                    <option value="hourly">Per Hour</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Description & Requirements */}
            <div className="space-y-2 col-span-1 md:col-span-2 pt-4 border-t border-border">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Mission Specs (Role Description)</label>
              <textarea 
                required
                rows={6}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none text-foreground resize-none"
                placeholder="Describe the day-to-day responsibilities and impact..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Required Combat Skills (One per line)</label>
              <textarea 
                rows={4}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none text-foreground resize-none font-mono text-sm"
                placeholder="5+ years of React experience&#10;Strong understanding of UI/UX"
                value={formData.requirements}
                onChange={e => setFormData({ ...formData, requirements: e.target.value })}
              />
            </div>

            <div className="space-y-2 col-span-1 md:col-span-2">
              <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Perks & Armor (Benefits)</label>
              <textarea 
                rows={3}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none text-foreground resize-none"
                placeholder="Unlimited PTO&#10;Full Health Coverage"
                value={formData.benefits}
                onChange={e => setFormData({ ...formData, benefits: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-8 border-t border-border flex justify-end">
             <Button type="submit" disabled={isLoading} className="gap-2 px-12 py-5 text-sm uppercase tracking-widest font-black">
               {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
               {isLoading ? "Publishing..." : "Deploy Job Posting"}
             </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
