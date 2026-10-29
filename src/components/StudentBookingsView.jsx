
import React, { useState, useEffect, useCallback } from 'react'
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
  PackageOpen,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  CalendarDays,
  ClipboardList,
  Hourglass,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

function getStatusMeta(status) {
  const value = (status || 'pending').toLowerCase()

  if (value === 'approved') {
    return {
      label: 'Approved',
      icon: CheckCircle2,
      className: 'border-teal-200 bg-teal-50 text-teal-800',
      iconClass: 'text-teal-700',
    }
  }

  if (value === 'rejected') {
    return {
      label: 'Rejected',
      icon: XCircle,
      className: 'border-red-200 bg-red-50 text-red-800',
      iconClass: 'text-red-600',
    }
  }

  if (value === 'completed' || value === 'returned') {
    return {
      label: 'Completed',
      icon: CheckCircle2,
      className: 'border-blue-200 bg-blue-50 text-blue-800',
      iconClass: 'text-blue-600',
    }
  }

  if (value === 'cancelled' || value === 'canceled') {
    return {
      label: 'Cancelled',
      icon: XCircle,
      className: 'border-slate-200 bg-slate-100 text-slate-700',
      iconClass: 'text-slate-500',
    }
  }

  return {
    label: 'Pending review',
    icon: Hourglass,
    className: 'border-amber-200 bg-amber-50 text-amber-800',
    iconClass: 'text-amber-600',
  }
}

function formatDateTimeRange(startIso, endIso) {
  if (!startIso || !endIso) return 'Schedule not available'

  const start = new Date(startIso)
  const end = new Date(endIso)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'Schedule not available'
  }

  const date = start.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const timeOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }

  return `${date} · ${start.toLocaleTimeString(undefined, timeOptions)} – ${end.toLocaleTimeString(undefined, timeOptions)}`
}

function formatRequestedDate(dateValue) {
  if (!dateValue) return 'Date unavailable'

  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) return 'Date unavailable'

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function SummaryCard({ title, value, description, icon: Icon, tone }) {
  const tones = {
    navy: 'bg-slate-100 text-slate-700',
    amber: 'bg-amber-50 text-amber-700',
    teal: 'bg-teal-50 text-teal-700',
    red: 'bg-red-50 text-red-700',
  }

  return (
    <div className="group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tones[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-xs font-medium text-slate-400">Overview</span>
      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-1 text-3xl font-extrabold tracking-tight text-slate-950">
        {value}
      </p>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  )
}

