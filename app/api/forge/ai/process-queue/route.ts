import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 min — processes up to 10 entries sequentially

const BATCH_SIZE = 10;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://upnabove.work";

export async function POST(request: NextRequest) {
  // Security: only callable via cron secret or service role
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}` && auth !== `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  // Re-prioritise: boost entries from challenges expiring soon
  // This is handled by the priority column set at submission time.
  // A DB trigger or CRON can further boost near-expiry entries separately.

  // 2. Grab the next batch (highest priority, oldest first, max 10)
  const { data: batch, error } = await supabase
    .from("forge_scoring_queue")
    .select("id, entry_id")
    .eq("status", "pending")
    .lt("attempts", 3)          // Skip permanent failures
    .order("priority", { ascending: false })
    .order("queued_at", { ascending: true })
    .limit(BATCH_SIZE);

  if (error || !batch || batch.length === 0) {
    return NextResponse.json({ processed: 0, message: "Queue empty or error." });
  }

  // 3. Mark them all as processing atomically before starting work
  const entryIds = batch.map(b => b.entry_id).filter(Boolean) as string[];
  await supabase
    .from("forge_scoring_queue")
    .update({ status: "processing", attempts: 99 }) // temporary sentinel
    .in("entry_id", entryIds);

  // Reset attempts properly per row
  for (const item of batch) {
    if (!item.entry_id) continue;
    await supabase
      .from("forge_scoring_queue")
      .update({ attempts: 1 })
      .eq("entry_id", item.entry_id);
  }

  // 4. Fire each scoring request sequentially (Claude latency ~3–8s per entry → ~80s max)
  const results: { entryId: string; ok: boolean; score?: number; error?: string }[] = [];

  for (const item of batch) {
    if (!item.entry_id) continue;
    try {
      const res = await fetch(`${BASE_URL}/api/forge/ai/score-entry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ entryId: item.entry_id }),
      });
      const data = await res.json();
      results.push({ entryId: item.entry_id, ok: res.ok, score: data.score });
    } catch (err: any) {
      results.push({ entryId: item.entry_id, ok: false, error: err.message });
    }
  }

  const succeeded = results.filter(r => r.ok).length;
  const failed    = results.filter(r => !r.ok).length;

  return NextResponse.json({
    processed: succeeded,
    failed,
    results,
    message: `Batch complete: ${succeeded} scored, ${failed} failed.`,
  });
}
