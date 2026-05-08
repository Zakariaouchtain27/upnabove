import type { NormalizedJob, JobType } from "@/lib/types/jobs";

// JSearch (RapidAPI) response shapes
interface JSearchJob {
  job_id: string;
  job_title: string;
  employer_name: string;
  job_description: string;
  job_apply_link: string;
  job_employment_type?: string;
  job_is_remote?: boolean;
  job_city?: string;
  job_state?: string;
  job_country?: string;
  job_min_salary?: number | null;
  job_max_salary?: number | null;
  job_salary_currency?: string | null;
  job_salary_period?: string | null;
  job_category?: string | null;
}

interface JSearchResponse {
  status: string;
  data: JSearchJob[];
}

function mapJobType(raw: string | undefined): JobType {
  if (!raw) return "full-time";
  const t = raw.toUpperCase();
  if (t === "PARTTIME" || t.includes("PART")) return "part-time";
  if (t === "CONTRACTOR" || t.includes("CONTRACT")) return "contract";
  if (t === "INTERN" || t.includes("INTERN")) return "internship";
  return "full-time";
}

function buildLocation(job: JSearchJob): string {
  if (job.job_is_remote) return "Remote";
  const parts = [job.job_city, job.job_state, job.job_country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Remote";
}

function buildSalaryRange(job: JSearchJob): string | null {
  const { job_min_salary, job_max_salary, job_salary_currency = "USD", job_salary_period } = job;
  if (!job_min_salary && !job_max_salary) return null;

  const currency = job_salary_currency ?? "USD";
  const period = job_salary_period ? ` /${job_salary_period.toLowerCase()}` : "";
  const fmt = (n: number) =>
    n >= 1000 ? `${Math.round(n / 1000)}k` : String(Math.round(n));

  if (job_min_salary && job_max_salary)
    return `${currency} ${fmt(job_min_salary)} – ${fmt(job_max_salary)}${period}`;
  if (job_min_salary) return `${currency} ${fmt(job_min_salary)}+${period}`;
  return `${currency} up to ${fmt(job_max_salary!)}${period}`;
}

function stripHtml(html: string): string {
  return html
    .replace(/<\/?(p|div|li|br|h[1-6])[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n\s*\n/g, "\n\n")
    .trim();
}

export async function fetchRapidApiJobs(query: string): Promise<NormalizedJob[]> {
  try {
    const url = `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&num_pages=1`;

    const res = await fetch(url, {
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY ?? "",
        "x-rapidapi-host": "jsearch.p.rapidapi.com",
      },
      cache: "no-store",
    } as RequestInit);

    if (!res.ok) {
      throw new Error(`JSearch API error: ${res.status} ${res.statusText}`);
    }

    const body: JSearchResponse = await res.json();

    if (body.status !== "OK" || !Array.isArray(body.data)) {
      throw new Error(`JSearch returned unexpected payload: status=${body.status}`);
    }

    return body.data
      .filter((job) => job.job_id && job.job_title && job.job_apply_link)
      .map((job) => ({
        external_id: `jsearch_${job.job_id}`,
        title: job.job_title,
        description: stripHtml(job.job_description ?? ""),
        company_name: job.employer_name || "Confidential",
        location: buildLocation(job),
        job_type: mapJobType(job.job_employment_type),
        salary_range: buildSalaryRange(job),
        external_url: job.job_apply_link,
        source: "rapidapi",
        category: job.job_category ?? null,
      }));
  } catch (err) {
    console.error("[RapidAPI/JSearch] fetchRapidApiJobs failed:", err);
    return [];
  }
}