function BookingCard({ booking }) {
  const resource = booking.resources
  const title = resource?.title || 'Campus resource'
  const category = resource?.category || 'Resource'
  const location = resource?.location || 'Location not specified'
  const status = getStatusMeta(booking.status)
  const StatusIcon = status.icon
  const normalizedStatus = String(booking.status || 'pending').toLowerCase()
  const isRejected = normalizedStatus === 'rejected'

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:border-teal-200 hover:shadow-lg hover:shadow-slate-900/[0.04]">
      <div className="h-1 bg-gradient-to-r from-slate-900 via-teal-700 to-teal-400" />

      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                {category}
              </span>

              <span className="text-xs text-slate-400">
                Requested {formatRequestedDate(booking.created_at)}
              </span>
            </div>

            <h3 className="mt-3 break-words text-xl font-extrabold tracking-tight text-slate-950 transition-colors group-hover:text-teal-800 sm:text-2xl">
              {title}
            </h3>

            <div className="mt-2 flex items-start gap-2 text-sm text-slate-500">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
              <span>{location}</span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${status.className}`}
              >
                <StatusIcon className={`h-3.5 w-3.5 ${status.iconClass}`} />
                {status.label}
              </span>

              {resource?.requires_approval && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                  <ShieldCheck className="h-3.5 w-3.5 text-teal-700" />
                  Approval required
                </span>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 lg:w-80 lg:shrink-0">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <Calendar className="h-4 w-4 text-teal-700" />
              Requested time
            </div>

            <p className="mt-3 text-sm font-bold leading-6 text-slate-900">
              {formatDateTimeRange(booking.start_time, booking.end_time)}
            </p>

            <div className="mt-4 flex items-center gap-2 border-t border-slate-200 pt-3 text-xs text-slate-500">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>Reference</span>
              <span className="ml-auto rounded-md bg-white px-2 py-1 font-bold text-slate-700 ring-1 ring-slate-200">
                {String(booking.id).slice(0, 8)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {isRejected && (
        <div className="border-t border-red-100 bg-red-50/70 px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 ring-1 ring-red-100">
              <AlertCircle className="h-4 w-4" />
            </div>

            <div>
              <p className="text-sm font-bold text-red-900">
                Request declined
              </p>
              <p className="mt-1 break-words text-sm leading-6 text-red-800">
                {booking.rejection_reason ||
                  'The resource owner did not provide a specific reason.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </article>
  )
}

export default function StudentBookingsView({ onExploreCatalog }) {
  const { user } = useAuth()

  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [fetchError, setFetchError] = useState(null)

  const fetchMyBookings = useCallback(
    async (isManual = false) => {
      if (!user) {
        setBookings([])
        setIsLoading(false)
        setIsRefreshing(false)
        setFetchError(null)
        return
      }

      if (!isSupabaseConfigured || !supabase) {
        setFetchError(
          'Supabase is not configured. Check your environment variables.'
        )
        setIsLoading(false)
        setIsRefreshing(false)
        return
      }

      if (isManual) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      setFetchError(null)

      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(
            'id, resource_id, user_id, start_time, end_time, status, rejection_reason, created_at, resources(title, location, category, requires_approval)'
          )
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error

        setBookings(data || [])
      } catch (err) {
        console.error('[StudentBookingsView] Error fetching bookings:', err)
        setFetchError(err.message || 'Failed to fetch your booking requests.')
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [user]
  )

  useEffect(() => {
    fetchMyBookings()
  }, [fetchMyBookings])

  const counts = {
    total: bookings.length,
    pending: bookings.filter(
      (booking) => (booking.status || 'pending').toLowerCase() === 'pending'
    ).length,
    approved: bookings.filter(
      (booking) => (booking.status || '').toLowerCase() === 'approved'
    ).length,
    rejected: bookings.filter(
      (booking) => (booking.status || '').toLowerCase() === 'rejected'
    ).length,
  }

  return (
    <section className="min-h-[65vh] bg-slate-50 py-8 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-8 shadow-xl shadow-slate-900/10 sm:px-9 sm:py-10">
          <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full bg-teal-500/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 right-1/3 h-44 w-44 rounded-full bg-blue-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/25 bg-teal-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-teal-300">
                <ClipboardList className="h-3.5 w-3.5" />
                Student portal
              </div>

              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                My bookings<span className="text-teal-400">.</span>
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                All your campus resource requests, in one place. Keep track of
                approvals, schedules, and booking details.
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchMyBookings(true)}
              disabled={isLoading || isRefreshing}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:border-teal-400/50 hover:bg-teal-400/10 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              {isRefreshing ? 'Refreshing...' : 'Refresh bookings'}
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryCard
            title="Total requests"
            value={isLoading ? '—' : counts.total}
            description="All submitted requests"
            icon={CalendarDays}
            tone="navy"
          />

          <SummaryCard
            title="Pending"
            value={isLoading ? '—' : counts.pending}
            description="Awaiting a decision"
            icon={Hourglass}
            tone="amber"
          />

          <SummaryCard
            title="Approved"
            value={isLoading ? '—' : counts.approved}
            description="Approved requests"
            icon={CheckCircle2}
            tone="teal"
          />

          <SummaryCard
            title="Rejected"
            value={isLoading ? '—' : counts.rejected}
            description="Declined requests"
            icon={XCircle}
            tone="red"
          />
        </div>

        {/* Booking history heading */}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-teal-700">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
              Your activity
            </div>

            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950">
              Booking history
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Your latest requests appear first.
            </p>
          </div>

          {!isLoading && !fetchError && bookings.length > 0 && (
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm">
              <ClipboardList className="h-3.5 w-3.5 text-teal-700" />
              {bookings.length} {bookings.length === 1 ? 'request' : 'requests'}
            </span>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-4 text-sm text-slate-500">
              <RefreshCw className="h-4 w-4 animate-spin text-teal-700" />
              Loading your bookings...
            </div>

            {[1, 2].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
              >
                <div className="h-4 w-28 rounded bg-slate-200" />
                <div className="mt-4 h-6 w-2/3 rounded bg-slate-200" />
                <div className="mt-3 h-4 w-1/2 rounded bg-slate-100" />
                <div className="mt-6 h-20 rounded-xl bg-slate-100" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!isLoading && fetchError && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertTriangle className="h-7 w-7" />
            </div>

            <h3 className="mt-4 text-lg font-bold text-slate-950">
              We couldn't load your bookings
            </h3>

            <p className="mx-auto mt-2 max-w-lg break-words text-sm leading-6 text-slate-600">
              {fetchError}
            </p>

            <button
              type="button"
              onClick={() => fetchMyBookings(true)}
              disabled={isRefreshing}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-700 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              Try again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !fetchError && bookings.length === 0 && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="relative overflow-hidden bg-slate-950 px-6 py-10 text-center text-white sm:px-10 sm:py-12">
              <div className="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full bg-teal-500/15 blur-3xl" />

              <div className="relative">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-teal-300">
                  <PackageOpen className="h-8 w-8" />
                </div>

                <p className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-teal-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  Your next idea starts here
                </p>

                <h3 className="mt-3 text-2xl font-extrabold sm:text-3xl">
                  Nothing booked yet
                </h3>

                <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-300">
                  Discover the equipment, facilities, and spaces available on
                  campus. Once you submit a request, you can follow its progress
                  right here.
                </p>

                <button
                  type="button"
                  onClick={onExploreCatalog}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-400 px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-offset-2 focus:ring-offset-slate-950"
                >
                  Explore resources
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-6">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <CalendarDays className="h-5 w-5 text-teal-700" />
                <h4 className="mt-3 text-sm font-bold text-slate-900">
                  Find a resource
                </h4>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Explore the inventory and choose what you need.
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <ShieldCheck className="h-5 w-5 text-teal-700" />
                <h4 className="mt-3 text-sm font-bold text-slate-900">
                  Request approval
                </h4>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Submit your booking and follow the approval process.
                </p>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <Clock className="h-5 w-5 text-teal-700" />
                <h4 className="mt-3 text-sm font-bold text-slate-900">
                  Track progress
                </h4>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Return to this page to check your request status.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Booking cards */}
        {!isLoading && !fetchError && bookings.length > 0 && (
          <div className="mt-5 space-y-4">
            {bookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}

        {/* Help note */}
        {!isLoading && !fetchError && bookings.length > 0 && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-teal-100 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-800">
              <ShieldCheck className="h-4 w-4" />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">
                Keep your booking details handy
              </p>
              <p className="mt-1 text-xs leading-6 text-slate-500">
                Review the request status and scheduled time before collecting
                a resource. Approval does not necessarily mean that a resource
                has been checked out.
              </p>
            </div>

            <ArrowUpRight className="ml-auto hidden h-4 w-4 shrink-0 text-slate-400 sm:block" />
          </div>
        )}
      </div>
    </section>
  )
}
