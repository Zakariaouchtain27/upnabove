"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2, ArrowLeft, Flame, Trophy, Zap } from "lucide-react";

const brandHighlights = [
  { icon: Flame,  color: "text-violet-400", label: "The Forge Arena",     sub: "Compete anonymously in live coding challenges" },
  { icon: Trophy, color: "text-amber-400",  label: "Rise the leaderboard", sub: "Community votes decide who gets hired" },
  { icon: Zap,    color: "text-emerald-400", label: "One-click apply",     sub: "Apply to thousands of tech roles instantly" },
];

export default function LoginPage() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const router = useRouter();
  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null;

  const signupSuccess = searchParams?.get("signup") === "success";
  const authError     = searchParams?.get("error");
  const nextPath      = searchParams?.get("next") ?? null;
  const supabase      = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        setError("Your email isn't confirmed yet. Check your inbox.");
      } else if (error.message.includes("Invalid login credentials")) {
        setError("Incorrect email or password.");
      } else {
        setError(error.message);
      }
      setLoading(false);
      return;
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      let destination: string;
      if (nextPath)                         destination = nextPath;
      else if (!profile?.role)              destination = "/onboarding";
      else if (profile.role === "employer") destination = "/employer";
      else                                  destination = "/dashboard";

      window.location.href = destination;
    }
  };

  const handleGoogleLogin = async () => {
    const next = nextPath ?? "/dashboard";
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  };

  return (
    <div className="min-h-screen flex">

      {/* Left panel — brand story (hidden on mobile) */}
      <div className="hidden lg:flex flex-col w-[440px] shrink-0 border-r border-white/[0.05] px-12 py-16 bg-zinc-950/60">
        <Link href="/" className="flex items-center gap-2 group mb-16">
          <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center group-hover:bg-violet-500 transition-colors">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 12L7 2L12 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 8.5H10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="text-sm font-black text-zinc-100 tracking-tight">
            up<span className="text-violet-400">N</span>above
          </span>
        </Link>

        <div className="flex-1">
          <h2 className="text-3xl font-bold text-white leading-tight tracking-tight mb-3">
            The job board
            <br />
            <span className="text-zinc-500">built different.</span>
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed font-light mb-12">
            Proof-first hiring. Your resume is optional — your code isn&apos;t.
          </p>

          <div className="space-y-6">
            {brandHighlights.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg border border-zinc-800 bg-zinc-900/60 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-300">{item.label}</p>
                    <p className="text-xs text-zinc-600 font-light mt-0.5 leading-relaxed">{item.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-zinc-800 font-light">
          © {new Date().getFullYear()} upNabove
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-[360px]">

          {/* Mobile logo */}
          <div className="lg:hidden mb-10 text-center">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center group-hover:bg-violet-500 transition-colors">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 12L7 2L12 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 8.5H10" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-sm font-black text-zinc-100 tracking-tight">
                up<span className="text-violet-400">N</span>above
              </span>
            </Link>
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight mb-1.5">
            Welcome back
          </h1>
          <p className="text-sm text-zinc-500 font-light mb-8">
            Sign in to your account
          </p>

          {signupSuccess && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-500/20 text-emerald-400 text-sm">
              Account created — check your inbox to confirm.
            </div>
          )}

          {(error || (authError && !error)) && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/50 border border-red-500/20 text-red-400 text-sm">
              {error ?? "Authentication failed. Please try again."}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 focus:bg-zinc-800/80 transition-all duration-150"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-zinc-400">Password</label>
                <Link href="/forgot-password" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 focus:bg-zinc-800/80 transition-all duration-150"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-100 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign in"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-xs text-zinc-600">or</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full py-3 rounded-xl border border-zinc-800 bg-zinc-900/60 text-zinc-200 text-sm font-medium hover:bg-zinc-800/80 hover:border-zinc-700 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2.5"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="mt-7 text-center text-sm text-zinc-600 font-light">
            No account?{" "}
            <Link href="/signup" className="text-zinc-300 hover:text-white transition-colors font-medium">
              Sign up free
            </Link>
          </p>

          <Link href="/" className="mt-6 flex items-center justify-center gap-1.5 text-xs text-zinc-700 hover:text-zinc-500 transition-colors">
            <ArrowLeft className="w-3 h-3" /> Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
