import React, { useMemo, useState } from 'react'
import {
  Sparkles,
  Search,
  ArrowRight,
  MapPin,
  ShieldCheck,
  MessageCircle,
  X,
  Bot,
  Lightbulb,
} from 'lucide-react'

function getMatchScore(resource, query) {
  const text = [
    resource.title,
    resource.category,
    resource.description,
    resource.location,
    resource.allowed_departments,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  const words = query
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2)

  if (!words.length) return 0

  const title = (resource.title || '').toLowerCase()
  const category = (resource.category || '').toLowerCase()
  const description = (resource.description || '').toLowerCase()
  const location = (resource.location || '').toLowerCase()

  let score = 0

  for (const word of words) {
    if (title.includes(word)) score += 5
    else if (category.includes(word)) score += 4
    else if (description.includes(word)) score += 2
    else if (location.includes(word)) score += 2
    else if (text.includes(word)) score += 1
  }

  return score
}

function explainMatch(resource, query) {
  const queryWords = query
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2)

  const title = (resource.title || '').toLowerCase()
  const category = (resource.category || '').toLowerCase()
  const description = (resource.description || '').toLowerCase()
  const location = (resource.location || '').toLowerCase()

  const reasons = []

  if (queryWords.some((word) => title.includes(word))) {
    reasons.push('Matches your requested resource')
  } else if (queryWords.some((word) => category.includes(word))) {
    reasons.push('Matches the requested category')
  } else if (queryWords.some((word) => description.includes(word))) {
    reasons.push('Matches your described needs')
  }

  if (queryWords.some((word) => location.includes(word))) {
    reasons.push('Matches your location preference')
  }

  if (resource.requires_approval) {
    reasons.push('Owner approval required')
  }

  if (!reasons.length) {
    reasons.push('Related to your search')
  }

  return reasons
}

export default function AIResourceAssistant({
  resources = [],
  onSelectResource,
}) {
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [showAssistant, setShowAssistant] = useState(true)

  const recommendations = useMemo(() => {
    if (!submittedQuery.trim()) return []

    return resources
      .filter((resource) => resource.is_active !== false)
      .map((resource) => ({
        resource,
        score: getMatchScore(resource, submittedQuery),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4)
  }, [resources, submittedQuery])

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!query.trim()) return

    setSubmittedQuery(query.trim())
  }

  const exampleQueries = [
    'I need a camera for a college project',
    'Find a laboratory for research',
    'I need a room for a team meeting',
  ]

  return (
    <section
      aria-labelledby="ai-resource-assistant-title"
      className="mt-8 overflow-hidden rounded-3xl border border-teal-200 bg-white shadow-sm"
    >
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-teal-900 p-5 text-white sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl border border-white/15 bg-white/10 p-3">
              <Sparkles className="h-6 w-6 text-teal-300" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3
                  id="ai-resource-assistant-title"
                  className="text-xl font-extrabold sm:text-2xl"
                >
                  AI Resource Assistant
                </h3>

                <span className="rounded-full border border-teal-300/30 bg-teal-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-teal-200">
                  Smart matching
                </span>
              </div>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                Describe what you need. CampusShare will search its active
                listings and recommend relevant resources.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAssistant((current) => !current)}
            aria-label={showAssistant ? 'Collapse assistant' : 'Expand assistant'}
            className="rounded-xl p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            {showAssistant ? (
              <X className="h-5 w-5" />
            ) : (
              <MessageCircle className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {showAssistant && (
        <div className="p-5 sm:p-7">
          <form onSubmit={handleSubmit}>
            <label
              htmlFor="ai-resource-query"
              className="mb-2 block text-sm font-bold text-slate-800"
            >
              What resource are you looking for?
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                <input
                  id="ai-resource-query"
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="e.g. I need a camera for my college project"
                  maxLength={300}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:ring-4 focus:ring-teal-600/10"
                />
              </div>

              <button
                type="submit"
                disabled={!query.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-700 px-5 py-4 text-sm font-bold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Find resources
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>

          {!submittedQuery && (
            <div className="mt-5">
              <p className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Lightbulb className="h-4 w-4 text-teal-700" />
                Try an example
              </p>

              <div className="flex flex-wrap gap-2">
                {exampleQueries.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => {
                      setQuery(example)
                      setSubmittedQuery(example)
                    }}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs font-medium text-slate-600 transition hover:border-teal-300 hover:bg-teal-50 hover:text-teal-800"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}

          {submittedQuery && (
            <div className="mt-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-teal-800">
                    Recommended resources
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Based on your request: "{submittedQuery}"
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setQuery('')
                    setSubmittedQuery('')
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-teal-800"
                >
                  Clear results
                </button>
              </div>

              {recommendations.length === 0 ? (
                <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                  <Bot className="mx-auto h-8 w-8 text-slate-400" />

                  <p className="mt-3 font-bold text-slate-800">
                    No matching active resources found
                  </p>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Try another resource name, category, or description.
                    You can also browse the complete catalog below.
                  </p>
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {recommendations.map(({ resource, score }) => (
                    <article
                      key={resource.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-teal-300 hover:shadow-sm sm:p-5"
                    >
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="break-words font-extrabold text-slate-900">
                              {resource.title}
                            </h4>

                            {score >= 5 && (
                              <span className="rounded-full bg-teal-50 px-2 py-1 text-[10px] font-bold text-teal-800">
                                Strong text match
                              </span>
                            )}
                          </div>

                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            {resource.category || 'General resource'}
                          </p>

                          <p className="mt-3 flex items-start gap-2 text-sm text-slate-600">
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
                            {resource.location || 'Location not specified'}
                          </p>

                          <p className="mt-3 text-sm leading-6 text-slate-600">
                            {resource.description ||
                              'No description provided.'}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {explainMatch(resource, submittedQuery).map(
                              (reason) => (
                                <span
                                  key={reason}
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700"
                                >
                                  <ShieldCheck className="h-3.5 w-3.5 text-teal-700" />
                                  {reason}
                                </span>
                              )
                            )}
                          </div>

                          <p className="mt-3 text-xs leading-5 text-slate-500">
                            Department access:{' '}
                            {resource.allowed_departments || 'Check owner requirements'}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => onSelectResource?.(resource)}
                          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-teal-700"
                        >
                          Request resource
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              <p className="mt-4 text-xs leading-5 text-slate-400">
                These are text-based recommendations, not verified availability
                results. Check the booking process and resource requirements
                before submitting a request.
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  )
}