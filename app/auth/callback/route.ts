import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") ?? "/dashboard";

  // Derive origin reliably — request.nextUrl respects X-Forwarded-Proto on Vercel
  const origin = request.nextUrl.origin;

  // Validate `next` is a safe relative path to prevent open-redirect attacks
  const next =
    rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/dashboard";

  if (!code) {
    return NextResponse.redirect(new URL(`/login?error=missing_code`, origin));
  }

  // Build the redirect response before exchanging the code so we can
  // attach session cookies directly onto it before it is sent.
  const redirectResponse = NextResponse.redirect(new URL(next, origin));

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Cookies must be written onto the redirect response so the browser
          // receives them during the 302 hop — not on a subsequent request.
          cookiesToSet.forEach(({ name, value, options }) =>
            redirectResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("[Auth Callback] exchangeCodeForSession failed:", error.message);
    return NextResponse.redirect(new URL(`/login?error=auth`, origin));
  }

  return redirectResponse;
}
