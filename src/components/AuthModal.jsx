
import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  X,
  Mail,
  Lock,
  User,
  GraduationCap,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  Info,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react'

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login',
}) {
  const [mode, setMode] = useState(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [department, setDepartment] = useState(
    'Computer Science & Engineering'
  )

  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isConfirmationPending, setIsConfirmationPending] =
    useState(false)

  const { login, signup, isConfigured } = useAuth()

  if (!isOpen) return null

  const resetForm = () => {
    setErrorMsg('')
    setSuccessMsg('')
    setIsConfirmationPending(false)
  }

  const switchMode = (newMode) => {
    resetForm()
    setMode(newMode)
  }

  const validate = () => {
    if (!email.trim()) {
      setErrorMsg('Please enter your university or personal email.')
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!emailRegex.test(email.trim())) {
      setErrorMsg(
        'Please enter a valid email address (e.g. student@campus.edu).'
      )
      return false
    }

    if (!password) {
      setErrorMsg('Please enter a password.')
      return false
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.')
      return false
    }

    if (mode === 'signup') {
      if (!fullName.trim()) {
        setErrorMsg('Please enter your full name.')
        return false
      }

      if (!department.trim()) {
        setErrorMsg('Please select or specify your department.')
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (isLoading) return

    setErrorMsg('')
    setSuccessMsg('')
    setIsConfirmationPending(false)

    if (!isConfigured) {
      setErrorMsg(
        'Supabase is not configured yet. Please configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local to enable live authentication.'
      )
      return
    }

    if (!validate()) return

    setIsLoading(true)

    try {
      if (mode === 'signup') {
        const data = await signup({
          email: email.trim(),
          password,
          fullName: fullName.trim(),
          department,
        })

        if (
          data?.user?.identities &&
          data.user.identities.length === 0
        ) {
          setErrorMsg(
            'An account with this email address already exists. Please sign in instead.'
          )
          return
        }

        if (data?.user && !data?.session) {
          setIsConfirmationPending(true)

          setSuccessMsg(
            'Account created! A confirmation email has been sent. Please check your inbox and spam folder to activate your account before logging in.'
          )
        } else if (data?.user && data?.session) {
          setSuccessMsg(
            'Account created successfully! Welcome to CampusShare.'
          )

          setTimeout(() => {
            onClose()
            resetForm()
          }, 1200)
        } else {
          setErrorMsg(
            'Unable to complete signup. Please verify your details and try again.'
          )
        }
      } else {
        await login({
          email: email.trim(),
          password,
        })

        setSuccessMsg('Signed in successfully!')

        setTimeout(() => {
          onClose()
          resetForm()
        }, 800)
      }
    } catch (err) {
      console.error('[AuthModal] Auth error:', err)

      const message =
        err?.message || 'An error occurred during authentication.'

      const lowerMessage = message.toLowerCase()

      const isRateLimit =
        err?.status === 429 ||
        err?.statusCode === 429 ||
        lowerMessage.includes('rate limit exceeded') ||
        lowerMessage.includes('email rate limit') ||
        lowerMessage.includes('rate limit') ||
        lowerMessage.includes('over_email_send_rate_limit') ||
        lowerMessage.includes('too many requests') ||
        lowerMessage.includes(
          'for security purposes, you can only request this once'
        ) ||
        (err?.code &&
          String(err.code)
            .toLowerCase()
            .includes('over_email_send_rate_limit'))

      if (isRateLimit) {
        setErrorMsg(
          'Too many confirmation emails have been requested. Please wait before trying again.'
        )
      } else if (
        lowerMessage.includes('invalid login credentials')
      ) {
        setErrorMsg(
          'Invalid email or password. Please double-check and try again.'
        )
      } else if (lowerMessage.includes('already registered')) {
        setErrorMsg(
          'This email is already registered. Please log in instead.'
        )
      } else if (lowerMessage.includes('email not confirmed')) {
        setErrorMsg(
          'Your email address has not been confirmed yet. Please verify your email using the confirmation link sent by Supabase.'
        )
      } else {
        setErrorMsg(message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const popularDepartments = [
    'Computer Science & Engineering',
    'Electrical & Electronics',
    'Mechanical Engineering',
    'Design & Architecture',
    'Media, Film & Mass Comm',
    'Biotechnology & Life Sciences',
    'Physics & Applied Sciences',
    'Business & Management',
    'Other / Interdisciplinary',
  ]

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-600/10 disabled:cursor-not-allowed disabled:opacity-60'

  const labelClass =
    'mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
        className="relative my-auto w-full max-w-md overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl shadow-slate-950/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Brand accent */}
        <div className="h-1.5 bg-gradient-to-r from-slate-900 via-teal-600 to-teal-400" />

        {/* Header */}
        <div className="relative overflow-hidden bg-slate-900 px-6 pb-7 pt-7 text-white sm:px-8">
          <div className="pointer-events-none absolute -right-12 -top-14 h-48 w-48 rounded-full bg-teal-500/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 left-10 h-36 w-36 rounded-full bg-teal-400/10 blur-2xl" />

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="absolute right-4 top-4 z-10 rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close authentication modal"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-teal-400/20 bg-teal-400/10 text-teal-300 shadow-lg shadow-black/10">
              <Sparkles className="h-7 w-7" />
            </div>

            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold tracking-wide text-slate-300">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-300" />
              Campus resource sharing
            </div>

            <h2
              id="auth-modal-title"
              className="text-2xl font-bold tracking-tight sm:text-3xl"
            >
              {mode === 'login'
                ? 'Welcome back'
                : 'Join CampusShare'}
            </h2>

            <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-300">
              {mode === 'login'
                ? 'Sign in to request equipment, book labs, and reserve campus spaces.'
                : 'Create your account to discover and share university resources.'}
            </p>
          </div>
        </div>

        <div className="max-h-[calc(100dvh-13rem)] overflow-y-auto px-5 py-6 sm:px-8 sm:py-7">
          {/* Login and signup tabs */}
          <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => switchMode('login')}
              disabled={isLoading}
              className={`rounded-lg px-3 py-2.5 text-sm font-bold transition ${
                mode === 'login'
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/70'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Sign in
            </button>

            <button
              type="button"
              onClick={() => switchMode('signup')}
              disabled={isLoading}
              className={`rounded-lg px-3 py-2.5 text-sm font-bold transition ${
                mode === 'signup'
                  ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/70'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Create account
            </button>
          </div>

          {/* Supabase setup notice */}
          {!isConfigured && (
            <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

              <div className="min-w-0 leading-relaxed">
                <p className="font-bold">Authentication setup required</p>
                <p className="mt-1 text-xs">
                  Configure your Supabase URL and publishable key in{' '}
                  <code className="rounded bg-amber-100 px-1 py-0.5 font-mono">
                    .env.local
                  </code>{' '}
                  to enable authentication.
                </p>
              </div>
            </div>
          )}

          {/* Error message */}
          {errorMsg && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              <p className="leading-relaxed">{errorMsg}</p>
            </div>
          )}

          {/* Success message */}
          {successMsg && (
            <div
              role="status"
              className="mb-4 flex items-start gap-3 rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm text-teal-900"
            >
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-700" />
              <p className="leading-relaxed">{successMsg}</p>
            </div>
          )}

          {/* Authentication form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label htmlFor="auth-full-name" className={labelClass}>
                    Full name
                  </label>

                  <div className="relative">
                    <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-teal-700" />

                    <input
                      id="auth-full-name"
                      type="text"
                      autoComplete="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                      disabled={isLoading || isConfirmationPending}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="auth-department" className={labelClass}>
                    Department / faculty
                  </label>

                  <div className="relative">
                    <GraduationCap className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-teal-700" />

                    <select
                      id="auth-department"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      disabled={isLoading || isConfirmationPending}
                      className={inputClass}
                    >
                      {popularDepartments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="auth-email" className={labelClass}>
                Email address
              </label>

              <div className="relative">
                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-teal-700" />

                <input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@campus.edu"
                  disabled={isLoading || isConfirmationPending}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <label htmlFor="auth-password" className={labelClass + ' mb-0'}>
                  Password
                </label>

                {mode === 'signup' && (
                  <span className="text-[11px] font-medium text-slate-400">
                    At least 6 characters
                  </span>
                )}
              </div>

              <div className="relative">
                <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-teal-700" />

                <input
                  id="auth-password"
                  type="password"
                  autoComplete={
                    mode === 'login' ? 'current-password' : 'new-password'
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={isLoading || isConfirmationPending}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading || isConfirmationPending}
              className="mt-2 flex w-full items-center justify-center gap-2.5 rounded-xl bg-teal-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-700/15 transition hover:-translate-y-0.5 hover:bg-teal-800 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-teal-600/20 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {mode === 'login'
                    ? 'Signing in...'
                    : 'Creating account...'}
                </>
              ) : isConfirmationPending ? (
                <>
                  <Mail className="h-4 w-4" />
                  Confirmation email sent
                </>
              ) : (
                <>
                  {mode === 'login' ? 'Sign in to CampusShare' : 'Create account'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Email confirmation guidance */}
          {isConfirmationPending && (
            <div className="mt-5 rounded-2xl border border-teal-200 bg-teal-50 p-4">
              <div className="flex items-center gap-2 text-sm font-bold text-teal-900">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-teal-700" />
                Verify your email
              </div>

              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                We sent a verification link to{' '}
                <strong className="break-all text-slate-900">{email}</strong>.
                Open that email and follow the link before signing in.
              </p>

              <button
                type="button"
                onClick={() => switchMode('login')}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-600/20"
              >
                Go to sign in
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 border-t border-slate-100 pt-5 text-center">
            <p className="text-sm text-slate-500">
              {mode === 'login'
                ? "Don't have an account yet?"
                : 'Already registered?'}{' '}
              <button
                type="button"
                onClick={() =>
                  switchMode(mode === 'login' ? 'signup' : 'login')
                }
                disabled={isLoading}
                className="font-bold text-teal-700 underline decoration-teal-300 underline-offset-4 transition hover:text-teal-900 disabled:opacity-50"
              >
                {mode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>

            <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="h-4 w-4 text-teal-700" />
              <span>CampusShare account authentication</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
