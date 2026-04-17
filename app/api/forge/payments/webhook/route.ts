import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-signature") || "";
    
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;

    // Verify HMAC signature securely
    if (secret) {
        const hmac = crypto.createHmac("sha256", secret);
        const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
        const signatureBuffer = Buffer.from(signature, "utf8");
        
        if (!crypto.timingSafeEqual(digest, signatureBuffer)) {
            return new Response("Invalid signature", { status: 401 });
        }
    } else {
        console.warn("[Lemon Squeezy] No webhook secret defined. Bypassing signature validation for dev sandbox.");
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.meta.event_name;
    const customData = payload.meta.custom_data || {};
    const obj = payload.data.attributes;

    const supabase = await createClient(); // service role context inside webhooks

    if (eventName === "order_created") {
        // One-time payments (Challenge Postings)
        if (customData.challenge_id) {
            await supabase.from('forge_challenges').update({
                payment_status: 'paid',
                status: 'scheduled',
                ls_order_id: payload.data.id
            }).eq('id', customData.challenge_id);
            
            // Increment employer count if it's not their first (first was free)
            // Or log revenue if needed.
        }
    } 
    else if (eventName === "subscription_created" || eventName === "subscription_renewed" || eventName === "subscription_updated") {
        const status = obj.status; // 'active', 'past_due', 'unpaid', 'cancelled', 'expired'
        
        if (customData.subscription_type === 'forge_replay' && customData.candidate_id) {
            await supabase.from('candidates').update({
                ls_subscription_id: payload.data.id,
                ls_subscription_status: status,
                forge_replay_active: status === 'active' || status === 'on_trial'
            }).eq('id', customData.candidate_id);
        }
    }
    else if (eventName === "subscription_cancelled" || eventName === "subscription_expired") {
        if (customData.subscription_type === 'forge_replay' && customData.candidate_id) {
            await supabase.from('candidates').update({
                ls_subscription_status: 'cancelled',
                forge_replay_active: false
            }).eq('id', customData.candidate_id);
        }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
