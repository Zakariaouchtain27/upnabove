import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SearchForm } from "@/components/home/SearchForm";
import { HomeFeatures } from "@/components/home/HomeFeatures";
import { HomeHero } from "@/components/home/HomeHero";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://upnabove.work";

export const metadata: Metadata = {
  title: "upNabove — Tech Jobs & The Forge",
  description:
    "Find remote and on-site software engineering jobs. Prove your skills in live anonymous coding challenges and get hired by top companies.",
  alternates: { canonical: BASE_URL },
  openGraph: {
    title: "upNabove — Tech Jobs & The Forge",
    description: "The job board where you prove your code, not your resume.",
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
    <main className="relative flex flex-col overflow-hidden">
      <HomeHero jobCount={jobCount} />

      {/* Search anchor — visible below the fold */}
      <section className="relative z-10 w-full border-y border-white/[0.05] py-10 px-5" style={{ background: "rgba(0,0,0,0.45)" }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-xs text-zinc-600 uppercase tracking-widest font-medium mb-5 text-center">
            Search {jobCount ? jobCount.toLocaleString() : "thousands of"} open positions
          </p>
          <SearchForm />
        </div>
      </section>

      <HomeFeatures />
    </main>
  );
}