import type { NormalizedJob, JobType } from "@/lib/types/jobs";

// Jobicy Remote Jobs API — free, no key required.
// Docs: https://jobicy.com/jobs-rss-feed (API v2)
// Curated remote roles across tech, marketing, design.

interface JobicyJob {
  id: number | string;
  url: string;
  jobTitle: string;
  companyName: string;
  companyLogo?: string;
  jobIndustry?: string[] | string;
  jobType?: string[] | string;
  jobGeo?: string;
  jobLevel?: string;
  jobDescription?: string;
  jobExcerpt?: string;
  annualSalaryMin?: number | null;
  annualSalaryMax?: number | null;
  salaryCurrency?: string;
}

interface JobicyResponse {
  jobs: JobicyJob[];
}

function first(v: string[] | string | undefined): string | null {
  if (Array.isArray(v)) return v[0] ?? null;
  return v ?? null;
}

function mapJobType(raw: string | null): JobType {
  const t = (raw ?? "").toLowerCase();
  if (t.includes("part")) return "part-time";
  if (t.includes("contract") || t.includes("freelance")) return "contract";
  if (t.includes("intern")) return "internship";
  return "full-time";
}

function buildSalaryRange(job: JobicyJob): string | null {
  const { annualSalaryMin: min, annualSalaryMax: max, salaryCurrency = "USD" } = job;
  if (!min && !max) return null;
  const fmt = (n: number) => `${Math.round(n / 1000)}k`;
  if (min && max) return `${salaryCurrency} ${fmt(min)} – ${fmt(max)}`;
  if (min) return `${salaryCurrency} ${fmt(min)}+`;
  return `${salaryCurrency} up to ${fmt(max!)}`;
}

function stripHtml(html: string): string {
  return html
    .replace(/<\/?(p|div|li|br|h[1-6])[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n\s*\n/g, "\n\n")
    .trim();
}

export async function fetchJobicyJobs(count = 50): Promise<NormalizedJob[]> {
  const res = await fetch(`https://jobicy.com/api/v2/remote-jobs?count=${count}`, {
    cache: "no-store",
  } as RequestInit);
  if (!res.ok) throw new Error(`Jobicy API error: ${res.status} ${res.statusText}`);

  const { jobs }: JobicyResponse = await res.json();

  return (jobs ?? []).map((job) => ({
    external_id: `jobicy_${job.id}`,
    title: job.jobTitle,
    description: stripHtml(job.jobDescription || job.jobExcerpt || ""),
    company_name: job.companyName || "Confidential",
    location: job.jobGeo || "Remote",
    job_type: mapJobType(first(job.jobType)),
    salary_range: buildSalaryRange(job),
    external_url: job.url,
    source: "jobicy",
    category: first(job.jobIndustry),
  }));
}
