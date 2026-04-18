"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowUpRight, User, Briefcase, Loader2 } from 'lucide-react'

export default function OnboardingPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      setUserId(session.user.id)

      // Check if they already have a role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (profile?.role) {
        router.push(profile.role === 'employer' ? '/employer' : '/dashboard')
        return
      }

      setLoading(false)
    }

    checkUser()
  }, [])

  const handleSelectRole = async (role: 'candidate' | 'employer') => {
    if (!userId) return
    setSaving(true)

    const { error } = await supabase
      .from('profiles')
      .upsert({ id: userId, role })

    if (error) {
      console.error(error)
      setSaving(false)
      return
    }

    // Refresh router to update middleware/session
    router.refresh()
    router.push(role === 'employer' ? '/employer' : '/dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1B365D]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1B365D] relative overflow-hidden px-4">
      {/* Background aesthetics */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -right-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-1/4 -left-40 w-96 h-96 bg-[#FF6F61]/20 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="z-10 mb-12">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 group">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-light to-primary flex items-center justify-center border border-white/20 shadow-[0_0_15px_rgba(124,58,237,0.4)]">
              <ArrowUpRight className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">Up<span style={{ color: '#FF6F61' }}>N</span>Above</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-center text-white mb-2">Welcome aboard!</h1>
        <p className="text-center text-gray-300">How do you plan to use UpNAbove?</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-3xl z-10">
        
        {/* Candidate Option */}
        <button 
          onClick={() => handleSelectRole('candidate')}
          disabled={saving}
          className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/50 transition-all rounded-3xl p-8 flex flex-col items-center text-center group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <User className="w-8 h-8 text-primary-light" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">I am a Candidate</h3>
          <p className="text-sm text-gray-400">I want to find a job, join The Forge, and level up my skills.</p>
        </button>

        {/* Employer Option */}
        <button 
          onClick={() => handleSelectRole('employer')}
          disabled={saving}
          className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#FF6F61]/50 transition-all rounded-3xl p-8 flex flex-col items-center text-center group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#FF6F61]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-16 h-16 rounded-2xl bg-[#FF6F61]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Briefcase className="w-8 h-8 text-[#FF6F61]" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">I am an Employer</h3>
          <p className="text-sm text-gray-400">I want to hire top talent, post jobs, and sponsor challenges.</p>
        </button>

      </div>
    </div>
  )
}
