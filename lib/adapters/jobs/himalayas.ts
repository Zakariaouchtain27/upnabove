import type { NormalizedJob, JobType } from "@/lib/types/jobs";

interface HimalayasJob {
  id: string;
  title: string;
  companyName: string;
  minSalary?: number;
  maxSalary?: number;
  currency?: string;
  employmentType?: string;
  locationRestrictions?: string[];
  description: string;
  url: string;
  categories?: string[];
}

interface HimalayasResponse {
  jobs: HimalayasJob[];
}

function mapJobType(raw: string | undefined): JobType {
  if (!raw) return "full-time";
  const t = raw.toLowerCase();
  if (t.includes("part")) return "part-time";
  if (t.includes("contract") || t.includes("freelance")) return "contract";
  if (t.includes("intern")) return "internship";
  return "full-time";
}

function buildSalaryRange(job: HimalayasJob): string | null {
  const { minSalary, maxSalary, currency = "USD" } = job;
  if (!minSalary && !maxSalary) return null;
  const fmt = (n: number) => `${Math.round(n / 1000)}k`;
  if (minSalary && maxSalary) return `${currency} ${fmt(minSalary)} – ${fmt(maxSalary)}`;
  if (minSalary) return `${currency} ${fmt(minSalary)}+`;
  return `${currency} up to ${fmt(maxSalary!)}`;
}

function stripHtml(html: string): string {
  return html
    .replace(/<\/?(p|div|li|br|h[1-6])[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n\s*\n/g, "\n\n")
    .trim();
}

export async function fetchHimalayasJobs(limit = 20): Promise<NormalizedJob[]> {
  const url = `https://himalayas.app/jobs/api?limit=${limit}`;
  const res = await fetch(url, { cache: "no-store" } as RequestInit);
  if (!res.ok) throw new Error(`Himalayas API error: ${res.status} ${res.statusText}`);

  const { jobs }: HimalayasResponse = await res.json();

  return jobs.map((job) => ({
    external_id: `himalayas_${job.id}`,
    title: job.title,
    description: stripHtml(job.description || ""),
    company_name: job.companyName || "Confidential",
    location: job.locationRestrictions?.join(", ") || "Remote",
    job_type: mapJobType(job.employmentType),
    salary_range: buildSalaryRange(job),
    external_url: job.url,
    source: "himalayas",
    category: job.categories?.[0] ?? null,
  }));
}
