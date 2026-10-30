import AIResourceAssistant from './AIResourceAssistant'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Search,
  CheckCircle,
  MapPin,
  ShieldCheck,
  Calendar,
  AlertTriangle,
  RefreshCw,
  Camera,
  Microscope,
  DoorOpen,
  PackageOpen,
  Sparkles,
  Layers,
  Info,
  SlidersHorizontal,
  ArrowUpRight,
  Clock3,
  Building2,
  X,
  ArrowRight,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

const categoryTabs = [
  { id: 'all', label: 'All resources', icon: Layers },
  { id: 'equipment', label: 'Equipment', icon: Camera },
  { id: 'lab', label: 'Laboratories', icon: Microscope },
  { id: 'space', label: 'Spaces & Studios', icon: DoorOpen },
]

function getCategoryMeta(rawCategory) {
  const category = (rawCategory || '').toLowerCase()

  if (
    category.includes('equip') ||
    category.includes('cam') ||
    category.includes('device')
  ) {
    return {
      label: 'Equipment',
      icon: Camera,
      color: 'text-teal-700',
      background: 'bg-teal-50',
      gradient: 'from-slate-950 via-slate-900 to-teal-900',
    }
  }

  if (
    category.includes('lab') ||
    category.includes('research') ||
    category.includes('bench')
  ) {
    return {
      label: 'Laboratory',
      icon: Microscope,
      color: 'text-blue-700',
      background: 'bg-blue-50',
      gradient: 'from-slate-950 via-slate-900 to-blue-900',
    }
  }

  if (
    category.includes('space') ||
    category.includes('room') ||
    category.includes('studio')
  ) {
    return {
      label: 'Space & Studio',
      icon: DoorOpen,
      color: 'text-violet-700',
      background: 'bg-violet-50',
      gradient: 'from-slate-950 via-slate-900 to-violet-900',
    }
  }

  return {
    label: rawCategory || 'General Resource',
    icon: Building2,
    color: 'text-slate-700',
    background: 'bg-slate-100',
    gradient: 'from-slate-950 to-slate-800',
  }
}

function matchesCategory(resource, tab) {
  const category = (resource.category || '').toLowerCase()

  if (tab === 'equipment') {
    return (
      category.includes('equip') ||
      category.includes('cam') ||
      category.includes('device')
    )
  }

  if (tab === 'lab') {
    return (
      category.includes('lab') ||
      category.includes('research') ||
      category.includes('bench')
    )
  }

  if (tab === 'space') {
    return (
      category.includes('space') ||
      category.includes('room') ||
      category.includes('studio')
    )
  }

  return true
}

