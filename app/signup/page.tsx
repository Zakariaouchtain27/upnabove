"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2, ArrowLeft, Check } from "lucide-react";

const perks = [
  "Track all your applications in one place",
  "Compete anonymously in coding challenges",
  "One-click apply with your saved resume",
  "Build a squad and climb the leaderboard",
];

export default function SignupPage() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const router   = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    if (data.user && data.session) {
      router.push("/onboarding");
    } else if (data.user) {
      router.push("/login?signup=success");
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    });
  };

  return (
    <div className="min-h-screen flex">

      {/* Left panel */}
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
            Join thousands of
            <br />
            <span className="text-zinc-500">engineers already inside.</span>
          </h2>
          <p className="text-sm text-zinc-600 leading-relaxed font-light mb-10">
            Free forever for candidates. No credit card required.
          </p>

          <ul className="space-y-4">
            {perks.map((perk) => (
              <li key={perk} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 text-violet-400" strokeWidth={2.5} />
                </div>
                <span className="text-sm text-zinc-400 font-light leading-relaxed">{perk}</span>
              </li>
            ))}
          </ul>

          {/* Social proof */}
          <div className="mt-12 pt-8 border-t border-zinc-800/60">
            <p className="text-xs text-zinc-600 font-light">
              Hiring arena for the next generation of engineers.
            </p>
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
            Create your account
          </h1>
          <p className="text-sm text-zinc-500 font-light mb-8">
            Free forever for candidates
          </p>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/50 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
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
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                minLength={8}
                className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 focus:bg-zinc-800/80 transition-all duration-150"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-100 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create account"}
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
            Already have an account?{" "}
            <Link href="/login" className="text-zinc-300 hover:text-white transition-colors font-medium">
              Sign in
            </Link>
          </p>

          <p className="mt-4 text-center text-[11px] text-zinc-700 font-light">
            By signing up you agree to our{" "}
            <Link href="#" className="underline underline-offset-2 hover:text-zinc-500 transition-colors">Terms</Link>
            {" "}and{" "}
            <Link href="#" className="underline underline-offset-2 hover:text-zinc-500 transition-colors">Privacy Policy</Link>.
          </p>

          <Link href="/" className="mt-5 flex items-center justify-center gap-1.5 text-xs text-zinc-700 hover:text-zinc-500 transition-colors">
            <ArrowLeft className="w-3 h-3" /> Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
