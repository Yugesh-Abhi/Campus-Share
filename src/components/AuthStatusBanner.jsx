
import React from 'react'
import { useAuth } from '../context/AuthContext'
import {
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  KeyRound,
  Info,
  ExternalLink,
  LogOut,
  CircleCheck,
} from 'lucide-react'

export default function AuthStatusBanner({ onOpenAuth }) {
  const { user, profile, isConfigured, loading, logout } = useAuth()

  if (loading) return null

  // Supabase is not configured
  if (!isConfigured) {
    return (
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-3">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <ShieldAlert className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900">
                Authentication setup required
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-600 sm:text-sm">
                Configure your Supabase environment variables in{' '}
                <code className="rounded-md border border-amber-200 bg-white px-1.5 py-0.5 font-mono text-xs font-semibold text-slate-800">
                  .env.local
                </code>{' '}
                to enable live authentication.
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                <code className="rounded-md bg-amber-100 px-2 py-1 text-[11px] font-medium text-amber-900">
                  VITE_SUPABASE_URL
                </code>
                <code className="rounded-md bg-amber-100 px-2 py-1 text-[11px] font-medium text-amber-900">
                  VITE_SUPABASE_PUBLISHABLE_KEY
                </code>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenAuth('login')}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
          >
            <KeyRound className="h-4 w-4" />
            Preview Auth Modal
          </button>
        </div>
      </div>
    )
  }

  // Authenticated user banner
  if (user) {
    const role = profile?.role || 'student'
    const department = profile?.department || 'General'

    return (
      <div className="border-b border-teal-100 bg-white px-4 py-3 shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-600" />
              </span>
              Session Active
            </div>

            <div className="flex min-w-0 items-center gap-2 text-sm text-slate-600">
              <UserCheck className="h-4 w-4 shrink-0 text-teal-700" />
              <span className="truncate font-medium text-slate-800">
                {user.email}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-700" />
                <span>Role:</span>
                <strong className="capitalize text-slate-900">{role}</strong>
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
                <CircleCheck className="h-3.5 w-3.5 text-teal-700" />
                <span>Department:</span>
                <strong className="text-slate-900">{department}</strong>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:self-center"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    )
  }

  return null
}
