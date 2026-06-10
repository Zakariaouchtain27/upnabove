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
import ExternalApplyButton from "@/components/jobs/ExternalApplyButton";
import JobViewTracker from "@/components/jobs/JobViewTracker";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://upnabove.work";

// ─── Dynamic SEO Metadata ────────────────────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: job } = await supabase
    .from("jobs")
    .select("title, description, location, company_name, category, salary_range, job_type, work_mode")
    .eq("id", id)
    .single();

  if (!job) return { title: "Job Not Found" };

  const company = job.company_name ?? "Confidential Company";
  const location = job.work_mode === "remote" ? "Remote" : job.location ?? "Worldwide";

  const title = `${job.title} at ${company} (${location})`;
  const description = job.description
    ? `${job.description.slice(0, 148).trimEnd()}…`
    : `Apply for ${job.title} at ${company} — ${location}. Browse tech jobs on upNabove.`;

  const canonical = `${BASE_URL}/jobs/${id}`;

  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "upNabove",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
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

  // Check if current user has applied
  let hasApplied = false;
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: existingApp } = await supabase
      .from('applications')
      .select('id')
      .eq('job_id', id)
      .eq('candidate_id', user.id)
      .maybeSingle();
      
    if (existingApp) hasApplied = true;
  }

  // ─── JSON-LD JobPosting Schema (Google Rich Results) ────────────────────────
  const employmentTypeMap: Record<string, string> = {
    "full-time": "FULL_TIME",
    "part-time": "PART_TIME",
    contract: "CONTRACTOR",
    freelance: "CONTRACTOR",
    internship: "INTERN",
    temporary: "TEMPORARY",
    volunteer: "VOLUNTEER",
  };

  const isRemote = job.work_mode === "remote" || job.location?.toLowerCase().includes("remote");

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    identifier: {
      "@type": "PropertyValue",
      name: "upNabove",
      value: id,
    },
    title: job.title,
    description: job.description ?? `${job.title} position at ${job.company_name ?? "a top company"}.`,
    datePosted: job.created_at
      ? new Date(job.created_at).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
    ...(job.expires_at && {
      validThrough: new Date(job.expires_at).toISOString(),
    }),
    employmentType: employmentTypeMap[job.job_type?.toLowerCase() ?? ""] ?? "FULL_TIME",
    directApply: !job.source,
    hiringOrganization: {
      "@type": "Organization",
      name: job.company_name ?? employer?.company_name ?? "Confidential",
      ...(employer?.company_logo_url && { logo: employer.company_logo_url }),
    },
    jobLocation: isRemote
      ? { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: "Remote" } }
      : {
          "@type": "Place",
          address: {
            "@type": "PostalAddress",
            addressLocality: job.city ?? job.location,
            addressCountry: job.country ?? undefined,
          },
        },
    ...(isRemote && { jobLocationType: "TELECOMMUTE" }),
    ...(job.salary_range && {
      baseSalary: {
        "@type": "MonetaryAmount",
        currency: job.salary_currency ?? "USD",
        value: {
          "@type": "QuantitativeValue",
          description: job.salary_range,
          ...(job.salary_amount && { value: job.salary_amount }),
          ...(job.salary_period && {
            unitText: job.salary_period.toUpperCase(),
          }),
        },
      },
    }),
    url: `${BASE_URL}/jobs/${id}`,
    ...(job.external_apply_url && { sameAs: job.external_apply_url }),
  };


  return (
    <>
      {/* JSON-LD for Google Rich Results */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <JobViewTracker jobId={id} />
    <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-8">
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
              {job.source && job.external_apply_url ? (
                 <ExternalApplyButton
                    jobId={job.id}
                    companyName={job.company_name || 'External Site'}
                    url={job.external_apply_url}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 text-white text-center font-bold rounded-xl hover:bg-violet-500 hover:scale-105 transition-all shadow-lg shadow-violet-900/40"
                 />
              ) : (
                 <OneClickApply 
                    jobId={job.id} 
                    jobTitle={job.title} 
                    hasApplied={hasApplied}
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

              {/* Aggregated jobs: prompt user to view full description externally */}
              {job.source && job.external_apply_url && (
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

