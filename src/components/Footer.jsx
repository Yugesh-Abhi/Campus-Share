
import React from 'react'
import { Layers, Heart, Shield, ArrowUpRight } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-800 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4 md:gap-8">
          {/* Brand and description */}
          <div className="md:col-span-2">
            <a
              href="#home"
              className="inline-flex items-center gap-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-900"
              aria-label="CampusShare home"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-white shadow-lg shadow-teal-950/30">
                <Layers className="h-5 w-5" />
              </div>

              <span className="text-xl font-extrabold tracking-tight text-white">
                Campus<span className="text-teal-400">Share</span>
              </span>
            </a>

            <p className="mt-4 max-w-md text-sm leading-7 text-slate-400">
              Unlocking underused equipment, laboratories, and creative spaces
              across university campuses. Built for transparent, accountable
              peer resource sharing.
            </p>

            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-teal-800/70 bg-teal-950/50 px-3 py-1.5 text-xs font-medium text-teal-300">
              <span className="h-2 w-2 rounded-full bg-teal-400" />
              Built for campus communities
            </div>
          </div>

          {/* Resource links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-white">
              Resource Hub
            </h4>

            <ul className="mt-5 space-y-3">
              {[
                ['Equipment Catalog', '#equipment'],
                ['Laboratory Workbenches', '#labs'],
                ['Studios & Classrooms', '#spaces'],
                ['Fair-Use Limits', '#rules'],
              ].map(([label, href]) => (
                <li key={label}>
                  <a
                    href={href}
                    className="group inline-flex items-center gap-1.5 text-sm text-slate-400 transition-colors duration-200 hover:text-teal-300 focus:outline-none focus:text-teal-300"
                  >
                    <span>{label}</span>
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Security and policies */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[0.16em] text-white">
              Security & Policy
            </h4>

            <ul className="mt-5 space-y-4 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" />
                <span>Supabase Row-Level Security</span>
              </li>

              <li className="flex items-start gap-2.5">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" />
                <span>Condition Logging & Audits</span>
              </li>

              <li className="flex items-start gap-2.5">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-teal-400" />
                <span>Zero Overlap Scheduling</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-6 text-center sm:flex-row sm:text-left">
          <p className="text-xs leading-5 text-slate-500">
            © {new Date().getFullYear()} CampusShare. 48-Hour Hackathon Project.
          </p>

          <div className="inline-flex items-center gap-2 text-xs text-slate-400">
            
<div className="flex items-center gap-1.5">
  <span>Made with</span>
  <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" />
  <span>by Yugesh &amp; Bhumi for the University Community.</span>
</div>

          </div>
        </div>
      </div>
    </footer>
  )
}
