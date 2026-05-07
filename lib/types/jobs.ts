export type JobType = "full-time" | "part-time" | "contract" | "internship";

export interface NormalizedJob {
  /** Unique identifier from the source API (used for upsert deduplication) */
  external_id: string;
  title: string;
  description: string;
  company_name: string;
  location: string;
  job_type: JobType;
  /** Human-readable salary string e.g. "$80k - $120k" or null if unknown */
  salary_range: string | null;
  /** Direct URL to apply / original listing */
  external_url: string;
  /** Source identifier e.g. "remotive" | "himalayas" */
  source: string;
  category?: string | null;
}
