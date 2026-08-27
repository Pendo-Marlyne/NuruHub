import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { resourcesAPI } from '../api/client'

export default function GlobalSearch({ onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query.trim()) {
      setResults(null)
      return
    }
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await resourcesAPI.search(query)
        setResults(res.data)
      } catch {
        setResults(null)
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-navy-950/50 p-4 pt-20">
      <div className="w-full max-w-2xl rounded-xl border border-cream-300 bg-cream-50 shadow-2xl dark:border-navy-600 dark:bg-navy-900">
        <div className="flex items-center gap-3 border-b border-cream-300 px-4 dark:border-navy-700">
          <Search className="h-5 w-5 text-navy-500" />
          <input
            autoFocus
            className="flex-1 bg-transparent py-4 text-sm text-navy-900 outline-none dark:text-cream-100"
            placeholder="Search courses, topics, flashcards, resources..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="button" onClick={onClose} className="text-navy-600 dark:text-cream-300"><X className="h-5 w-5" /></button>
        </div>
        <div className="max-h-96 overflow-y-auto p-4">
          {loading && <p className="text-sm text-navy-500">Searching...</p>}
          {!loading && results && (
            <div className="space-y-4">
              {results.resources?.length > 0 && (
                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase text-navy-500">Resources</h3>
                  {results.resources.map((r) => (
                    <Link key={r.id} to={`/resources/${r.id}`} onClick={onClose} className="block rounded-lg p-2 text-navy-800 hover:bg-cream-200 dark:text-cream-100 dark:hover:bg-navy-800">
                      {r.title}
                    </Link>
                  ))}
                </section>
              )}
              {results.courses?.length > 0 && (
                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase text-navy-500">Courses</h3>
                  {results.courses.map((c) => (
                    <Link key={c.id} to="/courses" onClick={onClose} className="block rounded-lg p-2 text-navy-800 hover:bg-cream-200 dark:text-cream-100 dark:hover:bg-navy-800">
                      {c.code} — {c.name}
                    </Link>
                  ))}
                </section>
              )}
              {results.flashcards?.length > 0 && (
                <section>
                  <h3 className="mb-2 text-xs font-semibold uppercase text-navy-500">Flashcards</h3>
                  {results.flashcards.map((f) => (
                    <Link key={f.id} to="/recall" onClick={onClose} className="block rounded-lg p-2 text-navy-800 hover:bg-cream-200 dark:text-cream-100 dark:hover:bg-navy-800">
                      {f.question}
                    </Link>
                  ))}
                </section>
              )}
              {!results.resources?.length && !results.courses?.length && !results.flashcards?.length && (
                <p className="text-sm text-navy-500">No results found.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
