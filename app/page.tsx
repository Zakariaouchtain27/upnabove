import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SearchForm } from "@/components/home/SearchForm";
import { ArrowRight, Zap } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://upnabove.work";

export const metadata: Metadata = {
  title: "upNabove — Tech Jobs & Coding Challenges",
  description:
    "Find remote and on-site software engineering, design, and product jobs. Prove your skills in live anonymous coding challenges and get hired by top companies.",
  alternates: { canonical: BASE_URL },
  openGraph: {
    title: "upNabove — Tech Jobs & Coding Challenges",
    description:
      "Find remote and on-site software engineering, design, and product jobs. Prove your skills in live coding challenges.",
    url: BASE_URL,
    type: "website",
  },
};

export default async function HomePage() {
  const supabase = await createClient();

  const { count: jobCount } = await supabase
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-transparent overflow-hidden">

      {/* Decorative background — hidden from screen readers */}
      <div aria-hidden="true" className="absolute inset-0 bg-grid-pattern opacity-100 pointer-events-none" />
      <div aria-hidden="true" className="absolute top-[-20%] left-[-10%] w-[200px] h-[200px] sm:w-[400px] sm:h-[400px] md:w-[700px] md:h-[700px] bg-violet-700/10 rounded-full blur-[60px] sm:blur-[100px] md:blur-[130px] pointer-events-none" />
      <div aria-hidden="true" className="absolute bottom-[-10%] right-[-10%] w-[180px] h-[180px] sm:w-[350px] sm:h-[350px] md:w-[600px] md:h-[600px] bg-cyan-700/8 rounded-full blur-[60px] sm:blur-[100px] md:blur-[130px] pointer-events-none" />
      <div aria-hidden="true" className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-[var(--background)] to-transparent pointer-events-none" />

      <div className="relative z-10 w-full max-w-3xl mx-auto px-5 text-center">

        {/* ── Hero ─────────────────────────────────────────────────── */}
        <header className="mb-10">
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-zinc-50 mb-4 leading-none">
            up<span className="text-violet-400">N</span>above
          </h1>
          <p className="text-lg sm:text-xl text-zinc-300 font-normal leading-relaxed max-w-md mx-auto">
            Find your next role. Prove your skills. Get hired.
          </p>
        </header>

        {/* ── Job Search ───────────────────────────────────────────── */}
        <section aria-label="Job search">
          <SearchForm />

          {jobCount !== null && jobCount > 0 && (
            <p className="mt-6 text-sm text-zinc-400">
              <span className="text-zinc-200 font-semibold">
                {jobCount.toLocaleString()}
              </span>{" "}
              open positions right now
            </p>
          )}
        </section>

        {/* ── Navigation shortcuts ─────────────────────────────────── */}
        <nav aria-label="Quick links" className="mt-10 flex items-center justify-center gap-6">
          <Link
            href="/forge"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-400 hover:text-violet-300 transition-colors"
          >
            <Zap className="w-4 h-4" aria-hidden="true" />
            Enter the Forge
          </Link>
          <span className="w-px h-4 bg-zinc-700" aria-hidden="true" />
          <Link
            href="/employer/jobs/create"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-300 hover:text-zinc-100 transition-colors"
          >
            Post a job
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </nav>

      </div>
    </main>
  );
}
