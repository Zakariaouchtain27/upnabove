import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://upnabove.work";

export const revalidate = 3600; // regenerate at most once per hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // Use service role if available for complete coverage, fall back to anon
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // ── Jobs ──────────────────────────────────────────────────────────────────
  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, updated_at, created_at")
    .eq("is_active", true)
    .is("deleted_at", null)
    .order("updated_at", { ascending: false })
    .limit(5000);

  const jobUrls: MetadataRoute.Sitemap = (jobs ?? []).map((job) => ({
    url: `${BASE_URL}/jobs/${job.id}`,
    lastModified: new Date(job.updated_at ?? job.created_at ?? Date.now()),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // ── Forge Challenges ──────────────────────────────────────────────────────
  const { data: challenges } = await supabase
    .from("forge_challenges")
    .select("id, created_at, expires_at, status")
    .eq("is_public", true)
    .is("deleted_at", null)
    .in("status", ["live", "scheduled", "completed"])
    .order("created_at", { ascending: false })
    .limit(1000);

  const challengeUrls: MetadataRoute.Sitemap = (challenges ?? []).map((c) => ({
    url: `${BASE_URL}/forge/${c.id}`,
    lastModified: new Date(c.expires_at ?? c.created_at ?? Date.now()),
    changeFrequency: c.status === "live" ? ("hourly" as const) : ("monthly" as const),
    priority: c.status === "live" ? 0.9 : 0.6,
  }));

  // ── Static Pages ──────────────────────────────────────────────────────────
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/jobs`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.95,
    },
    {
      url: `${BASE_URL}/forge`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${BASE_URL}/forge/leaderboard`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/auth`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  return [...staticPages, ...jobUrls, ...challengeUrls];
}
