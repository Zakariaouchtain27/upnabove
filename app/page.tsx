import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { SearchForm } from "@/components/home/SearchForm";
import { BentoGrid } from "@/components/home/BentoGrid";
import { FadeIn } from "@/components/ui/FadeIn";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://upnabove.work";

export const metadata: Metadata = {
  title: "upNabove — Skill issue.",
  description:
    "Find remote and on-site software engineering jobs. Prove your skills in live anonymous coding challenges and get hired by top companies.",
  alternates: { canonical: BASE_URL },
  openGraph: {
    title: "upNabove — Skill issue.",
    description:
      "The job board where you prove your code, not your resume.",
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
    <main className="relative min-h-screen flex flex-col items-center bg-black overflow-hidden">

      {/* Subtle atmospheric depth */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-violet-600/6 rounded-full blur-[180px]" />
        <div className="absolute top-[20%] right-[10%] w-[400px] h-[400px] bg-violet-900/5 rounded-full blur-[140px]" />
      </div>

      {/* Hero */}
      <section className="relative z-10 w-full flex flex-col items-center justify-center text-center px-5 pt-40 pb-24 min-h-[82vh]">

        <FadeIn delay={0}>
          <h1
            className="text-[clamp(4rem,14vw,9rem)] font-bold text-white tracking-tight leading-none select-none mb-4"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 700 }}
          >
            Skill issue.
          </h1>
        </FadeIn>

        <FadeIn delay={0.08} className="mb-14">
          <p
            className="text-base sm:text-lg text-zinc-500 tracking-wide"
            style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 300 }}
          >
            Find the job. Prove you&rsquo;re not mid.
          </p>
        </FadeIn>

        <FadeIn delay={0.15} className="w-full max-w-2xl mx-auto">
          <SearchForm />
        </FadeIn>

        {jobCount !== null && jobCount > 0 && (
          <FadeIn delay={0.22}>
            <p
              className="mt-7 text-sm text-zinc-600"
              style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 300 }}
            >
              <span className="text-zinc-400">{jobCount.toLocaleString()}</span> open positions live right now
            </p>
          </FadeIn>
        )}
      </section>

      {/* Feature bento grid */}
      <section className="relative z-10 w-full pb-32 px-0">
        <BentoGrid jobCount={jobCount} />
      </section>

    </main>
  );
}
