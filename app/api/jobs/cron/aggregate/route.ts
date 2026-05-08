import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { fetchRemotiveJobs } from "@/lib/adapters/jobs/remotive";
import { fetchHimalayasJobs } from "@/lib/adapters/jobs/himalayas";
import { fetchRapidApiJobs } from "@/lib/adapters/jobs/rapidapi";
import type { NormalizedJob } from "@/lib/types/jobs";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const adapters: Array<() => Promise<NormalizedJob[]>> = [
    () => fetchRemotiveJobs(100),
    () => fetchHimalayasJobs(20),
    () => fetchRapidApiJobs("software engineer"),
  ];

  const results = await Promise.allSettled(adapters.map((fn) => fn()));

  let inserted = 0;
  const errors: string[] = [];

  for (const result of results) {
    if (result.status === "rejected") {
      errors.push(String(result.reason));
      continue;
    }

    for (const job of result.value) {
      const { error } = await supabase.from("jobs").upsert(
        {
          external_id: job.external_id,
          title: job.title,
          description: job.description,
          company_name: job.company_name,
          location: job.location,
          job_type: job.job_type,
          salary_range: job.salary_range,
          external_apply_url: job.external_url,
          source: job.source,
          category: job.category ?? null,
          is_active: true,
        },
        { onConflict: "external_id" }
      );

      if (error) {
        errors.push(`[${job.source}] ${job.title}: ${error.message}`);
      } else {
        inserted++;
      }
    }
  }

  return NextResponse.json({
    success: true,
    inserted,
    errors: errors.length > 0 ? errors : undefined,
  });
}
