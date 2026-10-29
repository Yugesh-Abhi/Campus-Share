import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * Validates that Supabase credentials have been configured via environment variables.
 * In development, helpful messages are provided if .env.local is missing.
 */
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabasePublishableKey &&
    supabaseUrl !== 'https://your-project-id.supabase.co' &&
    supabasePublishableKey !== 'your-supabase-publishable-or-anon-key'
)

if (!isSupabaseConfigured) {
  console.warn(
    '[CampusShare Auth] Supabase environment variables are missing or default.\n' +
    'Please create a .env.local file in the project root with:\n' +
    '  VITE_SUPABASE_URL=https://your-project-id.supabase.co\n' +
    '  VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-or-anon-key'
  )
}

/**
 * Reusable Supabase client instance.
 * Automatically persists session to localStorage and handles token refreshing.
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabasePublishableKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null
