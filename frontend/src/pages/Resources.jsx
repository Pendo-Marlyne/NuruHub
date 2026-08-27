import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookMarked, Filter, Heart, Plus, Search, Star, Upload } from 'lucide-react'
import { resourcesAPI } from '../api/client'
import { useAuth } from '../context/AuthContext'

const TYPE_LABELS = {
  notes: 'Notes', guide: 'Guide', flashcards: 'Flashcards', summary: 'Summary',
  questions: 'Questions', pastpaper: 'Past Paper', reference: 'Reference',
}

export default function Resources() {
  const { user } = useAuth()
  const [resources, setResources] = useState([])
  const [books, setBooks] = useState([])
  const [library, setLibrary] = useState(null)
  const [tab, setTab] = useState('browse')
  const [filters, setFilters] = useState({ search: '', free: '', resource_type: '', university: '' })
  const [showUpload, setShowUpload] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    title: '', description: '', course_code: '', course_name: '', topic: '',
    university: '', resource_type: 'notes', is_free: true, price: 0,
  })
  const [bookForm, setBookForm] = useState({
    title: '', author: '', edition: '', course: '', condition: 'good',
    listing_type: 'lend', location: '', contact_info: '', description: '',
  })

  const loadResources = () => {
    const params = {}
    if (filters.free === 'true') params.free = 'true'
    if (filters.free === 'false') params.free = 'false'
    if (filters.resource_type) params.resource_type = filters.resource_type
    if (filters.university) params.university = filters.university
    if (filters.search) params.search = filters.search
    resourcesAPI.list(params).then((r) => setResources(r.data.results || r.data))
  }

  useEffect(() => { loadResources() }, [filters])
  useEffect(() => {
    resourcesAPI.books().then((r) => setBooks(r.data.results || r.data))
    resourcesAPI.library().then((r) => setLibrary(r.data))
  }, [])

  const handleUpload = async (e) => {
    e.preventDefault()
    await resourcesAPI.create(uploadForm)
    setShowUpload(false)
    loadResources()
  }

  const handleBookListing = async (e) => {
    e.preventDefault()
    await resourcesAPI.createBook(bookForm)
    setBookForm({ title: '', author: '', edition: '', course: '', condition: 'good', listing_type: 'lend', location: '', contact_info: '', description: '' })
    resourcesAPI.books().then((r) => setBooks(r.data.results || r.data))
  }

  const toggleFavorite = async (id) => {
    await resourcesAPI.favorite(id)
    loadResources()
    resourcesAPI.library().then((r) => setLibrary(r.data))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Academic Resources</h1>
          <p className="text-navy-500">Browse, buy, borrow, and share study materials</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => setShowUpload(true)}>
          <Upload className="h-4 w-4" /> Upload Resource
        </button>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-cream-300 dark:border-navy-700">
        {['browse', 'library', 'books'].map((t) => (
          <button key={t} type="button" onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize ${tab === t ? 'border-b-2 border-navy-800 text-navy-800' : 'text-navy-500'}`}>
            {t === 'books' ? 'Physical Books' : t}
          </button>
        ))}
      </div>

      {tab === 'browse' && (
        <>
          <div className="card flex flex-wrap gap-3">
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400" />
              <input className="input pl-10" placeholder="Search resources..." value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
            </div>
            <select className="input w-auto" value={filters.free} onChange={(e) => setFilters({ ...filters, free: e.target.value })}>
              <option value="">All pricing</option>
              <option value="true">Free</option>
              <option value="false">Paid</option>
            </select>
            <select className="input w-auto" value={filters.resource_type} onChange={(e) => setFilters({ ...filters, resource_type: e.target.value })}>
              <option value="">All types</option>
              {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <input className="input w-auto" placeholder="University" value={filters.university}
              onChange={(e) => setFilters({ ...filters, university: e.target.value })} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {resources.map((r) => (
              <div key={r.id} className="card flex flex-col">
                <div className="mb-2 flex items-start justify-between">
                  <span className="rounded-full bg-cream-200 px-2 py-0.5 text-xs font-medium text-primary-700 dark:bg-primary-900/40 dark:text-primary-300">
                    {TYPE_LABELS[r.resource_type] || r.resource_type}
                  </span>
                  <button type="button" onClick={() => toggleFavorite(r.id)}>
                    <Heart className={`h-5 w-5 ${r.is_favorited ? 'fill-red-500 text-red-500' : 'text-navy-400'}`} />
                  </button>
                </div>
                <Link to={`/resources/${r.id}`} className="font-semibold hover:text-navy-800">{r.title}</Link>
                <p className="mt-1 line-clamp-2 text-sm text-navy-500">{r.description}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-navy-500">
                  {r.course_code && <span>{r.course_code}</span>}
                  {r.university && <span>· {r.university}</span>}
                </div>
                <div className="mt-auto flex items-center justify-between pt-4">
                  <div className="flex items-center gap-1">
                    {r.average_rating > 0 && (
                      <><Star className="h-4 w-4 fill-amber-400 text-amber-400" /><span className="text-sm">{r.average_rating.toFixed(1)}</span></>
                    )}
                  </div>
                  <span className={`text-sm font-semibold ${r.is_free ? 'text-accent-600' : 'text-navy-800'}`}>
                    {r.is_free ? 'Free' : `KES ${r.price}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === 'library' && library && (
        <div className="grid gap-6 lg:grid-cols-2">
          {[
            { key: 'purchased', label: 'Purchased', icon: BookMarked },
            { key: 'favorited', label: 'Favourited', icon: Heart },
            { key: 'uploaded', label: 'Uploaded', icon: Upload },
            { key: 'recent', label: 'Recently Accessed', icon: Filter },
          ].map(({ key, label, icon: Icon }) => (
            <div key={key} className="card">
              <div className="mb-3 flex items-center gap-2">
                <Icon className="h-5 w-5 text-navy-800" />
                <h3 className="font-semibold">{label}</h3>
              </div>
              {(library[key] || []).length > 0 ? (
                <ul className="space-y-2">
                  {library[key].map((r) => (
                    <li key={r.id}>
                      <Link to={`/resources/${r.id}`} className="text-sm hover:text-navy-800">{r.title}</Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-navy-500">Nothing here yet.</p>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === 'books' && (
        <div className="grid gap-6 lg:grid-cols-2">
          <form onSubmit={handleBookListing} className="card space-y-3">
            <h3 className="font-semibold">List a Physical Book</h3>
            <input className="input" placeholder="Book title" value={bookForm.title} onChange={(e) => setBookForm({ ...bookForm, title: e.target.value })} required />
            <input className="input" placeholder="Author" value={bookForm.author} onChange={(e) => setBookForm({ ...bookForm, author: e.target.value })} required />
            <input className="input" placeholder="Course" value={bookForm.course} onChange={(e) => setBookForm({ ...bookForm, course: e.target.value })} />
            <select className="input" value={bookForm.listing_type} onChange={(e) => setBookForm({ ...bookForm, listing_type: e.target.value })}>
              <option value="lend">Lend</option>
              <option value="borrow">Borrow (looking for)</option>
              <option value="sell">Sell</option>
            </select>
            <input className="input" placeholder="Pickup location" value={bookForm.location} onChange={(e) => setBookForm({ ...bookForm, location: e.target.value })} />
            <input className="input" placeholder="Contact" value={bookForm.contact_info} onChange={(e) => setBookForm({ ...bookForm, contact_info: e.target.value })} />
            <button type="submit" className="btn-primary">Create Listing</button>
          </form>
          <div className="space-y-3">
            {books.map((b) => (
              <div key={b.id} className="card">
                <div className="flex justify-between">
                  <h3 className="font-semibold">{b.title}</h3>
                  <span className="rounded-full bg-cream-200 px-2 py-0.5 text-xs capitalize dark:bg-navy-800">{b.listing_type}</span>
                </div>
                <p className="text-sm text-navy-500">{b.author} · {b.condition}</p>
                <p className="mt-1 text-sm">{b.course}</p>
                <p className="mt-2 text-xs text-navy-500">{b.location} · {b.contact_info}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {showUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleUpload} className="card max-h-[90vh] w-full max-w-lg overflow-y-auto space-y-3">
            <h2 className="text-lg font-semibold">Upload Resource</h2>
            <input className="input" placeholder="Title" value={uploadForm.title} onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })} required />
            <textarea className="input" placeholder="Description" rows={3} value={uploadForm.description} onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })} required />
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="input" placeholder="Course code" value={uploadForm.course_code} onChange={(e) => setUploadForm({ ...uploadForm, course_code: e.target.value })} />
              <input className="input" placeholder="Course name" value={uploadForm.course_name} onChange={(e) => setUploadForm({ ...uploadForm, course_name: e.target.value })} />
            </div>
            <input className="input" placeholder="Topic" value={uploadForm.topic} onChange={(e) => setUploadForm({ ...uploadForm, topic: e.target.value })} />
            <input className="input" placeholder="University" value={uploadForm.university || user?.university} onChange={(e) => setUploadForm({ ...uploadForm, university: e.target.value })} />
            <select className="input" value={uploadForm.resource_type} onChange={(e) => setUploadForm({ ...uploadForm, resource_type: e.target.value })}>
              {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={uploadForm.is_free} onChange={(e) => setUploadForm({ ...uploadForm, is_free: e.target.checked })} />
              Free resource
            </label>
            {!uploadForm.is_free && (
              <input type="number" className="input" placeholder="Price (KES)" value={uploadForm.price} onChange={(e) => setUploadForm({ ...uploadForm, price: e.target.value })} />
            )}
            <div className="flex gap-2">
              <button type="submit" className="btn-primary">Upload</button>
              <button type="button" className="btn-secondary" onClick={() => setShowUpload(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
