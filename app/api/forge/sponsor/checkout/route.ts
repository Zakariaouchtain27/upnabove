import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { tier, challengeData } = await req.json();

    // Map the tiers to specific pricing
    // Standard sponsored $29, Premium sponsored $69, Enterprise $99
    let priceCents = 2900;
    
    if (tier === 'premium') priceCents = 6900;
    else if (tier === 'enterprise') priceCents = 9900;
    else if (tier === 'standard') priceCents = 2900;

    // In a real implementation:
    // 1. We would initiate a Lemon Squeezy/Stripe checkout session here passing priceCents.
    // 2. We'd map challengeData as metadata so the webhook knows what to UPDATE in Supabase.
    // 3. We return the `checkoutUrl`.
    
    // For this prototype, we simulate a successful 1.5 second API call 
    // and mock a redirect to the employer dashboard with a success param.
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Notice we just pass the challenge data back to the frontend to complete the 
    // insertion locally since the webhook isn't configured, but we pretend it is.
    
    return NextResponse.json({
      checkoutUrl: `/employer/forge?session=success&tier=${tier}`,
      isMockCheckout: true
    });

  } catch (error: any) {
    console.error("[Forge Sponsor Checkout API Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
