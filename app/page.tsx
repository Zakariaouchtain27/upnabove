import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SearchForm } from "@/components/home/SearchForm";
import { ArrowRight, Zap } from "lucide-react";

export default async function HomePage() {
  const supabase = await createClient();

  const { count: jobCount } = await supabase
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-transparent overflow-hidden">

      {/* ── Subtle background ─────────────────────────── */}
      <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-violet-700/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-700/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-[var(--background)] to-transparent pointer-events-none" />

      {/* ── Main content ──────────────────────────────── */}
      <div className="relative z-10 w-full max-w-2xl mx-auto px-5 text-center">

        {/* Wordmark */}
        <div className="mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-100 mb-3">
            Up<span className="text-violet-400">N</span>Above
          </h1>
          <p className="text-base text-zinc-500 font-normal">
            Find your next role. Prove your skills. Get hired.
          </p>
        </div>

        {/* Search bar */}
        <SearchForm />

        {/* Job count */}
        {jobCount !== null && jobCount > 0 && (
          <p className="mt-5 text-xs text-zinc-600">
            <span className="text-zinc-400 font-semibold">{jobCount.toLocaleString()}</span> open positions right now
          </p>
        )}

        {/* Secondary actions */}
        <div className="mt-10 flex items-center justify-center gap-6">
          <Link
            href="/forge"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors"
          >
            <Zap className="w-3.5 h-3.5" />
            Enter the Forge
          </Link>
          <span className="w-px h-4 bg-zinc-800" />
          <Link
            href="/employer/jobs/create"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Post a job
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

    </div>
  );
}
