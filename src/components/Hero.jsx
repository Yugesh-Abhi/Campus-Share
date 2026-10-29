
import React from 'react'
import {
  ArrowRight,
  Camera,
  Microscope,
  DoorOpen,
  ShieldCheck,
  Search,
  CheckCircle2,
  CalendarCheck,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  CircleCheck,
  Layers3,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const resourceTypes = [
  {
    title: 'Equipment',
    description: 'Cameras, electronics and project equipment',
    icon: Camera,
    color: 'bg-teal-50 text-teal-700',
  },
  {
    title: 'Laboratories',
    description: 'Shared facilities and research equipment',
    icon: Microscope,
    color: 'bg-blue-50 text-blue-700',
  },
  {
    title: 'Spaces & Studios',
    description: 'Rooms, studios and collaborative spaces',
    icon: DoorOpen,
    color: 'bg-violet-50 text-violet-700',
  },
]

const steps = [
  {
    number: '01',
    title: 'Discover',
    description: 'Find the campus resources you need.',
    icon: Search,
  },
  {
    number: '02',
    title: 'Request',
    description: 'Submit a booking request for your resource.',
    icon: CalendarCheck,
  },
  {
    number: '03',
    title: 'Collect',
    description: 'Get approval and record the initial condition.',
    icon: CheckCircle2,
  },
  {
    number: '04',
    title: 'Return',
    description: 'Complete check-in and record the final condition.',
    icon: RefreshCw,
  },
]

const benefits = [
  {
    title: 'Make better use of resources',
    description:
      'Help campus communities discover equipment and spaces that might otherwise remain underused.',
  },
  {
    title: 'Support fair access',
    description:
      'Keep booking requests and approval policies visible so access can be managed more consistently.',
  },
  {
    title: 'Encourage accountability',
    description:
      'Record resource condition at checkout and return, with a way to report incidents when necessary.',
  },
]

export default function Hero({ onOpenAuth }) {
  const { user } = useAuth()

  const scrollToCatalog = () => {
    document.getElementById('catalog')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  return (
    <>
      {/* HERO SECTION */}
      <section className="relative isolate overflow-hidden border-b border-slate-800 bg-slate-950 text-white">
        {/* Decorative background */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-teal-500/20 blur-3xl" />
          <div className="absolute -left-32 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-blue-500/15 blur-3xl" />
          <div className="absolute bottom-0 left-1/2 h-40 w-96 -translate-x-1/2 rounded-full bg-teal-400/10 blur-3xl" />
        </div>

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
          {/* Left: Main messaging */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-3.5 py-2 text-xs font-bold text-teal-300 shadow-sm">
              <Sparkles className="h-4 w-4" />
              A smarter way to share campus resources
            </div>

            <h1 className="mt-6 max-w-2xl text-4xl font-extrabold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-[3.75rem]">
              Great resources.
              <span className="mt-2 block text-teal-400">
                Shared opportunities.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
              Discover and reserve underused campus equipment, laboratories,
              and spaces—all through one transparent platform designed for
              responsible sharing and better resource utilization.
            </p>

            {/* Main actions */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={scrollToCatalog}
                className="group inline-flex items-center justify-center gap-2 rounded-xl bg-teal-400 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-teal-950/20 transition duration-200 hover:-translate-y-0.5 hover:bg-teal-300 hover:shadow-teal-900/30 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                Explore resources
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>

              {!user && (
                <button
                  type="button"
                  onClick={() => onOpenAuth('signup')}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-white/5 px-6 py-3.5 text-sm font-bold text-white transition duration-200 hover:-translate-y-0.5 hover:border-teal-400/60 hover:bg-teal-400/10 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-offset-2 focus:ring-offset-slate-950"
                >
                  Create an account
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Trust indicators */}
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t border-slate-800 pt-6 text-sm text-slate-300">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-teal-400" />
                Accountable sharing
              </span>

              <span className="inline-flex items-center gap-2">
                <CircleCheck className="h-4 w-4 text-teal-400" />
                Transparent booking
              </span>
            </div>

            {/* Small feature highlights */}
            <div className="mt-7 flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300">
                <Layers3 className="h-4 w-4 text-teal-400" />
                Shared inventory
              </span>

              <span className="inline-flex items-center gap-2 rounded-lg border border-slate-800 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-300">
                <CalendarCheck className="h-4 w-4 text-teal-400" />
                Simple requests
              </span>
            </div>
          </div>

          {/* Right: Resource overview card */}
          <div className="relative mx-auto w-full max-w-lg lg:ml-auto">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-teal-400/20 via-blue-500/10 to-transparent blur-2xl" />

            <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl shadow-black/20">
              {/* Card header */}
              <div className="border-b border-slate-100 p-5 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.18em] text-teal-700">
                      <span className="h-2 w-2 rounded-full bg-teal-500" />
                      CampusShare
                    </div>

                    <h2 className="mt-3 text-xl font-extrabold tracking-tight text-slate-950 sm:text-2xl">
                      Your campus, better connected.
                    </h2>

                    <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                      One place to discover and manage shared resources.
                    </p>
                  </div>

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-teal-300 shadow-lg shadow-slate-900/10">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                </div>

                {/* Mini indicators */}
                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-100 bg-teal-50 px-3 py-1.5 text-[11px] font-bold text-teal-800">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Organized
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-bold text-slate-600">
                    <CalendarCheck className="h-3.5 w-3.5" />
                    Easy to request
                  </span>
                </div>
              </div>

              {/* Resource categories */}
              <div className="p-5 sm:p-7">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-950">
                      Explore categories
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Find what you need for your next project.
                    </p>
                  </div>

                  <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Resources
                  </span>
                </div>

                <div className="space-y-3">
                  {resourceTypes.map((resource) => {
                    const Icon = resource.icon

                    return (
                      <button
                        key={resource.title}
                        type="button"
                        onClick={scrollToCatalog}
                        className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition duration-200 hover:border-teal-300 hover:bg-teal-50/50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                      >
                        <div
                          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${resource.color}`}
                        >
                          <Icon className="h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-bold text-slate-900">
                            {resource.title}
                          </h3>

                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {resource.description}
                          </p>
                        </div>

                        <ArrowRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-teal-700" />
                      </button>
                    )
                  })}
                </div>

                {/* Responsible sharing callout */}
                <div className="mt-5 flex items-start gap-3 rounded-2xl bg-slate-950 p-4 text-white">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10">
                    <ShieldCheck className="h-5 w-5 text-teal-300" />
                  </div>

                  <div>
                    <p className="text-sm font-bold">
                      Built for responsible sharing
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-300">
                      Booking records, condition tracking, and incident
                      reporting support greater accountability.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating feature label */}
            <div className="absolute -bottom-5 -left-3 hidden items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-xl shadow-black/10 sm:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <RefreshCw className="h-4 w-4" />
              </div>

              <div>
                <p className="text-xs font-bold text-slate-800">
                  Complete resource lifecycle
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Request · Collect · Return
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="relative overflow-hidden bg-slate-50 py-16 text-slate-900 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section heading */}
          <div className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-teal-800 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Simple and transparent
            </span>

            <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
              From discovery to return
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              A clear process helps students access resources while supporting
              responsible use and reliable condition records.
            </p>
          </div>

          {/* Steps */}
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => {
              const Icon = step.icon

              return (
                <article
                  key={step.number}
                  className="group relative rounded-2xl border border-slate-200 bg-white p-6 transition duration-200 hover:-translate-y-1 hover:border-teal-300 hover:shadow-xl hover:shadow-slate-900/[0.04]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700 transition-colors group-hover:bg-teal-600 group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </div>

                    <span className="text-3xl font-extrabold tracking-tight text-slate-200 transition-colors group-hover:text-teal-100">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mt-6 text-lg font-extrabold text-slate-950">
                    {step.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {step.description}
                  </p>

                  <div className="mt-5 h-1 w-10 rounded-full bg-teal-200 transition-all duration-200 group-hover:w-16 group-hover:bg-teal-600" />
                </article>
              )
            })}
          </div>

          {/* Benefits */}
          <div className="mt-14">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">
                Why CampusShare?
              </p>

              <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                Better sharing. Better campus experiences.
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {benefits.map((benefit, index) => (
                <article
                  key={benefit.title}
                  className="rounded-2xl border border-slate-200 bg-white p-6 transition duration-200 hover:border-teal-200 hover:shadow-lg hover:shadow-slate-900/[0.03]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-sm font-extrabold text-teal-800">
                    0{index + 1}
                  </div>

                  <h4 className="mt-5 text-base font-extrabold text-slate-950">
                    {benefit.title}
                  </h4>

                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {benefit.description}
                  </p>
                </article>
              ))}
            </div>
          </div>

          {/* Final call to action */}
          <div className="relative mt-14 overflow-hidden rounded-3xl bg-slate-950 p-7 text-white shadow-xl shadow-slate-900/10 sm:p-10 lg:p-12">
            <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full bg-teal-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-teal-300">
                  <Sparkles className="h-4 w-4" />
                  Make your next idea happen
                </span>

                <h2 className="mt-4 text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
                  Have a project in mind?
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
                  Explore the campus inventory and find the resources that can
                  help bring your next idea to life.
                </p>
              </div>

              <button
                type="button"
                onClick={scrollToCatalog}
                className="group inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-teal-400 px-6 py-3.5 text-sm font-extrabold text-slate-950 transition duration-200 hover:-translate-y-0.5 hover:bg-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:ring-offset-2 focus:ring-offset-slate-950"
              >
                Browse resources
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
