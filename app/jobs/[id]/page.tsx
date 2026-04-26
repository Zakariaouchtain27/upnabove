import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Building2,
  Globe,
  Briefcase,
  Share2,
  Bookmark,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { createClient } from "@/lib/supabase/server";
import OneClickApply from "@/components/jobs/OneClickApply";

const BASE_URL = 'https://upnabove-zeta.vercel.app';

// ─── Dynamic SEO Metadata ────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: job } = await supabase
    .from('jobs')
    .select('title, description, location, company_name, category, salary_range, job_type')
    .eq('id', id)
    .single();

  if (!job) return { title: 'Job Not Found | UpnAbove' };

  const companyName = job.company_name || 'Confidential Company';
  const title = `${job.title} at ${companyName} | UpnAbove`;
  const description = job.description
    ? job.description.slice(0, 155).replace(/\s\S*$/, '…')
    : `Apply for ${job.title} at ${companyName} in ${job.location} on UpnAbove.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/jobs/${id}`,
      siteName: 'UpnAbove',
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    alternates: {
      canonical: `${BASE_URL}/jobs/${id}`,
    },
  };
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: job, error } = await supabase
    .from("jobs")
    .select(`
      *,
      employers (
        company_name,
        company_logo_url,
        industry
      )
    `)
    .eq("id", id)
    .single();

  if (error || !job) {
    notFound();
  }

  const employer = job.employers as any;

  // ─── JSON-LD JobPosting Schema (Google Rich Results) ────────────────────────
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description || `${job.title} position at ${job.company_name || 'a top company'}.`,
    datePosted: job.created_at ? new Date(job.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company_name || employer?.company_name || 'Confidential',
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location || 'Remote',
      },
    },
    employmentType: job.job_type === 'part-time' ? 'PART_TIME' : 'FULL_TIME',
    ...(job.salary_range && {
      baseSalary: {
        '@type': 'MonetaryAmount',
        currency: 'USD',
        value: {
          '@type': 'QuantitativeValue',
          description: job.salary_range,
        },
      },
    }),
    ...(job.external_apply_url && { url: job.external_apply_url }),
  };


  return (
    <>
      {/* JSON-LD for Google Rich Results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Back */}
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-primary transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Jobs
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div className="p-6 rounded-2xl border border-border bg-background">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center shrink-0 dark:bg-primary-900/30 overflow-hidden">
                {employer?.company_logo_url ? (
                   <img src={employer.company_logo_url} alt={employer?.company_name || job.company_name} className="w-full h-full object-cover" />
                ) : (
                   <Building2 className="w-7 h-7 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground">
                  {job.title}
                </h1>
                <p className="text-muted mt-1">{job.company_name || employer?.company_name || 'Confidential Company'}</p>
                <div className="flex flex-wrap items-center gap-3 mt-3 text-sm text-muted">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" /> {job.job_type}
                  </span>
                  {job.salary_range && (
                     <span className="flex items-center gap-1">
                       <DollarSign className="w-4 h-4" /> {job.salary_range}
                     </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  {job.category && (
                     <Badge variant="primary">{job.category}</Badge>
                  )}
                  {job.requirements?.slice(0, 4).map((req: string, i: number) => (
                    <Badge key={i} variant="primary">{req}</Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 mt-6 pt-6 border-t border-border">
              {job.source === 'adzuna' && job.external_apply_url ? (
                 <a href={job.external_apply_url} target="_blank" rel="noreferrer" className="w-full sm:w-auto px-6 py-3 bg-[#FF6F61] text-white text-center font-bold rounded-xl hover:scale-105 transition-all shadow-[0_0_15px_rgba(255,111,97,0.4)]">
                    Apply on {job.company_name || 'External Site'} &rarr;
                 </a>
              ) : (
                 <OneClickApply 
                    jobId={job.id} 
                    jobTitle={job.title} 
                 />
              )}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                 <Button variant="outline" size="lg" className="flex-1 sm:flex-none">
                   <Bookmark className="w-4 h-4" />
                 </Button>
                 <Button variant="ghost" size="lg" className="flex-1 sm:flex-none">
                   <Share2 className="w-4 h-4" />
                 </Button>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-6 rounded-2xl border border-border bg-background">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              About the Role
            </h2>
            <div className="prose prose-sm text-muted max-w-none space-y-4 overflow-visible">
              <p className="whitespace-pre-wrap leading-relaxed">{job.description}</p>

              {/* Adzuna jobs: prompt user to view full description externally */}
              {job.source === 'adzuna' && job.external_apply_url && (
                <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">Want the full job description?</p>
                    <p className="text-xs text-muted mt-0.5">This is a preview. View the complete posting on the employer's site.</p>
                  </div>
                  <a
                    href={job.external_apply_url}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    View Full Description →
                  </a>
                </div>
              )}
              
              {job.requirements && job.requirements.length > 0 && (
                 <>
                    <h3 className="text-foreground font-semibold text-base mt-6">Requirements</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {job.requirements.map((req, i) => (
                        <li key={i}>{req}</li>
                      ))}
                    </ul>
                 </>
              )}
              
              {job.benefits && job.benefits.length > 0 && (
                 <>
                    <h3 className="text-foreground font-semibold text-base mt-6">Benefits</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      {job.benefits.map((ben, i) => (
                        <li key={i}>{ben}</li>
                      ))}
                    </ul>
                 </>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl border border-border bg-background">
            <h3 className="text-sm font-semibold text-foreground mb-4">
              Company Info
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="w-4 h-4 text-muted" />
                <span className="text-muted">{employer?.company_name || 'Confidential'}</span>
              </div>
              {employer?.industry && (
                 <div className="flex items-center gap-3 text-sm">
                   <Globe className="w-4 h-4 text-muted" />
                   <span className="text-muted">{employer.industry}</span>
                 </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Briefcase className="w-4 h-4 text-muted" />
                <span className="text-muted">Growing Team</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="w-4 h-4 text-muted" />
                <span className="text-muted">{job.location}</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-border bg-background">
            <h3 className="text-sm font-semibold text-foreground mb-2">
              Job ID
            </h3>
            <p className="text-sm text-muted font-mono">{id.slice(0, 8)}</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

