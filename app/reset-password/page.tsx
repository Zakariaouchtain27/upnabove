"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.updateUser({
      password: password
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1B365D] relative overflow-hidden px-4">
      {/* Background aesthetics */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#FF6F61]/20 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="w-full max-w-md bg-[#1B365D]/50 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] z-10">
        
        <h2 className="text-2xl font-bold text-white mb-2">Create New Password</h2>
        <p className="text-muted mb-8 text-sm">Enter your new secure password below.</p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        {success ? (
          <div className="text-center">
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm">
              Password updated successfully!
            </div>
            <p className="text-gray-400 text-sm">Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">New Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#FF6F61]/50 transition-all"
                placeholder="••••••••"
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-2.5 bg-gradient-to-r from-[#FF6F61] to-rose-400 hover:from-[#FF6F61] hover:to-[#ff8175] text-white font-medium rounded-xl transition-all shadow-[0_0_15px_rgba(255,111,97,0.4)] flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
