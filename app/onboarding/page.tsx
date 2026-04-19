"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowUpRight, User, Briefcase, Loader2 } from 'lucide-react'

export default function OnboardingPage() {
  const [loading, setLoading] = useState(true)
  const [savingRole, setSavingRole] = useState<'candidate' | 'employer' | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string>('')
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      console.log('[Onboarding] Checking user session...')
      
      // Use getUser() instead of getSession() — more reliable with SSR
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('[Onboarding] Auth error:', userError)
        setDebugInfo(`Auth error: ${userError.message}`)
      }
      
      if (!user) {
        console.log('[Onboarding] No user found, redirecting to login')
        setDebugInfo('No user found — redirecting to login')
        router.push('/login')
        return
      }

      console.log('[Onboarding] User found:', user.id, user.email)
      setUserId(user.id)
      setDebugInfo(`User: ${user.email} (${user.id})`)

      // Check if they already have a role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.log('[Onboarding] Profile query error (this is OK if profile does not exist yet):', profileError.message)
        // This is fine — profile may not exist yet, user needs to pick a role
      }

      if (profile?.role) {
        console.log('[Onboarding] User already has role:', profile.role, '— redirecting')
        router.push(profile.role === 'employer' ? '/employer' : '/dashboard')
        return
      }

      console.log('[Onboarding] No role set — showing role selection')
      setLoading(false)
    }

    checkUser()
  }, [])

  const handleSelectRole = async (role: 'candidate' | 'employer') => {
    console.log('[Onboarding] handleSelectRole called with:', role)
    console.log('[Onboarding] Current userId:', userId)
    
    if (!userId) {
      console.error('[Onboarding] userId is null! Cannot save role.')
      setErrorMsg('User session not found. Please try logging in again.')
      return
    }
    
    setSavingRole(role)
    setErrorMsg(null)

    console.log('[Onboarding] Upserting profile...', { id: userId, role })

    // Try upsert first
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: userId, role }, { onConflict: 'id' })
      .select()

    console.log('[Onboarding] Upsert result:', { data, error })

    if (error) {
      console.error('[Onboarding] Upsert failed:', error)
      
      // If upsert fails, try insert as fallback
      console.log('[Onboarding] Trying insert as fallback...')
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({ id: userId, role })

      if (insertError) {
        console.error('[Onboarding] Insert also failed:', insertError)
        
        // If insert also fails, try update as last resort
        console.log('[Onboarding] Trying update as last resort...')
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ role })
          .eq('id', userId)

        if (updateError) {
          console.error('[Onboarding] Update also failed:', updateError)
          setErrorMsg(`Failed to save role: ${updateError.message}. Please ensure the profiles table exists in Supabase with a 'role' column.`)
          setSavingRole(null)
          return
        }
      }
    }

    console.log('[Onboarding] Role saved successfully! Redirecting to:', role === 'employer' ? '/employer' : '/dashboard')
    
    // Small delay to ensure DB write completes before middleware checks
    await new Promise(resolve => setTimeout(resolve, 500))
    
    router.refresh()
    router.push(role === 'employer' ? '/employer' : '/dashboard')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#1B365D]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        {debugInfo && (
          <p className="mt-4 text-xs text-gray-500 font-mono">{debugInfo}</p>
        )}
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
        
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm text-center max-w-md mx-auto">
            {errorMsg}
          </div>
        )}

        <h1 className="text-3xl font-bold text-center text-white mb-2">Welcome aboard!</h1>
        <p className="text-center text-gray-300">How do you plan to use UpNAbove?</p>
        
        {/* Debug info - shows user ID to confirm session is active */}
        {debugInfo && (
          <p className="text-center text-[10px] text-gray-600 mt-2 font-mono">{debugInfo}</p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-3xl z-10">
        
        {/* Candidate Option */}
        <button 
          onClick={() => handleSelectRole('candidate')}
          disabled={savingRole !== null}
          className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-primary/50 transition-all rounded-3xl p-8 flex flex-col items-center text-center group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            {savingRole === 'candidate' ? <Loader2 className="w-8 h-8 text-primary-light animate-spin" /> : <User className="w-8 h-8 text-primary-light" />}
          </div>
          <h3 className="text-xl font-bold text-white mb-2">I am a Candidate</h3>
          <p className="text-sm text-gray-400">I want to find a job, join The Forge, and level up my skills.</p>
        </button>

        {/* Employer Option */}
        <button 
          onClick={() => handleSelectRole('employer')}
          disabled={savingRole !== null}
          className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#FF6F61]/50 transition-all rounded-3xl p-8 flex flex-col items-center text-center group relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[#FF6F61]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-16 h-16 rounded-2xl bg-[#FF6F61]/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            {savingRole === 'employer' ? <Loader2 className="w-8 h-8 text-[#FF6F61] animate-spin" /> : <Briefcase className="w-8 h-8 text-[#FF6F61]" />}
          </div>
          <h3 className="text-xl font-bold text-white mb-2">I am an Employer</h3>
          <p className="text-sm text-gray-400">I want to hire top talent, post jobs, and sponsor challenges.</p>
        </button>

      </div>
    </div>
  )
}
