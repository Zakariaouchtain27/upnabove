import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SearchForm } from "@/components/home/SearchForm";
import { BentoGrid } from "@/components/home/BentoGrid";
import { FadeIn } from "@/components/ui/FadeIn";
import { Zap } from "lucide-react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://upnabove.work";

export const metadata: Metadata = {
  title: "upNabove — Don't send a resume. Prove your code.",
  description:
    "Find remote and on-site software engineering jobs. Prove your skills in live anonymous coding challenges and get hired by top companies.",
  alternates: { canonical: BASE_URL },
  openGraph: {
    title: "upNabove — Don't send a resume. Prove your code.",
    description:
      "Live coding challenges, real-time spectator mode, and AI-powered job matching. The job board built for engineers.",
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

      {/* Atmospheric background */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-violet-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-indigo-500/10 rounded-full blur-[100px]" />
        <div className="absolute top-[15%] right-[10%] w-[300px] h-[300px] bg-violet-800/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-[20%] left-[5%] w-[250px] h-[250px] bg-cyan-900/8 rounded-full blur-[80px]" />
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
          }}
        />
        <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* Hero */}
      <section className="relative z-10 w-full flex flex-col items-center text-center pt-28 pb-16 px-5">

        <FadeIn delay={0} className="mb-8">
          <Link href="/forge">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl text-sm text-zinc-300 hover:border-violet-500/40 hover:text-zinc-100 transition-colors duration-200 cursor-pointer">
              <Zap className="w-3.5 h-3.5 text-violet-400" aria-hidden="true" />
              Introducing The Live Forge Arena
            </span>
          </Link>
        </FadeIn>

        <FadeIn delay={0.1} className="mb-6 max-w-4xl mx-auto">
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] select-none">
            <span className="text-white">Don&rsquo;t send a resume.</span>
            <br />
            <span className="bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
              Prove your code.
            </span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.2} className="mb-10 max-w-lg mx-auto">
          <p className="text-lg sm:text-xl text-zinc-400 leading-relaxed font-normal">
            Live coding challenges. Real-time spectator mode. AI job matching that actually works.
          </p>
        </FadeIn>

        <FadeIn delay={0.3} className="w-full max-w-3xl mx-auto">
          <SearchForm />
        </FadeIn>

        {jobCount !== null && jobCount > 0 && (
          <FadeIn delay={0.4}>
            <p className="mt-6 text-sm text-zinc-600">
              <span className="text-zinc-400 font-semibold">{jobCount.toLocaleString()}</span>
              {" "}open positions live right now
            </p>
          </FadeIn>
        )}
      </section>

      {/* Bento feature grid */}
      <section className="relative z-10 w-full pb-24 px-0">
        <BentoGrid jobCount={jobCount} />
      </section>

      {/* CTA */}
      <section className="relative z-10 w-full flex flex-col items-center text-center pb-32 px-5">
        <FadeIn delay={0.2} className="max-w-xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tighter text-white leading-tight">
            Ready to rise above<br />
            <span className="bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
              the noise?
            </span>
          </h2>
          <p className="text-zinc-500 text-base">
            No cover letters. No keyword games. Just you, the code, and the clock.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-zinc-100 text-zinc-900 font-semibold text-sm hover:bg-white transition-colors duration-150 shadow-[0_0_40px_rgba(255,255,255,0.10)] hover:shadow-[0_0_60px_rgba(255,255,255,0.18)]"
            >
              Get started for free
            </Link>
            <Link
              href="/forge"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-white/5 border border-white/10 text-zinc-300 font-semibold text-sm hover:bg-white/8 hover:border-white/20 hover:text-white backdrop-blur-xl transition-all duration-150"
            >
              <Zap className="w-4 h-4 text-violet-400" aria-hidden="true" />
              Enter the Forge
            </Link>
          </div>
        </FadeIn>
      </section>

    </main>
  );
}
