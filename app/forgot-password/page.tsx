"use client"

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowUpRight, Loader2, ArrowLeft } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const supabase = createClient()

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Password reset instructions have been sent to your email.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1B365D] relative overflow-hidden px-4">
      {/* Background aesthetics */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="w-full max-w-md bg-[#1B365D]/50 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-10">
        <Link href="/login" className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to login
        </Link>
        
        <h2 className="text-2xl font-bold text-white mb-2">Reset Password</h2>
        <p className="text-muted mb-8 text-sm">Enter your email address and we'll send you a link to reset your password.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleResetRequest} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="you@example.com"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-primary to-violet-500 hover:from-primary hover:to-violet-400 text-white font-medium rounded-xl transition-all shadow-[0_0_15px_rgba(124,58,237,0.4)] flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Reset Link'}
          </button>
        </form>
      </div>
    </div>
  )
}
