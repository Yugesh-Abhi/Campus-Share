import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

const AuthContext = createContext({
  user: null,
  profile: null,
  session: null,
  loading: true,
  isConfigured: false,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  refreshProfile: async () => {},
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  /**
   * Safely fetches or initializes the user profile from the database.
   * Security enforcement:
   * 1. Authorization is based SOLELY on the server-persisted profile.role.
   * 2. If a profile doesn't exist yet, we only ever allow inserting role = 'student'.
   * 3. Users can NEVER self-assign 'staff', 'lab_manager', or 'admin'.
   */
  const fetchUserProfile = useCallback(async (authUser) => {
    if (!supabase || !authUser?.id) {
      setProfile(null)
      return null
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle()

      if (error && error.code !== 'PGRST116') {
        console.error('[AuthContext] Error fetching profile:', error.message)
      }

      if (data) {
        setProfile(data)
        return data
      }

      // If no profile exists yet (e.g. Supabase trigger not configured),
      // create a baseline profile safely. Role is HARDCODED to 'student'.
      
const defaultProfile = {
  id: authUser.id,
  full_name: authUser.user_metadata?.full_name || 'Campus Member',
  department: authUser.user_metadata?.department || 'Undeclared',
  role: 'student',
}


      const { data: inserted, error: insertError } = await supabase
        .from('profiles')
        .insert([defaultProfile])
        .select()
        .maybeSingle()

      if (insertError) {
        console.warn(
          '[AuthContext] Note: Could not auto-insert profile into profiles table (check RLS policies or database triggers):',
          insertError.message
        )
        // Fallback to local representation with baseline student role
        setProfile(defaultProfile)
        return defaultProfile
      }

      setProfile(inserted || defaultProfile)
      return inserted || defaultProfile
    } catch (err) {
      console.error('[AuthContext] Unexpected error resolving profile:', err)
      return null
    }
  }, [])

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false)
      return
    }

    let isMounted = true

    // 1. Check active session on initial load
    supabase.auth.getSession().then(({ data: { session: initialSession }, error }) => {
      if (!isMounted) return
      if (error) {
        console.error('[AuthContext] getSession error:', error.message)
      }
      setSession(initialSession)
      setUser(initialSession?.user ?? null)
      if (initialSession?.user) {
        fetchUserProfile(initialSession.user).finally(() => {
          if (isMounted) setLoading(false)
        })
      } else {
        setLoading(false)
      }
    })

    // 2. Listen for auth state changes (SIGN_IN, SIGN_OUT, TOKEN_REFRESHED, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return

      setSession(newSession)
      setUser(newSession?.user ?? null)

      if (newSession?.user) {
        await fetchUserProfile(newSession.user)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [fetchUserProfile])

  /**
   * User Signup
   * Stores user metadata safely. Passwords are handled strictly by Supabase Auth (bcrypt/argon2 on auth server).
   * Note: Single attempt without automated retries to prevent triggering Supabase email rate limits.
   */
  const signup = async ({ email, password, fullName, department }) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error(
        'Supabase is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local'
      )
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          department: department.trim(),
          // Explicitly omit role here so clients cannot define privileged roles
        },
      },
    })

    if (error) throw error

    // Only query/initialize profile if an active authenticated session was returned immediately
    if (data?.session && data?.user) {
      await fetchUserProfile(data.user)
    }

    return data
  }

  /**
   * User Login
   */
  const login = async ({ email, password }) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error(
        'Supabase is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local'
      )
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (error) throw error

    if (data?.user) {
      await fetchUserProfile(data.user)
    }

    return data
  }

  /**
   * User Logout
   */
  const logout = async () => {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('[AuthContext] SignOut error:', error.message)
      throw error
    }
    setUser(null)
    setProfile(null)
    setSession(null)
  }

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user)
    }
  }

  const value = {
    user,
    profile,
    session,
    loading,
    isConfigured: isSupabaseConfigured,
    signup,
    login,
    logout,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
