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

      {/* Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[700px] h-[700px] bg-violet-700/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-700/8 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-[var(--background)] to-transparent pointer-events-none" />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-3xl mx-auto px-5 text-center">

        {/* Wordmark */}
        <div className="mb-10">
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight text-zinc-50 mb-4 leading-none">
            up<span className="text-violet-400">N</span>above
          </h1>
          <p className="text-lg sm:text-xl text-zinc-300 font-normal leading-relaxed max-w-md mx-auto">
            Find your next role. Prove your skills. Get hired.
          </p>
        </div>

        {/* Search bar */}
        <SearchForm />

        {/* Job count */}
        {jobCount !== null && jobCount > 0 && (
          <p className="mt-6 text-sm text-zinc-400">
            <span className="text-zinc-200 font-semibold">{jobCount.toLocaleString()}</span> open positions right now
          </p>
        )}

        {/* Secondary links */}
        <div className="mt-10 flex items-center justify-center gap-6">
          <Link
            href="/forge"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors"
          >
            <Zap className="w-4 h-4" />
            Enter the Forge
          </Link>
          <span className="w-px h-4 bg-zinc-700" />
          <Link
            href="/employer/jobs/create"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-300 hover:text-zinc-100 transition-colors"
          >
            Post a job
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

    </div>
  );
}
