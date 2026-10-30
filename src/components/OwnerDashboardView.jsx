import React, { useState, useEffect, useCallback } from 'react'
import {
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  MapPin,
  AlertTriangle,
  User,
  Building2,
  PackageOpen,
  FileText,
  PackageCheck,
  RotateCcw,
  Loader2,
  ShieldCheck,
  ClipboardCheck,
  AlertCircle,
  CalendarDays,
  Activity,
  X,
  Plus,
} from 'lucide-react'

import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10'

const primaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-500/20 disabled:cursor-not-allowed disabled:opacity-50'

const secondaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'

function formatDateTimeRange(startIso, endIso) {
  if (!startIso || !endIso) return 'Schedule unavailable'

  const start = new Date(startIso)
  const end = new Date(endIso)

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    return 'Schedule unavailable'
  }

  const date = start.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const startTime = start.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })

  const endTime = end.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  })

  return `${date} · ${startTime} – ${endTime}`
}

function formatTimestamp(value) {
  if (!value) return 'Not recorded'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return 'Date unavailable'

  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function StatusBadge({ status }) {
  const styles = {
    pending: 'bg-amber-50 text-amber-800 border-amber-200',
    approved: 'bg-teal-50 text-teal-800 border-teal-200',
    rejected: 'bg-red-50 text-red-700 border-red-200',
  }

  const icons = {
    pending: Clock,
    approved: CheckCircle2,
    rejected: XCircle,
  }

  const labels = {
    pending: 'Needs review',
    approved: 'Approved',
    rejected: 'Rejected',
  }

  const Icon = icons[status] || AlertCircle

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${
        styles[status] || 'bg-slate-50 text-slate-600 border-slate-200'
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {labels[status] || status || 'Unknown'}
    </span>
  )
}

function SummaryCard({ icon: Icon, label, value, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p className="mt-3 text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  )
}

export default function OwnerDashboardView({ onExploreCatalog }) {
  const { user } = useAuth()

  const [ownedResources, setOwnedResources] = useState([])
  const [bookings, setBookings] = useState([])
  const [requesterMap, setRequesterMap] = useState({})
  const [conditionLogs, setConditionLogs] = useState([])
  const [incidentReports, setIncidentReports] = useState([])

  const [conditionForm, setConditionForm] = useState({
    bookingId: '',
    stage: 'check_out',
    notes: '',
    photoUrl: '',
  })

  const [incidentForm, setIncidentForm] = useState({
    bookingId: '',
    severity: 'minor',
    description: '',
  })

  const [activeForm, setActiveForm] = useState(null)
  const [isSavingRecord, setIsSavingRecord] = useState(false)

  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [actionToast, setActionToast] = useState('')
  const [filterTab, setFilterTab] = useState('pending')

  const [rejectingBooking, setRejectingBooking] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const [showAddResourceForm, setShowAddResourceForm] = useState(false)
  const [isAddingResource, setIsAddingResource] = useState(false)
  const [newResource, setNewResource] = useState({
    title: '',
    category: 'equipment',
    description: '',
    location: '',
    requires_approval: true,
  })

  const showToast = (message) => {
    setActionToast(message)
    window.setTimeout(() => setActionToast(''), 4000)
  }

  const handleAddResource = async (event) => {
    event.preventDefault()
    if (!user?.id) {
      setErrorMsg('Please sign in before adding a resource.')
      return
    }
    if (!newResource.title.trim() || !newResource.location.trim()) {
      setErrorMsg('Please enter a resource title and location.')
      return
    }

    setIsAddingResource(true)
    setErrorMsg('')
    try {
      const { error } = await supabase.from('resources').insert({
        title: newResource.title.trim(),
        category: newResource.category,
        description: newResource.description.trim(),
        location: newResource.location.trim(),
        is_active: true,
        requires_approval: newResource.requires_approval,
        allowed_departments: ['All Departments'],
        owner_id: user.id,
      })
      if (error) throw error

      setNewResource({
        title: '',
        category: 'equipment',
        description: '',
        location: '',
        requires_approval: true,
      })
      setShowAddResourceForm(false)
      showToast('Resource added successfully.')
      await fetchOwnerData(true)
    } catch (error) {
      console.error('[OwnerDashboard] Add resource failed:', error)
      setErrorMsg(error.message || 'Could not add the resource. Check your Supabase permissions and table columns.')
    } finally {
      setIsAddingResource(false)
    }
  }

  const fetchOwnerData = useCallback(
    async (isManual = false) => {
      if (!user) {
        setOwnedResources([])
        setBookings([])
        setRequesterMap({})
        setConditionLogs([])
        setIncidentReports([])
        setIsLoading(false)
        setIsRefreshing(false)
        return
      }

      if (isManual) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      setErrorMsg('')

      try {
        const { data: resourceData, error: resourceError } =
          await supabase
            .from('resources')
            .select(
              'id, title, category, location, is_active, requires_approval, owner_id'
            )
            .eq('owner_id', user.id)

        if (resourceError) throw resourceError

        const resources = resourceData || []
        setOwnedResources(resources)

        if (resources.length === 0) {
          setBookings([])
          setRequesterMap({})
          setConditionLogs([])
          setIncidentReports([])
          return
        }

        const resourceIds = resources.map((resource) => resource.id)

        const { data: bookingData, error: bookingError } =
          await supabase
            .from('bookings')
            .select(`
              id,
              resource_id,
              user_id,
              start_time,
              end_time,
              status,
              rejection_reason,
              created_at,
              purpose,
              checked_out_at,
              checked_in_at,
              checked_out_by,
              checked_in_by,
              resources (
                id,
                title,
                category,
                location,
                owner_id
              )
            `)
            .in('resource_id', resourceIds)
            .order('created_at', { ascending: false })

        if (bookingError) throw bookingError

        const loadedBookings = bookingData || []
        setBookings(loadedBookings)

        const bookingIds = loadedBookings.map((booking) => booking.id)
        const userIds = [
          ...new Set(loadedBookings.map((booking) => booking.user_id)),
        ].filter(Boolean)

        if (bookingIds.length > 0) {
          const [
            { data: conditionData, error: conditionError },
            { data: incidentData, error: incidentError },
          ] = await Promise.all([
            supabase
              .from('condition_logs')
              .select(
                'id, booking_id, recorded_by, stage, notes, photo_url, logged_at'
              )
              .in('booking_id', bookingIds)
              .order('logged_at', { ascending: false }),

            supabase
              .from('incident_reports')
              .select(
                'id, booking_id, resource_id, reported_by, severity, description, status, created_at'
              )
              .in('booking_id', bookingIds)
              .order('created_at', { ascending: false }),
          ])

          if (conditionError) {
            console.error('Could not load condition records:', conditionError)
            setConditionLogs([])
          } else {
            setConditionLogs(conditionData || [])
          }

          if (incidentError) {
            console.error('Could not load incident reports:', incidentError)
            setIncidentReports([])
          } else {
            setIncidentReports(incidentData || [])
          }
        } else {
          setConditionLogs([])
          setIncidentReports([])
        }

        if (userIds.length > 0) {
          const { data: profilesData, error: profilesError } =
            await supabase
              .from('profiles')
              .select('id, full_name, department')
              .in('id', userIds)

          if (profilesError) {
            console.error('Could not load requester profiles:', profilesError)
            setRequesterMap({})
          } else {
            const profileMap = {}

            ;(profilesData || []).forEach((profile) => {
              profileMap[profile.id] = profile
            })

            setRequesterMap(profileMap)
          }
        } else {
          setRequesterMap({})
        }
      } catch (error) {
        console.error('[OwnerDashboardView] Dashboard loading error:', error)
        setErrorMsg(
          error.message || 'Could not load the owner dashboard.'
        )
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [user]
  )

  useEffect(() => {
    fetchOwnerData()
  }, [fetchOwnerData])

  const updateLocalBooking = (bookingId, updates) => {
    setBookings((current) =>
      current.map((booking) =>
        booking.id === bookingId ? { ...booking, ...updates } : booking
      )
    )
  }

  const handleApprove = async (booking) => {
    if (!user || booking.resources?.owner_id !== user.id) {
      setErrorMsg('You can only approve requests for your own resources.')
      return
    }

    if (booking.status !== 'pending') {
      setErrorMsg('Only pending booking requests can be approved.')
      return
    }

    setIsUpdatingStatus(true)
    setErrorMsg('')

    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({
          status: 'approved',
          rejection_reason: null,
        })
        .eq('id', booking.id)
        .eq('status', 'pending')
        .select('id, status, rejection_reason')

      if (error) throw error

      if (!data?.length) {
        throw new Error('The request changed. Refresh and try again.')
      }

      updateLocalBooking(booking.id, {
        status: 'approved',
        rejection_reason: null,
      })

      showToast('Booking request approved.')
    } catch (error) {
      console.error('Approve booking error:', error)
      setErrorMsg(error.message || 'Could not approve the booking.')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const openRejectDialog = (booking) => {
    setRejectingBooking(booking)
    setRejectionReason('')
    setErrorMsg('')
  }

  const handleConfirmReject = async () => {
    if (!rejectingBooking || !user) return

    if (rejectingBooking.resources?.owner_id !== user.id) {
      setErrorMsg('You can only reject requests for your own resources.')
      setRejectingBooking(null)
      return
    }

    if (rejectingBooking.status !== 'pending') {
      setErrorMsg('Only pending booking requests can be rejected.')
      setRejectingBooking(null)
      return
    }

    const reason = rejectionReason.trim()

    if (!reason) {
      setErrorMsg('Please enter a rejection reason.')
      return
    }

    setIsUpdatingStatus(true)
    setErrorMsg('')

    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({
          status: 'rejected',
          rejection_reason: reason,
        })
        .eq('id', rejectingBooking.id)
        .eq('status', 'pending')
        .select('id, status, rejection_reason')

      if (error) throw error

      if (!data?.length) {
        throw new Error('The request changed. Refresh and try again.')
      }

      updateLocalBooking(rejectingBooking.id, {
        status: 'rejected',
        rejection_reason: reason,
      })

      setRejectingBooking(null)
      setRejectionReason('')
      showToast('Booking request rejected.')
    } catch (error) {
      console.error('Reject booking error:', error)
      setErrorMsg(error.message || 'Could not reject the booking.')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleCheckOut = async (booking) => {
    if (!user || booking.resources?.owner_id !== user.id) {
      setErrorMsg('You can only record collection for your own resources.')
      return
    }

    if (booking.status !== 'approved') {
      setErrorMsg('Only approved bookings can be checked out.')
      return
    }

    if (booking.checked_out_at) {
      setErrorMsg('Collection has already been recorded.')
      return
    }

    setIsUpdatingStatus(true)
    setErrorMsg('')

    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({
          checked_out_at: new Date().toISOString(),
          checked_out_by: user.id,
        })
        .eq('id', booking.id)
        .eq('status', 'approved')
        .is('checked_out_at', null)
        .is('checked_in_at', null)
        .select('id, checked_out_at, checked_out_by')

      if (error) throw error

      if (!data?.length) {
        throw new Error('Collection was not recorded. Refresh and retry.')
      }

      updateLocalBooking(booking.id, {
        checked_out_at: data[0].checked_out_at,
        checked_out_by: data[0].checked_out_by,
      })

      showToast('Equipment collection recorded.')
    } catch (error) {
      console.error('Collection recording error:', error)
      setErrorMsg(error.message || 'Could not record collection.')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleCheckIn = async (booking) => {
    if (!user || booking.resources?.owner_id !== user.id) {
      setErrorMsg('You can only record returns for your own resources.')
      return
    }

    if (!booking.checked_out_at) {
      setErrorMsg('Record collection before recording a return.')
      return
    }

    if (booking.checked_in_at) {
      setErrorMsg('This equipment has already been returned.')
      return
    }

    setIsUpdatingStatus(true)
    setErrorMsg('')

    try {
      const { data, error } = await supabase
        .from('bookings')
        .update({
          checked_in_at: new Date().toISOString(),
          checked_in_by: user.id,
        })
        .eq('id', booking.id)
        .eq('status', 'approved')
        .not('checked_out_at', 'is', null)
        .is('checked_in_at', null)
        .select('id, checked_in_at, checked_in_by')

      if (error) throw error

      if (!data?.length) {
        throw new Error('Return was not recorded. Refresh and retry.')
      }

      updateLocalBooking(booking.id, {
        checked_in_at: data[0].checked_in_at,
        checked_in_by: data[0].checked_in_by,
      })

      showToast('Equipment return recorded.')
    } catch (error) {
      console.error('Return recording error:', error)
      setErrorMsg(error.message || 'Could not record the return.')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleSaveCondition = async (event) => {
    event.preventDefault()

    if (!user) {
      setErrorMsg('Please sign in to record equipment condition.')
      return
    }

    if (!conditionForm.bookingId || !conditionForm.notes.trim()) {
      setErrorMsg('Select a booking and enter condition notes.')
      return
    }

    const booking = bookings.find(
      (item) => item.id === conditionForm.bookingId
    )

    if (!booking || booking.resources?.owner_id !== user.id) {
      setErrorMsg('You can only record condition for your own resources.')
      return
    }

    if (
      conditionForm.stage === 'check_out' &&
      booking.checked_out_at
    ) {
      setErrorMsg('Collection is already recorded for this booking.')
      return
    }

    if (
      conditionForm.stage === 'check_in' &&
      !booking.checked_in_at
    ) {
      setErrorMsg('Record the equipment return before its final condition.')
      return
    }

    setIsSavingRecord(true)
    setErrorMsg('')

    try {
      const { error } = await supabase
        .from('condition_logs')
        .insert({
          booking_id: booking.id,
          recorded_by: user.id,
          stage: conditionForm.stage,
          notes: conditionForm.notes.trim(),
          photo_url: conditionForm.photoUrl.trim() || null,
        })

      if (error) throw error

      setConditionForm({
        bookingId: '',
        stage: 'check_out',
        notes: '',
        photoUrl: '',
      })

      setActiveForm(null)
      showToast('Equipment condition saved.')
      await fetchOwnerData(true)
    } catch (error) {
      console.error('Save condition error:', error)
      setErrorMsg(error.message || 'Could not save the condition record.')
    } finally {
      setIsSavingRecord(false)
    }
  }

  const handleSaveIncident = async (event) => {
    event.preventDefault()

    if (!user) {
      setErrorMsg('Please sign in to report an incident.')
      return
    }

    if (
      !incidentForm.bookingId ||
      !incidentForm.description.trim()
    ) {
      setErrorMsg('Select a booking and describe the incident.')
      return
    }

    const booking = bookings.find(
      (item) => item.id === incidentForm.bookingId
    )

    if (!booking || booking.resources?.owner_id !== user.id) {
      setErrorMsg('You can only report incidents involving your resources.')
      return
    }

    setIsSavingRecord(true)
    setErrorMsg('')

    try {
      const { error } = await supabase
        .from('incident_reports')
        .insert({
          booking_id: booking.id,
          resource_id: booking.resource_id,
          reported_by: user.id,
          severity: incidentForm.severity,
          description: incidentForm.description.trim(),
          status: 'open',
        })

      if (error) throw error

      setIncidentForm({
        bookingId: '',
        severity: 'minor',
        description: '',
      })

      setActiveForm(null)
      showToast('Incident report submitted.')
      await fetchOwnerData(true)
    } catch (error) {
      console.error('Save incident error:', error)
      setErrorMsg(error.message || 'Could not save the incident report.')
    } finally {
      setIsSavingRecord(false)
    }
  }

  const pendingCount = bookings.filter(
    (booking) => booking.status === 'pending'
  ).length

  const approvedCount = bookings.filter(
    (booking) => booking.status === 'approved'
  ).length

  const rejectedCount = bookings.filter(
    (booking) => booking.status === 'rejected'
  ).length

  const filteredBookings = bookings.filter((booking) => {
    return filterTab === 'all' || booking.status === filterTab
  })

  const getRequesterName = (booking) =>
    requesterMap[booking.user_id]?.full_name ||
    `Student (${booking.user_id?.slice(0, 8) || 'unknown'}…)`

  const getResourceName = (bookingId) =>
    bookings.find((booking) => booking.id === bookingId)?.resources?.title ||
    'Equipment'

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8 animate-fadeIn">
        {/* Toast notification */}
        {actionToast && (
          <div
            role="status"
            className="fixed bottom-5 right-5 z-[60] flex max-w-sm items-start gap-3 rounded-2xl border border-teal-100 bg-white p-4 shadow-2xl"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900">Success</p>
              <p className="mt-1 text-sm text-slate-600">{actionToast}</p>
            </div>

            <button
              type="button"
              onClick={() => setActionToast('')}
              aria-label="Dismiss notification"
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Page heading */}
        <header className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-lg">
          <div className="relative px-6 py-8 sm:px-9 sm:py-10">
            <div className="pointer-events-none absolute -right-12 -top-24 h-64 w-64 rounded-full bg-teal-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-32 right-1/3 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-teal-400/20 bg-teal-400/10 px-3 py-1.5 text-xs font-semibold text-teal-300">
                  <ShieldCheck className="h-4 w-4" />
                  RESOURCE MANAGEMENT
                </div>

                <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                  Owner Dashboard
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                  Manage booking requests, coordinate equipment handovers,
                  and maintain a clear record of resource condition and
                  incidents.
                </p>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200">
                    {ownedResources.length}{' '}
                    {ownedResources.length === 1 ? 'resource' : 'resources'}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200">
                    {bookings.length}{' '}
                    {bookings.length === 1 ? 'booking' : 'bookings'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => fetchOwnerData(true)}
                disabled={isLoading || isRefreshing}
                className="relative inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    isRefreshing ? 'animate-spin text-teal-300' : ''
                  }`}
                />
                Refresh dashboard
              </button>
            </div>
          </div>
        </header>

        {/* Add resource */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-slate-950">Add a resource</h2>
              <p className="mt-1 text-sm text-slate-500">List equipment, laboratories, or spaces for your campus community.</p>
            </div>
            <button type="button" onClick={() => setShowAddResourceForm((value) => !value)} className={primaryButtonClass}>
              <Plus className="h-4 w-4" /> {showAddResourceForm ? 'Close form' : 'Add Resource'}
            </button>
          </div>

          {showAddResourceForm && (
            <form onSubmit={handleAddResource} className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 md:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700">Resource title *
                <input className={`${inputClass} mt-1.5`} value={newResource.title} onChange={(e) => setNewResource({ ...newResource, title: e.target.value })} placeholder="e.g. DSLR Camera Kit" required maxLength={120} />
              </label>
              <label className="text-sm font-semibold text-slate-700">Category *
                <select className={`${inputClass} mt-1.5`} value={newResource.category} onChange={(e) => setNewResource({ ...newResource, category: e.target.value })}>
                  <option value="equipment">Equipment</option>
                  <option value="laboratory">Laboratory</option>
                  <option value="space">Space</option>
                </select>
              </label>
              <label className="text-sm font-semibold text-slate-700">Location *
                <input className={`${inputClass} mt-1.5`} value={newResource.location} onChange={(e) => setNewResource({ ...newResource, location: e.target.value })} placeholder="e.g. Engineering Block, Room 210" required maxLength={200} />
              </label>
              <label className="text-sm font-semibold text-slate-700">Booking policy
                <select className={`${inputClass} mt-1.5`} value={newResource.requires_approval ? 'yes' : 'no'} onChange={(e) => setNewResource({ ...newResource, requires_approval: e.target.value === 'yes' })}>
                  <option value="yes">Owner approval required</option>
                  <option value="no">Standard request</option>
                </select>
              </label>
              <label className="text-sm font-semibold text-slate-700 md:col-span-2">Description
                <textarea className={`${inputClass} mt-1.5 min-h-24`} value={newResource.description} onChange={(e) => setNewResource({ ...newResource, description: e.target.value })} placeholder="Describe the resource, its use, and any important instructions." maxLength={1000} />
              </label>
              <div className="flex flex-wrap gap-3 md:col-span-2">
                <button type="submit" disabled={isAddingResource} className={primaryButtonClass}>
                  {isAddingResource ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {isAddingResource ? 'Saving resource…' : 'Save resource'}
                </button>
                <button type="button" onClick={() => setShowAddResourceForm(false)} className={secondaryButtonClass}>Cancel</button>
              </div>
            </form>
          )}
        </section>

        {/* Error message */}
        {errorMsg && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <p className="flex-1 leading-6">{errorMsg}</p>

            <button
              type="button"
              onClick={() => setErrorMsg('')}
              aria-label="Dismiss error"
              className="rounded-lg p-1 hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 py-5 text-sm text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
              Loading your resources and bookings…
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white"
                />
              ))}
            </div>

            <div className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          </div>
        )}

        {/* Dashboard content */}
        {!isLoading && (
          <>
            {/* Empty resource state */}
            {ownedResources.length === 0 ? (
              <section className="rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm sm:px-12">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                  <Building2 className="h-8 w-8" />
                </div>

                <h2 className="mt-5 text-2xl font-extrabold text-slate-900">
                  No managed resources yet
                </h2>

                <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
                  Resources assigned to your account will appear here. Explore
                  the catalog to view available campus resources.
                </p>

                <button
                  type="button"
                  onClick={onExploreCatalog}
                  className={`${primaryButtonClass} mt-6`}
                >
                  <PackageOpen className="h-4 w-4" />
                  Explore resource catalog
                </button>
              </section>
            ) : (
              <>
                {/* Summary cards */}
                <section>
                  <div className="mb-4">
                    <h2 className="text-lg font-bold text-slate-900">
                      At a glance
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      A summary of your resources and booking activity.
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard
                      icon={Building2}
                      label="Managed resources"
                      value={ownedResources.length}
                      description="Resources assigned to your account."
                    />

                    <SummaryCard
                      icon={Clock}
                      label="Pending requests"
                      value={pendingCount}
                      description="Requests waiting for your decision."
                    />

                    <SummaryCard
                      icon={CheckCircle2}
                      label="Approved bookings"
                      value={approvedCount}
                      description="Bookings approved for use."
                    />

                    <SummaryCard
                      icon={XCircle}
                      label="Rejected requests"
                      value={rejectedCount}
                      description="Requests that were not approved."
                    />
                  </div>
                </section>

                {/* Resource overview */}
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                      <Building2 className="h-5 w-5" />
                    </div>

                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Your resources
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Review the resources associated with your account.
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {ownedResources.map((resource) => (
                      <div
                        key={resource.id}
                        className="rounded-xl border border-slate-200 p-4 transition hover:border-teal-200 hover:bg-teal-50/30"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                              <PackageOpen className="h-5 w-5" />
                            </div>

                            <div className="min-w-0">
                              <h3 className="break-words font-bold text-slate-900">
                                {resource.title || 'Untitled resource'}
                              </h3>
                              <p className="mt-1 text-xs capitalize text-slate-500">
                                {resource.category || 'Resource'}
                              </p>
                            </div>
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold ${
                              resource.is_active
                                ? 'bg-teal-50 text-teal-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {resource.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>

                        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span>{resource.location || 'Location not listed'}</span>
                        </div>

                        <p className="mt-3 text-xs text-slate-500">
                          {resource.requires_approval
                            ? 'Requires booking approval'
                            : 'Approval not required'}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Booking requests */}
                <section className="space-y-5">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900">
                        Booking requests
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        Review requests and manage equipment handovers.
                      </p>
                    </div>

                    <span className="text-sm text-slate-500">
                      {bookings.length}{' '}
                      {bookings.length === 1 ? 'request' : 'requests'} total
                    </span>
                  </div>

                  {/* Filters */}
                  <div className="flex gap-2 overflow-x-auto border-b border-slate-200 pb-3">
                    {[
                      { id: 'pending', label: 'Pending', count: pendingCount },
                      { id: 'approved', label: 'Approved', count: approvedCount },
                      { id: 'rejected', label: 'Rejected', count: rejectedCount },
                      { id: 'all', label: 'All requests', count: bookings.length },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setFilterTab(tab.id)}
                        className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                          filterTab === tab.id
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {tab.label}
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            filterTab === tab.id
                              ? 'bg-white/15 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {tab.count}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* No bookings */}
                  {filteredBookings.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <PackageOpen className="h-7 w-7" />
                      </div>

                      <h3 className="mt-4 font-bold text-slate-900">
                        {filterTab === 'pending'
                          ? 'No pending requests'
                          : filterTab === 'approved'
                            ? 'No approved bookings'
                            : filterTab === 'rejected'
                              ? 'No rejected requests'
                              : 'No booking requests yet'}
                      </h3>

                      <p className="mt-2 text-sm text-slate-500">
                        Requests matching this filter will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredBookings.map((booking) => {
                        const profile = requesterMap[booking.user_id]
                        const requesterName =
                          profile?.full_name || getRequesterName(booking)
                        const requesterDepartment =
                          profile?.department || 'University member'

                        return (
                          <article
                            key={booking.id}
                            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                          >
                            <div className="p-5 sm:p-6">
                              {/* Booking heading */}
                              <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                                <div className="min-w-0">
                                  <div className="mb-2 flex flex-wrap items-center gap-2">
                                    <span className="rounded-lg border border-teal-100 bg-teal-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-teal-800">
                                      {booking.resources?.category || 'Resource'}
                                    </span>

                                    <span className="text-xs text-slate-400">
                                      Submitted{' '}
                                      {booking.created_at
                                        ? new Date(
                                            booking.created_at
                                          ).toLocaleDateString()
                                        : 'date unavailable'}
                                    </span>
                                  </div>

                                  <h3 className="break-words text-lg font-extrabold text-slate-900 sm:text-xl">
                                    {booking.resources?.title ||
                                      'Untitled resource'}
                                  </h3>

                                  <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                                    <MapPin className="h-4 w-4 shrink-0 text-teal-600" />
                                    {booking.resources?.location ||
                                      'Campus facility'}
                                  </p>
                                </div>

                                <StatusBadge status={booking.status} />
                              </div>

                              {/* Student and schedule */}
                              <div className="mt-5 grid gap-3 md:grid-cols-2">
                                <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-teal-700 shadow-sm">
                                    <User className="h-5 w-5" />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                      Requested by
                                    </p>
                                    <p className="mt-1 break-words text-sm font-bold text-slate-900">
                                      {requesterName}
                                    </p>
                                    <p className="mt-0.5 text-xs text-slate-500">
                                      {requesterDepartment}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-teal-700 shadow-sm">
                                    <CalendarDays className="h-5 w-5" />
                                  </div>

                                  <div className="min-w-0">
                                    <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                                      Requested schedule
                                    </p>
                                    <p className="mt-1 text-sm font-semibold leading-6 text-slate-800">
                                      {formatDateTimeRange(
                                        booking.start_time,
                                        booking.end_time
                                      )}
                                    </p>
                                  </div>
                                </div>
                              </div>

                              {/* Purpose */}
                              {booking.purpose && (
                                <div className="mt-3 flex items-start gap-3 rounded-xl border border-slate-100 p-4">
                                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                  <div>
                                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                      Booking purpose
                                    </p>
                                    <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                                      {booking.purpose}
                                    </p>
                                  </div>
                                </div>
                              )}

                              {/* Rejection reason */}
                              {booking.status === 'rejected' &&
                                booking.rejection_reason && (
                                  <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-4">
                                    <p className="text-xs font-bold uppercase tracking-wide text-red-700">
                                      Rejection reason
                                    </p>
                                    <p className="mt-1 text-sm leading-6 text-red-800">
                                      {booking.rejection_reason}
                                    </p>
                                  </div>
                                )}

                              {/* Equipment tracking */}
                              {booking.status === 'approved' && (
                                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                                  <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                                      <PackageCheck className="h-5 w-5" />
                                    </div>
                                    <div>
                                      <h4 className="font-bold text-slate-900">
                                        Equipment handover
                                      </h4>
                                      <p className="text-xs text-slate-500">
                                        Track collection and return.
                                      </p>
                                    </div>
                                  </div>

                                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                                      <p className="text-xs font-semibold text-slate-500">
                                        Collection
                                      </p>
                                      <p
                                        className={`mt-2 flex items-start gap-2 text-sm font-medium ${
                                          booking.checked_out_at
                                            ? 'text-teal-700'
                                            : 'text-amber-700'
                                        }`}
                                      >
                                        {booking.checked_out_at ? (
                                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                                        ) : (
                                          <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                                        )}
                                        <span>
                                          {booking.checked_out_at
                                            ? `Collected ${formatTimestamp(
                                                booking.checked_out_at
                                              )}`
                                            : 'Awaiting collection'}
                                        </span>
                                      </p>
                                    </div>

                                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                                      <p className="text-xs font-semibold text-slate-500">
                                        Return
                                      </p>
                                      <p
                                        className={`mt-2 flex items-start gap-2 text-sm font-medium ${
                                          booking.checked_in_at
                                            ? 'text-teal-700'
                                            : 'text-amber-700'
                                        }`}
                                      >
                                        {booking.checked_in_at ? (
                                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                                        ) : (
                                          <Clock className="mt-0.5 h-4 w-4 shrink-0" />
                                        )}
                                        <span>
                                          {booking.checked_in_at
                                            ? `Returned ${formatTimestamp(
                                                booking.checked_in_at
                                              )}`
                                            : booking.checked_out_at
                                              ? 'Awaiting return'
                                              : 'Available after collection'}
                                        </span>
                                      </p>
                                    </div>
                                  </div>

                                  <div className="mt-4 flex flex-wrap gap-2">
                                    {!booking.checked_out_at && (
                                      <button
                                        type="button"
                                        onClick={() => handleCheckOut(booking)}
                                        disabled={isUpdatingStatus}
                                        className={primaryButtonClass}
                                      >
                                        {isUpdatingStatus ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <PackageCheck className="h-4 w-4" />
                                        )}
                                        Record collection
                                      </button>
                                    )}

                                    {booking.checked_out_at &&
                                      !booking.checked_in_at && (
                                        <button
                                          type="button"
                                          onClick={() => handleCheckIn(booking)}
                                          disabled={isUpdatingStatus}
                                          className={secondaryButtonClass}
                                        >
                                          {isUpdatingStatus ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                          ) : (
                                            <RotateCcw className="h-4 w-4" />
                                          )}
                                          Record return
                                        </button>
                                      )}

                                    {booking.checked_in_at && (
                                      <span className="inline-flex items-center gap-2 rounded-xl bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-800">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Handover complete
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Approve/reject actions */}
                              {booking.status === 'pending' && (
                                <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
                                  <button
                                    type="button"
                                    onClick={() => openRejectDialog(booking)}
                                    disabled={isUpdatingStatus}
                                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                                  >
                                    <XCircle className="h-4 w-4" />
                                    Reject
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleApprove(booking)}
                                    disabled={isUpdatingStatus}
                                    className={primaryButtonClass}
                                  >
                                    {isUpdatingStatus ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <CheckCircle2 className="h-4 w-4" />
                                    )}
                                    Approve request
                                  </button>
                                </div>
                              )}
                            </div>
                          </article>
                        )
                      })}
                    </div>
                  )}
                </section>

                {/* Accountability section */}
                <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                        <ClipboardCheck className="h-5 w-5" />
                      </div>

                      <div>
                        <h2 className="text-xl font-extrabold text-slate-900">
                          Equipment accountability
                        </h2>
                        <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
                          Record condition before collection or after return,
                          and maintain an incident history for your resources.
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                      <Activity className="h-3.5 w-3.5" />
                      {conditionLogs.length + incidentReports.length} records
                    </span>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setActiveForm(
                          activeForm === 'condition' ? null : 'condition'
                        )
                      }
                      className={primaryButtonClass}
                    >
                      <ClipboardCheck className="h-4 w-4" />
                      Record condition
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setActiveForm(
                          activeForm === 'incident' ? null : 'incident'
                        )
                      }
                      className={secondaryButtonClass}
                    >
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      Report incident
                    </button>
                  </div>

                  {/* Condition form */}
                  {activeForm === 'condition' && (
                    <form
                      onSubmit={handleSaveCondition}
                      className="mt-6 space-y-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-6"
                    >
                      <div>
                        <h3 className="font-bold text-slate-900">
                          Record equipment condition
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Add notes to document the item's condition.
                        </p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label
                            htmlFor="condition-booking"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                          >
                            Booking
                          </label>
                          <select
                            id="condition-booking"
                            required
                            value={conditionForm.bookingId}
                            onChange={(event) =>
                              setConditionForm((current) => ({
                                ...current,
                                bookingId: event.target.value,
                              }))
                            }
                            className={inputClass}
                          >
                            <option value="">Select a booking</option>
                            {bookings
                              .filter(
                                (booking) => booking.status === 'approved'
                              )
                              .map((booking) => (
                                <option key={booking.id} value={booking.id}>
                                  {booking.resources?.title || 'Resource'} —{' '}
                                  {getRequesterName(booking)} —{' '}
                                  {booking.checked_in_at
                                    ? 'Returned'
                                    : booking.checked_out_at
                                      ? 'Collected'
                                      : 'Not collected'}
                                </option>
                              ))}
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor="condition-stage"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                          >
                            Condition stage
                          </label>
                          <select
                            id="condition-stage"
                            required
                            value={conditionForm.stage}
                            onChange={(event) =>
                              setConditionForm((current) => ({
                                ...current,
                                stage: event.target.value,
                              }))
                            }
                            className={inputClass}
                          >
                            <option value="check_out">
                              Before collection
                            </option>
                            <option value="check_in">After return</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="condition-notes"
                          className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                          Condition notes
                        </label>
                        <textarea
                          id="condition-notes"
                          required
                          rows={4}
                          value={conditionForm.notes}
                          onChange={(event) =>
                            setConditionForm((current) => ({
                              ...current,
                              notes: event.target.value,
                            }))
                          }
                          placeholder="Describe the equipment's condition, any visible wear, or any issues..."
                          className={inputClass}
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="condition-photo"
                          className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                          Photo URL <span className="font-normal text-slate-400">(optional)</span>
                        </label>
                        <input
                          id="condition-photo"
                          type="url"
                          value={conditionForm.photoUrl}
                          onChange={(event) =>
                            setConditionForm((current) => ({
                              ...current,
                              photoUrl: event.target.value,
                            }))
                          }
                          placeholder="https://example.com/photo.jpg"
                          className={inputClass}
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="submit"
                          disabled={isSavingRecord}
                          className={primaryButtonClass}
                        >
                          {isSavingRecord && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          )}
                          Save condition
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveForm(null)}
                          disabled={isSavingRecord}
                          className={secondaryButtonClass}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Incident form */}
                  {activeForm === 'incident' && (
                    <form
                      onSubmit={handleSaveIncident}
                      className="mt-6 space-y-5 rounded-2xl border border-amber-200 bg-amber-50/40 p-4 sm:p-6"
                    >
                      <div>
                        <h3 className="font-bold text-slate-900">
                          Report an equipment incident
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          Document damage, loss, or another issue.
                        </p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label
                            htmlFor="incident-booking"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                          >
                            Booking
                          </label>
                          <select
                            id="incident-booking"
                            required
                            value={incidentForm.bookingId}
                            onChange={(event) =>
                              setIncidentForm((current) => ({
                                ...current,
                                bookingId: event.target.value,
                              }))
                            }
                            className={inputClass}
                          >
                            <option value="">Select a booking</option>
                            {bookings
                              .filter(
                                (booking) => booking.status === 'approved'
                              )
                              .map((booking) => (
                                <option key={booking.id} value={booking.id}>
                                  {booking.resources?.title || 'Resource'} —{' '}
                                  {getRequesterName(booking)}
                                </option>
                              ))}
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor="incident-severity"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                          >
                            Severity
                          </label>
                          <select
                            id="incident-severity"
                            value={incidentForm.severity}
                            onChange={(event) =>
                              setIncidentForm((current) => ({
                                ...current,
                                severity: event.target.value,
                              }))
                            }
                            className={inputClass}
                          >
                            <option value="minor">Minor</option>
                            <option value="moderate">Moderate</option>
                            <option value="major">Major</option>
                            <option value="critical">Critical</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="incident-description"
                          className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                          Incident description
                        </label>
                        <textarea
                          id="incident-description"
                          required
                          rows={4}
                          value={incidentForm.description}
                          onChange={(event) =>
                            setIncidentForm((current) => ({
                              ...current,
                              description: event.target.value,
                            }))
                          }
                          placeholder="Explain what happened and include any relevant details..."
                          className={inputClass}
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="submit"
                          disabled={isSavingRecord}
                          className={primaryButtonClass}
                        >
                          {isSavingRecord && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          )}
                          Submit incident
                        </button>

                        <button
                          type="button"
                          onClick={() => setActiveForm(null)}
                          disabled={isSavingRecord}
                          className={secondaryButtonClass}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  {/* History columns */}
                  <div className="mt-8 grid gap-6 lg:grid-cols-2">
                    {/* Condition history */}
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
                        <h3 className="font-bold text-slate-900">
                          Condition history
                        </h3>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                          {conditionLogs.length}
                        </span>
                      </div>

                      {conditionLogs.length === 0 ? (
                        <div className="py-8 text-center">
                          <ClipboardCheck className="mx-auto h-8 w-8 text-slate-300" />
                          <p className="mt-3 text-sm text-slate-500">
                            No condition records yet.
                          </p>
                        </div>
                      ) : (
                        <div className="mt-4 space-y-3">
                          {conditionLogs.map((log) => (
                            <article
                              key={log.id}
                              className="rounded-xl border border-slate-200 p-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <h4 className="break-words text-sm font-bold text-slate-900">
                                    {getResourceName(log.booking_id)}
                                  </h4>
                                  <p className="mt-1 text-xs font-medium text-teal-700">
                                    {log.stage === 'check_out'
                                      ? 'Before collection'
                                      : log.stage === 'check_in'
                                        ? 'After return'
                                        : log.stage}
                                  </p>
                                </div>
                                <ClipboardCheck className="h-4 w-4 shrink-0 text-teal-600" />
                              </div>

                              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                                {log.notes}
                              </p>

                              <p className="mt-3 text-xs text-slate-400">
                                {formatTimestamp(log.logged_at)}
                              </p>

                              {log.photo_url && (
                                <a
                                  href={log.photo_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-teal-700 underline underline-offset-2 hover:text-teal-900"
                                >
                                  <FileText className="h-4 w-4" />
                                  View condition photo
                                </a>
                              )}
                            </article>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Incident history */}
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-3 border-b border-slate-200 pb-3">
                        <h3 className="font-bold text-slate-900">
                          Incident history
                        </h3>
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">
                          {incidentReports.length}
                        </span>
                      </div>

                      {incidentReports.length === 0 ? (
                        <div className="py-8 text-center">
                          <AlertTriangle className="mx-auto h-8 w-8 text-slate-300" />
                          <p className="mt-3 text-sm text-slate-500">
                            No incidents reported.
                          </p>
                        </div>
                      ) : (
                        <div className="mt-4 space-y-3">
                          {incidentReports.map((incident) => (
                            <article
                              key={incident.id}
                              className="rounded-xl border border-amber-200 bg-amber-50/50 p-4"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <h4 className="break-words text-sm font-bold text-slate-900">
                                    {getResourceName(incident.booking_id)}
                                  </h4>
                                  <p className="mt-1 text-xs font-semibold capitalize text-amber-800">
                                    {incident.severity} severity
                                  </p>
                                </div>

                                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
                              </div>

                              <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                                {incident.description}
                              </p>

                              <p className="mt-3 text-xs text-slate-500">
                                Status: {incident.status || 'Not specified'}
                              </p>
                              <p className="mt-1 text-xs text-slate-400">
                                {formatTimestamp(incident.created_at)}
                              </p>
                            </article>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </section>
              </>
            )}
          </>
        )}

        {/* Rejection dialog */}
        {rejectingBooking && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
              if (
                event.target === event.currentTarget &&
                !isUpdatingStatus
              ) {
                setRejectingBooking(null)
                setRejectionReason('')
              }
            }}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="reject-dialog-title"
              className="my-auto w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <XCircle className="h-5 w-5" />
                  </div>

                  <div>
                    <h2
                      id="reject-dialog-title"
                      className="text-xl font-extrabold text-slate-900"
                    >
                      Reject booking request
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      The student will be able to see your reason.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setRejectingBooking(null)
                    setRejectionReason('')
                  }}
                  disabled={isUpdatingStatus}
                  aria-label="Close dialog"
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6 rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                  Resource
                </p>
                <p className="mt-1 font-bold text-slate-900">
                  {rejectingBooking.resources?.title || 'Untitled resource'}
                </p>
              </div>

              <div className="mt-5">
                <label
                  htmlFor="rejection-reason"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Reason for rejection
                </label>

                <textarea
                  id="rejection-reason"
                  rows={4}
                  value={rejectionReason}
                  onChange={(event) =>
                    setRejectionReason(event.target.value)
                  }
                  placeholder="Explain why this booking cannot be approved..."
                  className={inputClass}
                  required
                />
              </div>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setRejectingBooking(null)
                    setRejectionReason('')
                  }}
                  disabled={isUpdatingStatus}
                  className={secondaryButtonClass}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleConfirmReject}
                  disabled={isUpdatingStatus || !rejectionReason.trim()}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isUpdatingStatus && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                  Confirm rejection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}