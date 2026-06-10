import type { NormalizedJob, JobType } from "@/lib/types/jobs";

// RemoteOK API — free, no key required. Linkback to the original posting
// (which we store as external_url) is required by their terms.
// Docs: https://remoteok.com/api

interface RemoteOkJob {
  id?: string | number;
  slug?: string;
  company?: string;
  position?: string;
  description?: string;
  location?: string;
  salary_min?: number;
  salary_max?: number;
  tags?: string[];
  url?: string;
  // First array element is a legal notice object with this key
  legal?: string;
}

function mapJobType(tags: string[] | undefined): JobType {
  const t = (tags ?? []).join(" ").toLowerCase();
  if (t.includes("part-time") || t.includes("part_time")) return "part-time";
  if (t.includes("contract") || t.includes("freelance")) return "contract";
  if (t.includes("intern")) return "internship";
  return "full-time";
}

function buildSalaryRange(job: RemoteOkJob): string | null {
  const { salary_min: min, salary_max: max } = job;
  if (!min && !max) return null;
  const fmt = (n: number) => `$${Math.round(n / 1000)}k`;
  if (min && max) return `${fmt(min)} – ${fmt(max)}`;
  if (min) return `${fmt(min)}+`;
  return `up to ${fmt(max!)}`;
}

function stripHtml(html: string): string {
  return html
    .replace(/<\/?(p|div|li|br|h[1-6])[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n\s*\n/g, "\n\n")
    .trim();
}

export async function fetchRemoteOkJobs(limit = 50): Promise<NormalizedJob[]> {
  const res = await fetch("https://remoteok.com/api", {
    cache: "no-store",
    headers: { "User-Agent": "upNabove-job-aggregator" },
  } as RequestInit);
  if (!res.ok) throw new Error(`RemoteOK API error: ${res.status} ${res.statusText}`);

  const data: RemoteOkJob[] = await res.json();

  return (data ?? [])
    .filter((job) => !job.legal && job.id && job.position && job.url)
    .slice(0, limit)
    .map((job) => ({
      external_id: `remoteok_${job.id}`,
      title: job.position!,
      description: stripHtml(job.description || ""),
      company_name: job.company || "Confidential",
      location: job.location || "Remote",
      job_type: mapJobType(job.tags),
      salary_range: buildSalaryRange(job),
      external_url: job.url!,
      source: "remoteok",
      category: job.tags?.[0] ?? null,
    }));
}
