import type { NormalizedJob, JobType } from "@/lib/types/jobs";

interface RemotiveJob {
  id: number;
  url: string;
  title: string;
  company_name: string;
  job_type: string;
  candidate_required_location: string;
  salary: string;
  description: string;
  category: string;
}

interface RemotiveResponse {
  jobs: RemotiveJob[];
}

function mapJobType(raw: string): JobType {
  if (raw === "part_time") return "part-time";
  if (raw === "contract" || raw === "freelance") return "contract";
  if (raw === "internship") return "internship";
  return "full-time";
}

function stripHtml(html: string): string {
  return html
    .replace(/<\/?(p|div|li|br|h[1-6])[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n\s*\n/g, "\n\n")
    .trim();
}

export async function fetchRemotiveJobs(limit = 100): Promise<NormalizedJob[]> {
  const url = `https://remotive.com/api/remote-jobs?category=software-dev&limit=${limit}`;
  const res = await fetch(url, { cache: "no-store" } as RequestInit);
  if (!res.ok) throw new Error(`Remotive API error: ${res.status} ${res.statusText}`);

  const { jobs }: RemotiveResponse = await res.json();

  return jobs.map((job) => ({
    external_id: job.id.toString(),
    title: job.title,
    description: stripHtml(job.description),
    company_name: job.company_name || "Confidential",
    location: job.candidate_required_location || "Remote",
    job_type: mapJobType(job.job_type),
    salary_range: job.salary || null,
    external_url: job.url,
    source: "remotive",
    category: job.category || null,
  }));
}
