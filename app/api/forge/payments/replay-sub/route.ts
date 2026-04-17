import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const candidateId = user?.id || 'mock-candidate-id';

    const lsKey = process.env.LEMON_SQUEEZY_API_KEY;
    const storeId = process.env.LEMON_SQUEEZY_STORE_ID;
    const variantId = process.env.LS_VAR_REPLAY_SUB;

    // Failover for unconfigured environment
    if (!lsKey || !storeId || !variantId) {
       console.log("[Lemon Squeezy] Missing API keys or Variant ID for Replay Sub. Returning Sandbox.");
       return NextResponse.json({
          checkoutUrl: `https://upnabove.work/payment-sandbox?type=replay_sub&cId=${candidateId}`
       });
    }

    const lsPayload = {
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: {
            custom: {
              candidate_id: candidateId,
              subscription_type: 'forge_replay'
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
       return NextResponse.json({ error: "Failed to generate sub checkout session." }, { status: 500 });
    }

    const json = await response.json();
    return NextResponse.json({
       checkoutUrl: json.data.attributes.url
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
