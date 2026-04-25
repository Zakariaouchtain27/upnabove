import React from "react";
import Link from "next/link";
import { 
  Search, MapPin, Briefcase, DollarSign, Clock, 
  ChevronDown, Filter, Building2, Star, Zap, Inbox
} from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { SpotlightCard } from "@/components/SpotlightCard";
import { createClient } from "@/lib/supabase/server";
import { JobSearchForm } from "@/components/jobs/JobSearchForm";

export default async function JobsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const resolvedParams = await searchParams;

  const queryText = (resolvedParams?.q as string) || '';
  const locationText = (resolvedParams?.location as string) || '';

  // Attempt to fetch real jobs
  let query = supabase
    .from('jobs')
    .select('*, employers!inner(company_name, company_logo_url)', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (queryText) {
    query = query.or(`title.ilike.%${queryText}%,description.ilike.%${queryText}%`);
  }
  if (locationText) {
    query = query.ilike('location', `%${locationText}%`);
  }

  let jobs: any = [];
  let jobCount = 0;
  try {
    const res = await query.limit(20);
    jobs = res.data;
    jobCount = res.count || 0;
  } catch (e) {
    // 
  }

  const displayJobs = jobs || [];

  return (
    <div className="min-h-screen bg-background relative pt-24 px-6 sm:px-10 pb-32">
      {/* Background Effect */}
      <div className="glow-orb-primary fixed top-[-20%] right-[-10%] opacity-50 pointer-events-none" />

      <div className="layout-wrapper">
        <div className="section-container">
          
          <ScrollReveal delay={0.1}>
            {/* Header Section */}
            <div className="mb-12">
              <h1 className="text-4xl md:text-5xl font-extrabold text-foreground tracking-tight mb-4">
                Explore <span className="text-gradient-primary">Opportunities</span>
              </h1>
              <p className="text-lg text-muted max-w-2xl">
                Discover your next career-defining role from top-tier companies worldwide.
              </p>
            </div>
          </ScrollReveal>

          {/* Search and Filter Bar */}
          <ScrollReveal delay={0.2}>
            <JobSearchForm initialQuery={queryText} initialLocation={locationText} />
          </ScrollReveal>

          {/* Job Listings */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted font-medium">
                {displayJobs.length > 0 
                  ? <>Showing <span className="text-foreground">1-{displayJobs.length}</span> of <span className="text-foreground">{(jobCount || 0).toLocaleString()}</span> jobs</>
                  : <span className="text-muted">No jobs posted yet</span>
                }
              </p>
              <div className="flex items-center gap-2 text-sm text-muted cursor-pointer hover:text-foreground transition-colors">
                Sort by: <span className="text-foreground font-medium">Most Recent</span> <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            {displayJobs.length === 0 ? (
              <ScrollReveal delay={0.3} direction="up">
                <div className="flex flex-col items-center justify-center py-24 bg-surface/50 border border-border border-dashed rounded-3xl text-center">
                  <Inbox className="w-16 h-16 text-muted mb-6" />
                  <h3 className="text-2xl font-bold text-foreground mb-2">No Opportunities Yet</h3>
                  <p className="text-muted max-w-md mb-8">
                    Jobs will appear here once employers start posting. In the meantime, sharpen your skills in The Forge!
                  </p>
                  <Link href="/forge">
                    <button className="px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:scale-105 transition-all shadow-sm">
                      Enter The Forge
                    </button>
                  </Link>
                </div>
              </ScrollReveal>
            ) : (
              <div className="flex flex-col gap-4">
                {displayJobs.map((job: any, i: number) => {
                  const companyName = job.company_name || job.employers?.company_name || 'Confidential';
                  const logoUrl = job.employers?.company_logo_url;
                  
                  return (
                  <ScrollReveal key={job.id} delay={0.2 + (i * 0.1)} direction="up">
                    <SpotlightCard className="w-full wireframe-card hover:bg-surface-hover transition-colors group">
                      <div className="p-6 sm:p-8 flex flex-col sm:flex-row gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden">
                          {logoUrl ? (
                            <img src={logoUrl} alt={companyName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl font-bold text-foreground">{(companyName)[0]}</span>
                          )}
                        </div>
                        
                        <div className="flex-1 flex flex-col justify-center">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
                            <div>
                              <Link href={`/jobs/${job.id}`}>
                                <h2 className="text-xl font-bold text-foreground hover:text-primary transition-colors mb-1">
                                  {job.title}
                                </h2>
                              </Link>
                              <div className="flex items-center gap-2 text-muted">
                                <Building2 className="w-4 h-4" />
                                <span className="font-medium text-foreground">{companyName}</span>
                              </div>
                            </div>
                            <div className="shrink-0 flex items-center">
                               {job.source === 'adzuna' && job.external_apply_url ? (
                                  <a href={job.external_apply_url} target="_blank" rel="noreferrer" className="px-5 py-2.5 bg-[#FF6F61] text-white text-sm font-semibold rounded-xl hover:scale-105 transition-all shadow-[0_0_15px_rgba(255,111,97,0.3)] hover:shadow-[0_0_20px_rgba(255,111,97,0.5)]">
                                     Apply on {companyName} &rarr;
                                  </a>
                               ) : (
                                  <Link href={`/jobs/${job.id}`}>
                                    <button className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:scale-105 transition-all shadow-sm shadow-primary/20">
                                       One Click Apply
                                    </button>
                                  </Link>
                               )}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-4 mb-5 text-sm">
                            {job.location && (
                              <div className="flex items-center gap-2 text-muted">
                                <MapPin className="w-4 h-4" /> {job.location}
                              </div>
                            )}
                            {job.salary_range && (
                              <div className="flex items-center gap-2 text-muted">
                                <DollarSign className="w-4 h-4" /> {job.salary_range}
                              </div>
                            )}
                            {job.job_type && (
                              <div className="flex items-center gap-2 text-muted">
                                <Briefcase className="w-4 h-4" /> {job.job_type}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </SpotlightCard>
                  </ScrollReveal>
                )})}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
