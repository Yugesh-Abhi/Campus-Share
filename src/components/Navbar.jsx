
import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  Layers,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  Building,
  Calendar,
  Inbox,
  Compass,
  ArrowUpRight,
} from 'lucide-react'

export default function Navbar({
  onOpenAuth,
  currentView = 'catalog',
  onNavigateView,
}) {
  const { user, profile, logout } = useAuth()

  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true)
      setIsDropdownOpen(false)
      setIsMobileMenuOpen(false)

      await logout()
      onNavigateView?.('catalog')
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setIsLoggingOut(false)
    }
  }

  const handleNavigate = (view) => {
    onNavigateView?.(view)
    setIsDropdownOpen(false)
    setIsMobileMenuOpen(false)
  }

  const displayName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email?.split('@')[0] ||
    'Member'

  const userDepartment =
    profile?.department ||
    user?.user_metadata?.department ||
    'General Campus'

  const userRole = profile?.role || 'student'

  const navItems = [
    { id: 'catalog', label: 'Explore', icon: Compass },
    { id: 'my-bookings', label: 'My Bookings', icon: Calendar },
    { id: 'owner-dashboard', label: 'Owner Dashboard', icon: Inbox },
  ]

  const navButtonClass = (view) =>
    `flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200 ${
      currentView === view
        ? 'bg-teal-500/15 font-bold text-teal-300'
        : 'font-medium text-slate-300 hover:bg-white/10 hover:text-white'
    }`

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-900 text-white shadow-lg shadow-slate-950/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-[72px] items-center justify-between gap-3">
          {/* Brand */}
          <button
            type="button"
            onClick={() => handleNavigate('catalog')}
            className="group flex shrink-0 items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            aria-label="CampusShare home"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-lg shadow-teal-950/30 transition-all duration-200 group-hover:bg-teal-500">
              <Layers className="h-5 w-5" strokeWidth={2.2} />
            </div>

            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight text-white">
                Campus<span className="text-teal-400">Share</span>
              </span>
              <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.19em] text-slate-400">
                Campus Resource Hub
              </span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav
            className="hidden items-center gap-1 rounded-2xl border border-white/10 bg-white/5 p-1.5 md:flex"
            aria-label="Main navigation"
          >
            {navItems
              .filter((item) => item.id === 'catalog' || user)
              .map((item) => {
                const Icon = item.icon

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleNavigate(item.id)}
                    aria-current={currentView === item.id ? 'page' : undefined}
                    className={navButtonClass(item.id)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
          </nav>

          {/* Desktop Account Controls */}
          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((open) => !open)}
                  aria-expanded={isDropdownOpen}
                  className="flex items-center gap-2.5 rounded-2xl border border-white/15 bg-white/5 py-1.5 pl-2 pr-3 transition hover:border-white/25 hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-xs font-bold uppercase text-white">
                    {displayName.charAt(0)}
                  </div>

                  <div className="flex max-w-[125px] flex-col text-left">
                    <span className="truncate text-xs font-bold text-white">
                      {displayName}
                    </span>
                    <span className="truncate text-[11px] text-slate-400">
                      {user.email}
                    </span>
                  </div>

                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isDropdownOpen && (
                  <>
                    <button
                      type="button"
                      aria-label="Close account menu"
                      className="fixed inset-0 z-40 cursor-default"
                      onClick={() => setIsDropdownOpen(false)}
                    />

                    <div className="animate-fadeIn absolute right-0 z-50 mt-3 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl shadow-slate-950/20">
                      <div className="bg-slate-900 px-5 py-4 text-white">
                        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-300">
                          Your account
                        </p>
                        <p className="mt-2 truncate text-sm font-bold">
                          {displayName}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-300">
                          {user.email}
                        </p>
                      </div>

                      <div className="space-y-2 border-b border-slate-100 p-4">
                        <div className="flex items-center gap-2 rounded-xl bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-800">
                          <ShieldCheck className="h-4 w-4 shrink-0" />
                          <span>Role: {userRole}</span>
                        </div>

                        <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
                          <Building className="h-4 w-4 shrink-0" />
                          <span className="truncate">{userDepartment}</span>
                        </div>
                      </div>

                      <div className="p-2">
                        <button
                          type="button"
                          onClick={() => handleNavigate('my-bookings')}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-teal-50 hover:text-teal-800"
                        >
                          <Calendar className="h-4 w-4" />
                          My Booking Requests
                        </button>

                        <button
                          type="button"
                          onClick={() => handleNavigate('owner-dashboard')}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 transition hover:bg-teal-50 hover:text-teal-800"
                        >
                          <Inbox className="h-4 w-4" />
                          Owner Approval Dashboard
                        </button>

                        <button
                          type="button"
                          onClick={handleLogout}
                          disabled={isLoggingOut}
                          className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                        >
                          <LogOut className="h-4 w-4" />
                          {isLoggingOut ? 'Signing out...' : 'Sign out'}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onOpenAuth('login')}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  Sign in
                </button>

                <button
                  type="button"
                  onClick={() => onOpenAuth('signup')}
                  className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal-950/20 transition hover:bg-teal-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                >
                  <Sparkles className="h-4 w-4 text-teal-100" />
                  Get started
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="rounded-xl border border-white/15 p-2.5 text-slate-200 transition hover:border-white/25 hover:bg-white/10 md:hidden"
            aria-label={
              isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'
            }
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="animate-fadeIn space-y-4 border-t border-white/10 py-4 md:hidden">
            <nav className="space-y-1" aria-label="Mobile navigation">
              {navItems
                .filter((item) => item.id === 'catalog' || user)
                .map((item) => {
                  const Icon = item.icon

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNavigate(item.id)}
                      aria-current={currentView === item.id ? 'page' : undefined}
                      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                        currentView === item.id
                          ? 'bg-teal-500/15 font-bold text-teal-300'
                          : 'font-medium text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </button>
                  )
                })}
            </nav>

            <div className="border-t border-white/10 pt-4">
              {user ? (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-white">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-sm font-bold uppercase">
                        {displayName.charAt(0)}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">
                          {displayName}
                        </p>
                        <p className="truncate text-xs text-slate-400">
                          {user.email}
                        </p>
                      </div>

                      <ShieldCheck className="h-5 w-5 shrink-0 text-teal-300" />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-slate-200">
                        Role: {userRole}
                      </span>
                      <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-slate-200">
                        {userDepartment}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/20 disabled:opacity-60"
                  >
                    <LogOut className="h-4 w-4" />
                    {isLoggingOut ? 'Signing out...' : 'Sign out'}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      onOpenAuth('login')
                    }}
                    className="rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                  >
                    Sign in
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      onOpenAuth('signup')
                    }}
                    className="rounded-xl bg-teal-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-teal-500"
                  >
                    Get started
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
