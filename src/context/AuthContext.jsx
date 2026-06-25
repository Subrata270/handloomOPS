import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { toast } from 'react-hot-toast'
import { AuthContext } from './AuthContextValue'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function loadSession() {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      setUser(data.session?.user ?? null)
      setLoading(false)
    }

    loadSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return
      setUser(session?.user ?? null)
      if (event === 'SIGNED_OUT') {
        toast.success('Logged out successfully')
      }
    })

    return () => {
      mounted = false
      authListener.subscription?.unsubscribe()
    }
  }, [])

  const login = async (email, password) => {
    setLoading(true)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (error) {
      toast.error(error.message)
      return null
    }

    setUser(data.user)
    toast.success('Welcome back!')
    return data
  }

  const logout = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signOut()
    setLoading(false)

    if (error) {
      toast.error(error.message)
      return false
    }

    setUser(null)
    return true
  }

  const value = useMemo(
    () => ({ user, loading, login, logout }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

