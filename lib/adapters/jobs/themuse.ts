import type { NormalizedJob, JobType } from "@/lib/types/jobs";

// The Muse Public Jobs API — free without a key (rate-limited).
// Docs: https://www.themuse.com/developers/api/v2
// Strong on US roles from name-brand companies.

interface MuseJob {
  id: number;
  name: string;
  contents?: string;
  type?: string;
  publication_date?: string;
  company?: { name?: string };
  locations?: { name: string }[];
  categories?: { name: string }[];
  levels?: { name: string }[];
  refs?: { landing_page?: string };
}

interface MuseResponse {
  results: MuseJob[];
}

function mapJobType(levels: { name: string }[] | undefined): JobType {
  const t = (levels ?? []).map((l) => l.name).join(" ").toLowerCase();
  if (t.includes("internship")) return "internship";
  return "full-time";
}

function stripHtml(html: string): string {
  return html
    .replace(/<\/?(p|div|li|br|h[1-6])[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/\n\s*\n/g, "\n\n")
    .trim();
}

export async function fetchMuseJobs(pages = 2): Promise<NormalizedJob[]> {
  const all: NormalizedJob[] = [];

  for (let page = 1; page <= pages; page++) {
    const url = `https://www.themuse.com/api/public/jobs?category=Software%20Engineering&page=${page}`;
    const res = await fetch(url, { cache: "no-store" } as RequestInit);
    if (!res.ok) throw new Error(`The Muse API error: ${res.status} ${res.statusText}`);

    const { results }: MuseResponse = await res.json();

    for (const job of results ?? []) {
      const landingPage = job.refs?.landing_page;
      if (!landingPage) continue;

      all.push({
        external_id: `muse_${job.id}`,
        title: job.name,
        description: stripHtml(job.contents || ""),
        company_name: job.company?.name || "Confidential",
        location: job.locations?.map((l) => l.name).join(", ") || "Not specified",
        job_type: mapJobType(job.levels),
        salary_range: null,
        external_url: landingPage,
        source: "themuse",
        category: job.categories?.[0]?.name ?? null,
      });
    }
  }

  return all;
}
