import Link from "next/link";
import { MapPin, Briefcase, DollarSign, Building2, Inbox, Globe, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { JobsSearchBar } from "@/components/jobs/JobsSearchBar";
import { JobFilters } from "@/components/jobs/JobFilters";
import { JobsPagination } from "@/components/jobs/JobsPagination";
import { JobSortSelect } from "@/components/jobs/JobSortSelect";
import OneClickApply from "@/components/jobs/OneClickApply";
import ExternalApplyButton from "@/components/jobs/ExternalApplyButton";

export const metadata = {
  title: "Find Jobs",
  description: "Search thousands of tech jobs — remote and on-site engineering, design, product, and data roles, updated daily.",
};

const PAGE_SIZE = 20;

// Strip characters that would break PostgREST or() expressions
const sanitize = (s: string) => s.replace(/[,()]/g, " ").trim();

const csv = (v: string | undefined) =>
  (v || "").split(",").map(s => s.trim()).filter(Boolean);

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (days > 30)  return `${Math.floor(days / 30)}mo ago`;
  if (days > 0)   return `${days}d ago`;
  if (hours > 0)  return `${hours}h ago`;
  if (mins > 0)   return `${mins}m ago`;
  return "just now";
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();
  const params = await searchParams;

  const queryText    = sanitize((params?.q   as string) || "");
  const locationText = sanitize((params?.loc as string) || "");
  const timeText     = (params?.time as string) || "";
  const sortText     = (params?.sort as string) || "recent";
  const srcText      = (params?.src  as string) || "";
  const types        = csv(params?.type     as string);
  const modes        = csv(params?.mode     as string);
  const categories   = csv(params?.category as string);
  const page         = Math.max(1, parseInt((params?.page as string) || "1", 10) || 1);

  let query = supabase
    .from("jobs")
    .select("*, employers(company_name, company_logo_url)", { count: "exact" })
    .eq("is_active", true);

  // ── Text search ──
  if (queryText) {
    query = query.or(
      `title.ilike.%${queryText}%,description.ilike.%${queryText}%,category.ilike.%${queryText}%,company_name.ilike.%${queryText}%`
    );
  }
  if (locationText) {
    query = query.ilike("location", `%${locationText}%`);
  }

  // ── Job type (multi) ──
  if (types.length) {
    query = query.or(types.map(t => `job_type.ilike.%${sanitize(t)}%`).join(","));
  }

  // ── Work mode (multi) — also match "remote" appearing in location ──
  if (modes.length) {
    const conds = modes.flatMap(m => {
      const v = sanitize(m);
      return v === "remote"
        ? [`work_mode.ilike.%${v}%`, `location.ilike.%remote%`]
        : [`work_mode.ilike.%${v}%`];
    });
    query = query.or(conds.join(","));
  }

  // ── Category (multi) ──
  if (categories.length) {
    query = query.or(categories.map(c => `category.ilike.%${sanitize(c)}%`).join(","));
  }

  // ── Source ──
  if (srcText === "direct")     query = query.is("source", null);
  if (srcText === "aggregated") query = query.not("source", "is", null);

  // ── Date posted ──
  if (timeText) {
    const now = new Date();
    if (timeText === "24h") now.setHours(now.getHours() - 24);
    else if (timeText === "7d")  now.setDate(now.getDate() - 7);
    else if (timeText === "30d") now.setDate(now.getDate() - 30);
    query = query.gte("created_at", now.toISOString());
  }

  // ── Sort ──
  if (sortText === "oldest") {
    query = query.order("created_at", { ascending: true });
  } else if (sortText === "salary_high") {
    query = query
      .order("salary_amount", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
  } else if (sortText === "popular") {
    query = query
      .order("views", { ascending: false })
      .order("created_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  // ── Pagination — fetch only the current page ──
  const from = (page - 1) * PAGE_SIZE;
  const { data: jobs, count } = await query.range(from, from + PAGE_SIZE - 1);

  const jobCount   = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(jobCount / PAGE_SIZE));
  const displayJobs = jobs ?? [];

  // ── User state (applied jobs, resume) in parallel ──
  let appliedJobIds = new Set<string>();
  let hasResume = false;
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const [appsResult, candidateResult] = await Promise.all([
      supabase.from("applications").select("job_id").eq("candidate_id", user.id),
      supabase.from("candidates").select("resume_url").eq("id", user.id).maybeSingle(),
    ]);
    if (appsResult.data) {
      appliedJobIds = new Set(appsResult.data.map(a => a.job_id).filter((id): id is string => id !== null));
    }
    hasResume = !!candidateResult.data?.resume_url;
  }

  const hasActiveSearch = !!(
    queryText || locationText || timeText || srcText ||
    types.length || modes.length || categories.length
  );

  const rangeStart = jobCount === 0 ? 0 : from + 1;
  const rangeEnd   = Math.min(from + PAGE_SIZE, jobCount);

  return (
    <div className="min-h-screen bg-transparent relative pt-24 pb-32">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-2">
            Find your next role
          </h1>
          <p className="text-zinc-500 font-light">
            {jobCount > 0
              ? `${jobCount.toLocaleString()} open positions, updated daily.`
              : "Search thousands of tech roles, updated daily."}
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <JobsSearchBar />
        </div>

        {/* Two-column: filters + list */}
        <div className="flex flex-col lg:flex-row gap-8">
          <JobFilters />

          <div className="flex-1 min-w-0">
            {/* Results bar */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-zinc-500">
                {jobCount > 0 ? (
                  <>
                    Showing <span className="text-zinc-200 font-medium">{rangeStart}–{rangeEnd}</span> of{" "}
                    <span className="text-zinc-200 font-medium">{jobCount.toLocaleString()}</span> jobs
                  </>
                ) : (
                  "No jobs found"
                )}
              </p>
              <JobSortSelect initialSort={sortText} />
            </div>

            {/* Empty state */}
            {displayJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 border border-dashed border-zinc-800 rounded-2xl text-center px-6">
                <Inbox className="w-12 h-12 text-zinc-700 mb-5" />
                {hasActiveSearch ? (
                  <>
                    <h3 className="text-xl font-bold text-white mb-2">No matches</h3>
                    <p className="text-sm text-zinc-500 max-w-sm mb-7 font-light">
                      Nothing fits those filters. Try broader keywords or clear a few filters.
                    </p>
                    <Link
                      href="/jobs"
                      className="px-6 py-2.5 rounded-xl bg-zinc-100 text-zinc-900 text-sm font-semibold hover:bg-white transition-colors"
                    >
                      Clear everything
                    </Link>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-white mb-2">Nothing here yet</h3>
                    <p className="text-sm text-zinc-500 max-w-sm mb-7 font-light">
                      Jobs appear as employers post and our daily aggregation runs. Meanwhile, sharpen your skills in The Forge.
                    </p>
                    <Link
                      href="/forge"
                      className="px-6 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-500 transition-colors"
                    >
                      Enter The Forge
                    </Link>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {displayJobs.map((job: any) => {
                  const companyName = job.company_name || job.employers?.company_name || "Confidential";
                  const logoUrl = job.employers?.company_logo_url;
                  const isExternal = !!(job.source && job.external_apply_url);
                  const isRemote =
                    job.work_mode?.toLowerCase().includes("remote") ||
                    job.location?.toLowerCase().includes("remote");

                  return (
                    <article
                      key={job.id}
                      className="group relative rounded-2xl border border-zinc-800/70 bg-zinc-950/50 hover:border-zinc-700 hover:bg-zinc-900/50 transition-all duration-200 animate-fade-in"
                    >
                      <div className="p-5 sm:p-6 flex gap-4 sm:gap-5">

                        {/* Logo */}
                        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 overflow-hidden">
                          {logoUrl ? (
                            <img src={logoUrl} alt={companyName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-lg font-bold text-zinc-400">{companyName[0]}</span>
                          )}
                        </div>

                        {/* Body */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                              <Link href={`/jobs/${job.id}`} className="block">
                                <h2 className="text-base sm:text-lg font-semibold text-zinc-100 group-hover:text-white truncate transition-colors">
                                  {job.title}
                                </h2>
                              </Link>
                              <div className="flex items-center gap-1.5 mt-0.5 text-sm text-zinc-500">
                                <Building2 className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate">{companyName}</span>
                                {job.created_at && (
                                  <>
                                    <span className="text-zinc-700">·</span>
                                    <span className="flex items-center gap-1 shrink-0 text-zinc-600">
                                      <Clock className="w-3 h-3" /> {timeAgo(job.created_at)}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="shrink-0 hidden sm:block">
                              {isExternal ? (
                                <ExternalApplyButton
                                  jobId={job.id}
                                  companyName={companyName}
                                  url={job.external_apply_url}
                                />
                              ) : (
                                <OneClickApply
                                  jobId={job.id}
                                  jobTitle={job.title}
                                  userId={user?.id}
                                  hasApplied={appliedJobIds.has(job.id)}
                                  hasResume={hasResume}
                                />
                              )}
                            </div>
                          </div>

                          {/* Meta chips */}
                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            {isRemote && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                                <Globe className="w-3 h-3" /> Remote
                              </span>
                            )}
                            {job.location && !isRemote && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800/70 border border-zinc-700/50 text-zinc-400 text-xs">
                                <MapPin className="w-3 h-3" /> {job.location}
                              </span>
                            )}
                            {job.job_type && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800/70 border border-zinc-700/50 text-zinc-400 text-xs">
                                <Briefcase className="w-3 h-3" /> {job.job_type}
                              </span>
                            )}
                            {job.salary_range && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium">
                                <DollarSign className="w-3 h-3" /> {job.salary_range}
                              </span>
                            )}
                            {job.category && (
                              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-zinc-800/70 border border-zinc-700/50 text-zinc-500 text-xs">
                                {job.category}
                              </span>
                            )}
                          </div>

                          {/* Mobile apply button */}
                          <div className="sm:hidden mt-4">
                            {isExternal ? (
                              <ExternalApplyButton
                                jobId={job.id}
                                companyName={companyName}
                                url={job.external_apply_url}
                              />
                            ) : (
                              <OneClickApply
                                jobId={job.id}
                                jobTitle={job.title}
                                userId={user?.id}
                                hasApplied={appliedJobIds.has(job.id)}
                                hasResume={hasResume}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            <JobsPagination page={page} totalPages={totalPages} />
          </div>
        </div>
      </div>
    </div>
  );
}
