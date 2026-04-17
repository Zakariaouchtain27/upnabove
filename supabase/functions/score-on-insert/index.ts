// supabase/functions/score-on-insert/index.ts
// Supabase Edge Function triggered on forge_entries INSERT
// Forwards the new entry to the Next.js AI scoring endpoint within 60 seconds

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req: Request) => {
  try {
    const payload = await req.json();

    // Supabase sends { type, table, record, ... } for DB webhooks
    if (payload.type !== "INSERT" || payload.table !== "forge_entries") {
      return new Response("Not a forge entry INSERT.", { status: 200 });
    }

    const entryId = payload.record?.id;
    if (!entryId) return new Response("No entry ID.", { status: 200 });

    const baseUrl = Deno.env.get("NEXT_PUBLIC_BASE_URL") || "https://upnabove.work";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    const res = await fetch(`${baseUrl}/api/forge/ai/score-entry`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${serviceKey}`,
      },
      body: JSON.stringify({ entryId }),
    });

    const data = await res.json();
    console.log(`[score-on-insert] Entry ${entryId} → Score: ${data.score ?? "error"}`);

    return new Response(JSON.stringify({ ok: true, score: data.score }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[score-on-insert] Error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
