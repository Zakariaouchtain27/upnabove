import type { NormalizedJob, JobType } from "@/lib/types/jobs";

// Arbeitnow Job Board API — free, no key required.
// Docs: https://www.arbeitnow.com/api/job-board-api
// Mostly European tech roles (strong on Germany / remote EU).

interface ArbeitnowJob {
  slug: string;
  company_name: string;
  title: string;
  description: string;
  remote: boolean;
  url: string;
  tags?: string[];
  job_types?: string[];
  location?: string;
  created_at?: number;
}

interface ArbeitnowResponse {
  data: ArbeitnowJob[];
}

function mapJobType(types: string[] | undefined): JobType {
  const t = (types ?? []).join(" ").toLowerCase();
  if (t.includes("part")) return "part-time";
  if (t.includes("contract") || t.includes("freelance")) return "contract";
  if (t.includes("intern") || t.includes("werkstudent")) return "internship";
  return "full-time";
}

function stripHtml(html: string): string {
  return html
    .replace(/<\/?(p|div|li|br|h[1-6])[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n\s*\n/g, "\n\n")
    .trim();
}

export async function fetchArbeitnowJobs(limit = 50): Promise<NormalizedJob[]> {
  const res = await fetch("https://www.arbeitnow.com/api/job-board-api", {
    cache: "no-store",
  } as RequestInit);
  if (!res.ok) throw new Error(`Arbeitnow API error: ${res.status} ${res.statusText}`);

  const { data }: ArbeitnowResponse = await res.json();

  return (data ?? []).slice(0, limit).map((job) => ({
    external_id: `arbeitnow_${job.slug}`,
    title: job.title,
    description: stripHtml(job.description || ""),
    company_name: job.company_name || "Confidential",
    location: job.remote ? "Remote" : job.location || "Europe",
    job_type: mapJobType(job.job_types),
    salary_range: null,
    external_url: job.url,
    source: "arbeitnow",
    category: job.tags?.[0] ?? null,
  }));
}
