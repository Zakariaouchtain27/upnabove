import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Check if any challenges have status 'live'
    const { count, error } = await supabase
      .from("forge_challenges")
      .select("id", { count: "exact", head: true })
      .eq("status", "live");

    if (error) {
      return NextResponse.json({ isLive: false }, { status: 500 });
    }

    return NextResponse.json({ isLive: (count && count > 0) ? true : false });
  } catch (error) {
    return NextResponse.json({ isLive: false }, { status: 500 });
  }
}
