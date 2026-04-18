"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowUpRight, Github, Loader2 } from 'lucide-react'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data.user && data.session) {
      router.push('/onboarding')
    } else {
      // If email confirmation is required:
      setError('Please check your email to confirm your account.')
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/onboarding`,
      },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1B365D] relative overflow-hidden px-4">
      {/* Background aesthetics */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="w-full max-w-md bg-[#1B365D]/50 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-10">
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-light to-primary flex items-center justify-center border border-white/20 shadow-[0_0_15px_rgba(124,58,237,0.4)]">
              <ArrowUpRight className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Up<span style={{ color: '#FF6F61' }}>N</span>Above</span>
          </Link>
        </div>

        <h2 className="text-2xl font-bold text-center text-white mb-2">Create an account</h2>
        <p className="text-center text-muted mb-8 text-sm">Join the next generation of hiring</p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-gray-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-gray-500"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-primary to-violet-500 hover:from-primary hover:to-violet-400 text-white font-medium rounded-xl transition-all shadow-[0_0_15px_rgba(124,58,237,0.4)] flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-center gap-3">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="text-xs text-gray-400 uppercase tracking-wider">OR</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        <div className="mt-6">
          <button 
            onClick={handleGoogleLogin}
            type="button"
            className="w-full py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-xl transition-all flex justify-center items-center gap-2"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 bg-white rounded-full p-0.5">
               <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
               <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
               <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
               <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
             </svg>
            Continue with Google
          </button>
        </div>

        <p className="mt-8 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link href="/login" className="text-[#FF6F61] hover:text-[#ffaa9e] font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
