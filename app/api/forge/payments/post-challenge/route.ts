import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const TIER_VARIANTS: Record<string, string> = {
  forge_standard: process.env.LS_VAR_STANDARD || 'v_mock_standard',
  forge_featured: process.env.LS_VAR_FEATURED || 'v_mock_featured',
  forge_sponsored: process.env.LS_VAR_SPONSORED || 'v_mock_sponsored',
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // In a strict prod environment, reject unauthenticated
    // if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const reqBody = await request.json();
    const { challengeId, tier = 'forge_standard' } = reqBody;

    if (!challengeId) return NextResponse.json({ error: "Missing challengeId" }, { status: 400 });

    const employerId = user?.id || 'mock-employer-id'; // Fallback for testing

    // Retrieve employer's challenge post count specifically
    const { data: employer } = await supabase.from('employers').select('challenges_posted').eq('id', employerId).single();
    
    // Auto-promote if it's their very first challenge
    if (employer && (employer.challenges_posted === 0 || employer.challenges_posted === null)) {
       // Promote natively
       await supabase.from('forge_challenges').update({ 
           payment_status: 'free', 
           status: 'scheduled' 
       }).eq('id', challengeId);
       
       // Increment counter
       await supabase.from('employers').update({
           challenges_posted: (employer.challenges_posted || 0) + 1
       }).eq('id', employerId);

       return NextResponse.json({ isFree: true, success: true });
    }

    const lsKey = process.env.LEMON_SQUEEZY_API_KEY;
    const storeId = process.env.LEMON_SQUEEZY_STORE_ID;

    // Failover: Sandbox/Local Environment bypass
    if (!lsKey || !storeId || TIER_VARIANTS[tier].includes('mock')) {
       console.log("[Lemon Squeezy] Missing API keys. Returning mock checkout URL.");
       return NextResponse.json({
          isFree: false,
          checkoutUrl: `https://upnabove.work/payment-sandbox?type=challenge&tier=${tier}&cId=${challengeId}`
       });
    }

    // Official Lemon Squeezy integration
    const variantId = TIER_VARIANTS[tier];

    const lsPayload = {
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            custom: {
              challenge_id: challengeId,
              employer_id: employerId,
              tier: tier
            }
          }
        },
        relationships: {
          store: { data: { type: "stores", id: storeId } },
          variant: { data: { type: "variants", id: variantId } }
        }
      }
    };

    const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
       method: "POST",
       headers: {
         "Accept": "application/vnd.api+json",
         "Content-Type": "application/vnd.api+json",
         "Authorization": `Bearer ${lsKey}`
       },
       body: JSON.stringify(lsPayload)
    });

    if (!response.ok) {
       const text = await response.text();
       console.error("LS Error:", text);
       return NextResponse.json({ error: "Failed to securely generate checkout session." }, { status: 500 });
    }

    const json = await response.json();
    return NextResponse.json({
       isFree: false,
       checkoutUrl: json.data.attributes.url
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
