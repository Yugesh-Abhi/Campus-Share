
import React, { useState } from 'react'
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Tag,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Loader2,
  FileText,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

export default function BookingRequestModal({
  isOpen,
  resource,
  onClose,
  onBookingSuccess,
  onOpenMyBookings,
}) {
  const { user } = useAuth()

  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endDate, setEndDate] = useState('')
  const [endTime, setEndTime] = useState('')
  const [purpose, setPurpose] = useState('')

  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  if (!isOpen || !resource) return null

  const todayStr = new Date().toLocaleDateString('en-CA')

  const resetForm = () => {
    setStartDate('')
    setStartTime('')
    setEndDate('')
    setEndTime('')
    setPurpose('')
    setErrorMsg('')
    setIsSuccess(false)
  }

  const handleClose = () => {
    if (isLoading) return
    resetForm()
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')

    if (!user) {
      setErrorMsg('You must be signed in to submit a booking request.')
      return
    }

    if (!isSupabaseConfigured || !supabase) {
      setErrorMsg(
        'Supabase is not configured. Please check your .env.local file.'
      )
      return
    }

    if (!startDate || !startTime || !endDate || !endTime) {
      setErrorMsg('Please specify both the start and end dates and times.')
      return
    }

    if (!purpose.trim()) {
      setErrorMsg('Please describe the purpose of your booking.')
      return
    }

    const startDateTime = new Date(`${startDate}T${startTime}`)
    const endDateTime = new Date(`${endDate}T${endTime}`)
    const now = new Date()

    if (
      isNaN(startDateTime.getTime()) ||
      isNaN(endDateTime.getTime())
    ) {
      setErrorMsg('Invalid date or time format selected.')
      return
    }

    if (startDateTime < new Date(now.getTime() - 5 * 60 * 1000)) {
      setErrorMsg('The requested start time cannot be in the past.')
      return
    }

    if (endDateTime <= startDateTime) {
      setErrorMsg('The requested end time must be after the start time.')
      return
    }

    const durationMinutes =
      (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60)

    if (durationMinutes < 15) {
      setErrorMsg('The booking duration must be at least 15 minutes.')
      return
    }

    setIsLoading(true)

    try {
      const { data: conflictingBookings, error: conflictError } =
        await supabase
          .from('bookings')
          .select('id, start_time, end_time, status')
          .eq('resource_id', resource.id)
          .in('status', ['pending', 'approved'])
          .lt('start_time', endDateTime.toISOString())
          .gt('end_time', startDateTime.toISOString())

      if (conflictError) throw conflictError

      if (conflictingBookings && conflictingBookings.length > 0) {
        throw new Error(
          'This resource already has a pending or approved booking during that time. Please choose another time slot.'
        )
      }

      const payload = {
        resource_id: resource.id,
        user_id: user.id,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        status: 'pending',
      }

      let insertResult = await supabase
        .from('bookings')
        .insert([{ ...payload, purpose: purpose.trim() }])
        .select()

      if (
        insertResult.error &&
        insertResult.error.message.toLowerCase().includes('purpose')
      ) {
        console.warn(
          "[BookingRequestModal] The bookings table does not have a 'purpose' column. Retrying without it."
        )

        insertResult = await supabase
          .from('bookings')
          .insert([payload])
          .select()
      }

      if (insertResult.error) {
        throw insertResult.error
      }

      setIsSuccess(true)

      if (onBookingSuccess) {
        onBookingSuccess(insertResult.data?.[0])
      }
    } catch (err) {
      console.error(
        '[BookingRequestModal] Error submitting booking:',
        err
      )

      setErrorMsg(
        err.message || 'Failed to submit booking request. Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-600/10 disabled:cursor-not-allowed disabled:opacity-60'

  const labelClass =
    'mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/65 p-3 backdrop-blur-sm sm:p-6"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
        className="relative my-auto w-full max-w-xl overflow-hidden rounded-3xl border border-white/70 bg-white shadow-2xl shadow-slate-950/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Brand accent */}
        <div className="h-1.5 bg-gradient-to-r from-slate-900 via-teal-600 to-teal-400" />

        {/* Modal header */}
        <div className="relative overflow-hidden bg-slate-900 px-5 py-6 text-white sm:px-8">
          <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-teal-500/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 right-24 h-32 w-32 rounded-full bg-teal-400/10 blur-xl" />

          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className="absolute right-4 top-4 z-10 rounded-xl border border-white/10 bg-white/5 p-2 text-slate-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 sm:right-6 sm:top-6"
            aria-label="Close booking modal"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative pr-9">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-teal-400/25 bg-teal-400/10 px-3 py-1.5 text-xs font-semibold text-teal-300">
              <Sparkles className="h-3.5 w-3.5" />
              CampusShare Reservations
            </div>

            <h2
              id="booking-modal-title"
              className="text-xl font-bold tracking-tight sm:text-2xl"
            >
              {isSuccess ? 'Request submitted!' : 'Request a booking'}
            </h2>

            <p className="mt-1.5 max-w-md text-sm leading-relaxed text-slate-300">
              {isSuccess
                ? 'Your reservation request has been recorded.'
                : 'Choose your time slot and tell us how you plan to use this resource.'}
            </p>
          </div>
        </div>

        <div className="max-h-[calc(100dvh-12rem)] overflow-y-auto px-5 py-6 sm:px-8 sm:py-7">
          {/* Resource information */}
          <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                <Calendar className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-1.5 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-800 ring-1 ring-teal-100">
                    <Tag className="h-3 w-3" />
                    {resource.category || 'Resource'}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      resource.requires_approval
                        ? 'bg-amber-50 text-amber-800 ring-1 ring-amber-100'
                        : 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100'
                    }`}
                  >
                    <ShieldCheck className="h-3 w-3" />
                    {resource.requires_approval
                      ? 'Approval required'
                      : 'Instant reservation'}
                  </span>
                </div>

                <h3 className="break-words text-base font-bold text-slate-900 sm:text-lg">
                  {resource.title}
                </h3>

                <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                  <MapPin className="h-4 w-4 shrink-0 text-teal-700" />
                  {resource.location || 'Campus Facility'}
                </p>
              </div>
            </div>
          </div>

          {/* Success screen */}
          {isSuccess ? (
            <div className="py-4 text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-teal-50 text-teal-700 ring-1 ring-teal-100">
                <CheckCircle2 className="h-10 w-10" />
              </div>

              <h3 className="text-xl font-bold text-slate-900">
                Booking request submitted!
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">
                Your request for{' '}
                <strong className="text-slate-900">{resource.title}</strong>{' '}
                has been saved with the status{' '}
                <span className="inline-flex rounded-md bg-amber-50 px-2 py-0.5 font-bold text-amber-800">
                  pending
                </span>
                . The resource owner can review your request.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => {
                    handleClose()
                    if (onOpenMyBookings) onOpenMyBookings()
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-teal-700/15 transition hover:bg-teal-800 focus:outline-none focus:ring-4 focus:ring-teal-600/20"
                >
                  View My Bookings
                  <ArrowRight className="h-4 w-4" />
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error message */}
              {errorMsg && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
                >
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                  <p className="leading-relaxed">{errorMsg}</p>
                </div>
              )}

              {/* Date and time section */}
              <div>
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-slate-900">
                    Booking schedule
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">
                    Select when you want to collect and return the resource.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="booking-start-date" className={labelClass}>
                      Start date
                    </label>
                    <div className="relative">
                      <Calendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-teal-700" />
                      <input
                        id="booking-start-date"
                        type="date"
                        min={todayStr}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        disabled={isLoading}
                        required
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="booking-start-time" className={labelClass}>
                      Start time
                    </label>
                    <div className="relative">
                      <Clock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-teal-700" />
                      <input
                        id="booking-start-time"
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        disabled={isLoading}
                        required
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="booking-end-date" className={labelClass}>
                      End date
                    </label>
                    <div className="relative">
                      <Calendar className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-teal-700" />
                      <input
                        id="booking-end-date"
                        type="date"
                        min={startDate || todayStr}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        disabled={isLoading}
                        required
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="booking-end-time" className={labelClass}>
                      End time
                    </label>
                    <div className="relative">
                      <Clock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-teal-700" />
                      <input
                        id="booking-end-time"
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        disabled={isLoading}
                        required
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label htmlFor="booking-purpose" className={labelClass}>
                  Purpose / project details
                </label>

                <div className="relative">
                  <FileText className="pointer-events-none absolute left-3.5 top-4 h-4 w-4 text-teal-700" />
                  <textarea
                    id="booking-purpose"
                    rows={4}
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="Explain what you need the resource for..."
                    disabled={isLoading}
                    required
                    className={`${inputClass} resize-y py-3`}
                  />
                </div>

                <p className="mt-2 text-xs leading-relaxed text-slate-500">
                  A clear purpose helps the resource owner understand your
                  request.
                </p>
              </div>

              {/* Footer note */}
              <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-3.5">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
                <p className="text-xs leading-relaxed text-slate-600">
                  Your request will be checked against existing bookings.
                  Submitting a request does not guarantee approval.
                </p>
              </div>

              {/* Actions */}
              <div className="border-t border-slate-100 pt-5">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-teal-700 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-teal-700/15 transition hover:-translate-y-0.5 hover:bg-teal-800 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-teal-600/20 disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting request...
                    </>
                  ) : (
                    <>
                      Submit booking request
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="mt-3 w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
