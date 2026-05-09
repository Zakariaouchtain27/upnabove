"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-sm">

        <div className="text-center mb-10">
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

        <div className="bg-zinc-950/70 backdrop-blur-2xl border border-white/[0.07] rounded-2xl p-8 shadow-[0_32px_80px_rgba(0,0,0,0.6)]">

          <h1 className="text-xl font-bold text-white tracking-tight mb-1">
            Create account.
          </h1>
          <p className="text-sm text-zinc-500 font-light mb-7">
            Join the next generation of hiring
          </p>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/60 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-widest">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.06] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-widest">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.06] transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-100 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="text-[10px] text-zinc-600 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          <button
            onClick={handleGoogleLogin}
            type="button"
            className="w-full py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-zinc-200 text-sm font-medium hover:bg-white/[0.08] hover:border-white/[0.14] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="mt-6 text-center text-xs text-zinc-600 font-light">
            Already have an account?{" "}
            <Link href="/login" className="text-zinc-300 hover:text-white transition-colors font-normal">
              Sign in
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-[11px] text-zinc-700 font-light">
          By creating an account you agree to our{" "}
          <Link href="#" className="underline underline-offset-2 hover:text-zinc-500 transition-colors">Terms</Link>
          {" "}and{" "}
          <Link href="#" className="underline underline-offset-2 hover:text-zinc-500 transition-colors">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}