function ResourceCard({ resource, user, onBook }) {
  const meta = getCategoryMeta(resource.category)
  const CategoryIcon = meta.icon
  const isActive = resource.is_active !== false

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-teal-300 hover:shadow-xl hover:shadow-slate-900/10">
      {/* Card header */}
      <div
        className={`relative flex h-40 flex-col justify-between overflow-hidden bg-gradient-to-br ${meta.gradient} p-5 text-white`}
      >
        <div className="absolute -right-6 -top-8 h-40 w-40 rounded-full border border-white/10" />
        <div className="absolute right-2 top-8 h-24 w-24 rounded-full border border-white/10" />

        <CategoryIcon className="absolute -bottom-5 -right-3 h-32 w-32 text-white/[0.07] transition-transform duration-500 group-hover:scale-110" />

        <div className="relative z-10 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur-sm">
            <CategoryIcon className="h-3.5 w-3.5" />
            {meta.label}
          </span>

          <span
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-bold ${
              isActive
                ? 'border-teal-300/20 bg-teal-400/15 text-teal-100'
                : 'border-amber-300/20 bg-amber-400/15 text-amber-100'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isActive ? 'bg-teal-300' : 'bg-amber-300'
              }`}
            />
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        <div className="relative z-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
            CAMPUSSHARE
          </p>
          <p className="mt-1 text-sm font-semibold text-white/90">
            {resource.category || 'General resource'}
          </p>
        </div>
      </div>

      {/* Card content */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex-1">
          <h3 className="break-words text-lg font-extrabold leading-snug text-slate-950 transition-colors group-hover:text-teal-800">
            {resource.title || 'Untitled resource'}
          </h3>

          <div className="mt-3 flex items-start gap-2 text-sm text-slate-500">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
            <span className="break-words leading-5">
              {resource.location || 'Location not specified'}
            </span>
          </div>

          <p className="mt-4 line-clamp-3 break-words text-sm leading-6 text-slate-600">
            {resource.description ||
              'Contact the resource owner for more information about this listing.'}
          </p>
        </div>

        <div className="mt-5 space-y-3 border-t border-slate-100 pt-4">
          <div className="flex items-start justify-between gap-3">
            <span className="text-xs text-slate-500">Department access</span>

            <span
              className="max-w-[65%] break-words rounded-lg bg-slate-100 px-2.5 py-1 text-right text-[11px] font-semibold text-slate-700"
              title={resource.allowed_departments || 'All Departments'}
            >
              {resource.allowed_departments || 'All Departments'}
            </span>
          </div>

          <div className="flex items-start justify-between gap-3">
            <span className="text-xs text-slate-500">Booking policy</span>

            <span className="inline-flex items-center gap-1.5 text-right text-xs font-semibold text-slate-700">
              {resource.requires_approval ? (
                <>
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-teal-700" />
                  Approval required
                </>
              ) : (
                <>
                  <Clock3 className="h-3.5 w-3.5 shrink-0 text-teal-700" />
                  Standard request
                </>
              )}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onBook(resource)}
            disabled={!isActive}
            className={`mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition focus:outline-none focus:ring-4 focus:ring-teal-600/15 ${
              isActive
                ? 'bg-slate-950 text-white shadow-sm hover:bg-teal-700'
                : 'cursor-not-allowed bg-slate-100 text-slate-400'
            }`}
          >
            <Calendar className="h-4 w-4" />

            <span>
              {!isActive
                ? 'Currently inactive'
                : user
                  ? 'Request to book'
                  : 'Sign in to reserve'}
            </span>

            {isActive && <ArrowUpRight className="ml-auto h-4 w-4" />}
          </button>

          <p className="flex items-start justify-center gap-1.5 text-center text-[11px] leading-5 text-slate-400">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {resource.requires_approval
              ? 'Booking is subject to approval.'
              : 'Follow the booking process after selection.'}
          </p>
        </div>
      </div>
    </article>
  )
}

export default function ResourceCatalog({
  onOpenAuth,
  onSelectResourceToBook,
}) {
  const { user } = useAuth()

  const [resources, setResources] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [fetchError, setFetchError] = useState(null)

  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [availabilityFilter, setAvailabilityFilter] = useState('all')
  const [showSeedHelper, setShowSeedHelper] = useState(false)

  const fetchResources = useCallback(async (manualRefresh = false) => {
    if (manualRefresh) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }

    setFetchError(null)

    if (!isSupabaseConfigured || !supabase) {
      setFetchError(
        'Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local.'
      )
      setIsLoading(false)
      setIsRefreshing(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('resources')
        .select(
          'id, title, category, description, location, is_active, requires_approval, allowed_departments, owner_id, created_at'
        )
        .order('created_at', { ascending: false })

      if (error) throw error

      setResources(data || [])
    } catch (error) {
      console.error('[ResourceCatalog] Error fetching resources:', error)
      setFetchError(
        error.message || 'Failed to load resources from the database.'
      )
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchResources()
  }, [fetchResources])

  const filteredResources = resources.filter((resource) => {
    const query = searchQuery.trim().toLowerCase()

    const searchableText = [
      resource.title,
      resource.category,
      resource.location,
      resource.description,
      resource.allowed_departments,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    const matchesSearch = searchableText.includes(query)

    const matchesAvailability =
      availabilityFilter === 'all' || resource.is_active !== false

    return (
      matchesCategory(resource, activeTab) &&
      matchesSearch &&
      matchesAvailability
    )
  })

  const counts = {
    all: resources.length,
    equipment: resources.filter((resource) =>
      matchesCategory(resource, 'equipment')
    ).length,
    lab: resources.filter((resource) =>
      matchesCategory(resource, 'lab')
    ).length,
    space: resources.filter((resource) =>
      matchesCategory(resource, 'space')
    ).length,
  }

  const availableCount = resources.filter(
    (resource) => resource.is_active !== false
  ).length

  const handleBookingClick = (resource) => {
    if (resource.is_active === false) return

    if (!user) {
      onOpenAuth?.('login')
      return
    }

    onSelectResourceToBook?.(resource)
  }

  const resetFilters = () => {
    setActiveTab('all')
    setSearchQuery('')
    setAvailabilityFilter('all')
  }

  const hasActiveFilters =
    Boolean(searchQuery) ||
    activeTab !== 'all' ||
    availabilityFilter !== 'all'

  return (
    <section
      id="catalog"
      className="scroll-mt-24 bg-slate-50 py-16 text-slate-900 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section introduction */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-3 py-1.5 text-xs font-bold text-teal-800 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              YOUR CAMPUS. SHARED.
            </div>

            <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              Find what you need.
              <span className="mt-2 block text-teal-700">
                Make something happen.
              </span>
            </h2>

            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
              Discover equipment, laboratory facilities, and collaborative
              spaces across campus. Find the right resource and send a booking
              request in just a few steps.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium text-slate-500">
              <span className="inline-flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-teal-700" />
                One campus community
              </span>

              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-teal-700" />
                Approval-aware booking
              </span>
            </div>
          </div>

          {/* Inventory statistics */}
          <div className="grid grid-cols-2 gap-3 sm:min-w-[340px]">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-200 hover:shadow-md">
              <div className="flex items-center gap-2 text-slate-500">
                <div className="rounded-lg bg-teal-50 p-2">
                  <Layers className="h-4 w-4 text-teal-700" />
                </div>

                <span className="text-xs font-semibold">Total resources</span>
              </div>

              <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950">
                {isLoading ? '—' : resources.length}
              </p>

              <p className="mt-1 text-xs text-slate-500">In the inventory</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-teal-200 hover:shadow-md">
              <div className="flex items-center gap-2 text-slate-500">
                <div className="rounded-lg bg-teal-50 p-2">
                  <CheckCircle className="h-4 w-4 text-teal-700" />
                </div>

                <span className="text-xs font-semibold">Active listings</span>
              </div>

              <p className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950">
                {isLoading ? '—' : availableCount}
              </p>

              <p className="mt-1 text-xs text-slate-500">Ready to explore</p>
            </div>
          </div>
        </div>

        {/* Search and filters */}
       {/* AI Resource Assistant */}
<div className="mt-10">
  <AIResourceAssistant
    resources={resources}
    onSelectResource={handleBookingClick}
  />
</div>

{/* Search and filters */}
<div className="mt-6 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
  <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search resources, categories, locations..."
                aria-label="Search campus resources"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-600/10"
              />

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <label className="relative flex min-w-0 flex-1 items-center sm:flex-none">
                <SlidersHorizontal className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-500" />

                <select
                  value={availabilityFilter}
                  onChange={(event) =>
                    setAvailabilityFilter(event.target.value)
                  }
                  aria-label="Filter by listing status"
                  className="w-full appearance-none rounded-2xl border border-slate-200 bg-white py-3.5 pl-10 pr-9 text-sm font-medium text-slate-700 outline-none transition hover:bg-slate-50 focus:border-teal-600 focus:ring-4 focus:ring-teal-600/10 sm:w-auto"
                >
                  <option value="all">All statuses</option>
                  <option value="available">Active only</option>
                </select>
              </label>

              <button
                type="button"
                onClick={() => fetchResources(true)}
                disabled={isLoading || isRefreshing}
                title="Refresh inventory"
                aria-label="Refresh inventory"
                className="inline-flex shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-slate-700 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    isRefreshing ? 'animate-spin text-teal-700' : ''
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Category navigation */}
          <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-5">
            {categoryTabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  aria-pressed={isActive}
                  className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 sm:text-sm ${
                    isActive
                      ? 'border-slate-950 bg-slate-950 text-white shadow-md shadow-slate-900/10'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-teal-200 hover:bg-teal-50/50 hover:text-teal-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>

                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] ${
                      isActive
                        ? 'bg-white/15 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {counts[tab.id]}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Results heading */}
        {!isLoading && !fetchError && resources.length > 0 && (
          <div className="flex flex-wrap items-end justify-between gap-3 py-7">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-teal-800">
                CAMPUS INVENTORY
              </p>

              <h3 className="mt-2 text-xl font-extrabold text-slate-950">
                {activeTab === 'all'
                  ? 'Explore resources'
                  : categoryTabs.find((tab) => tab.id === activeTab)?.label}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Showing{' '}
                <span className="font-semibold text-slate-800">
                  {filteredResources.length}
                </span>{' '}
                of {resources.length} resources
              </p>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 transition hover:border-teal-200 hover:bg-teal-50 hover:text-teal-800"
              >
                <X className="h-3.5 w-3.5" />
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="mt-8">
            <div className="mb-5 flex items-center justify-center gap-2 text-sm text-slate-500">
              <RefreshCw className="h-4 w-4 animate-spin text-teal-700" />
              Loading campus inventory...
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((number) => (
                <div
                  key={number}
                  className="animate-pulse overflow-hidden rounded-3xl border border-slate-200 bg-white"
                >
                  <div className="h-40 bg-slate-200" />

                  <div className="space-y-4 p-5">
                    <div className="h-4 w-2/3 rounded bg-slate-200" />
                    <div className="h-3 w-1/2 rounded bg-slate-100" />
                    <div className="h-3 rounded bg-slate-100" />
                    <div className="h-10 rounded-xl bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error state */}
        {!isLoading && fetchError && (
          <div className="mt-8 rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <AlertTriangle className="h-7 w-7" />
            </div>

            <h3 className="mt-5 text-lg font-bold text-slate-950">
              We couldn't load the inventory
            </h3>

            <p className="mx-auto mt-2 max-w-lg break-words text-sm leading-6 text-slate-600">
              {fetchError}
            </p>

            <button
              type="button"
              onClick={() => fetchResources(true)}
              disabled={isRefreshing}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-700 disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              Try again
            </button>
          </div>
        )}

        {/* Empty inventory state */}
        {!isLoading && !fetchError && resources.length === 0 && (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white px-5 py-12 text-center shadow-sm sm:px-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-800">
              <PackageOpen className="h-8 w-8" />
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-teal-800">
              Inventory awaiting listings
            </p>

            <h3 className="mt-2 text-2xl font-extrabold text-slate-950">
              Your campus inventory starts here.
            </h3>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-600">
              The resources table returned no records. Add approved campus
              listings to Supabase, then refresh to see them here.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => fetchResources(true)}
                disabled={isRefreshing}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-700 disabled:opacity-60"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    isRefreshing ? 'animate-spin' : ''
                  }`}
                />
                Refresh inventory
              </button>

              <button
                type="button"
                onClick={() => setShowSeedHelper((show) => !show)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
              >
                <Info className="h-4 w-4" />
                {showSeedHelper ? 'Hide SQL guide' : 'View demo SQL guide'}
              </button>
            </div>

            {showSeedHelper && (
              <div className="mx-auto mt-8 max-w-3xl rounded-2xl bg-slate-950 p-5 text-left text-white sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
                  <h4 className="flex items-center gap-2 text-sm font-bold">
                    <Sparkles className="h-4 w-4 text-teal-300" />
                    Optional demo inventory
                  </h4>

                  <span className="text-xs text-slate-400">
                    Supabase SQL Editor
                  </span>
                </div>

                <p className="mt-4 text-xs leading-6 text-slate-300">
                  These are sample records for a demo. Only run this query if
                  you want to add them to your database and have permission to
                  do so.
                </p>

                <pre className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-black/20 p-4 text-xs leading-6 text-teal-200">
{`INSERT INTO public.resources
  (title, category, location, description, is_active, requires_approval, allowed_departments)
VALUES
  ('Camera Kit', 'equipment', 'Media Room', 'Camera kit for student projects', true, true, 'All Departments'),
  ('Research Lab', 'lab', 'Engineering Building', 'Shared research facility', true, true, 'Engineering'),
  ('Project Studio', 'space', 'Student Centre', 'Collaborative project workspace', true, false, 'All Departments');`}
                </pre>

                <p className="mt-3 text-xs leading-5 text-slate-400">
                  Check your table constraints and required columns before
                  running sample SQL.
                </p>
              </div>
            )}
          </div>
        )}

        {/* No matching results */}
        {!isLoading &&
          !fetchError &&
          resources.length > 0 &&
          filteredResources.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                <Search className="h-6 w-6" />
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-950">
                No matching resources found
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Try another search term or adjust your category and status
                filters.
              </p>

              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-teal-700"
              >
                Reset filters
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

        {/* Resource cards */}
        {!isLoading && !fetchError && filteredResources.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                user={user}
                onBook={handleBookingClick}
              />
            ))}
          </div>
        )}

        {/* Footer note */}
        {!isLoading && !fetchError && resources.length > 0 && (
          <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:px-6">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-teal-50 p-2.5 text-teal-800">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div>
                <p className="text-sm font-bold text-slate-900">
                  Share responsibly. Create opportunities.
                </p>

                <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500">
                  Check department eligibility and approval requirements
                  before submitting a booking request.
                </p>
              </div>
            </div>

            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-800">
              <CheckCircle className="h-4 w-4" />
              Inventory connected
            </span>
          </div>
        )}
      </div>
    </section>
  )
}
