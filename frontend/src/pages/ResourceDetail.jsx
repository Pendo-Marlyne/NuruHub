import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Download, Flag, ShoppingCart, Star } from 'lucide-react'
import { resourcesAPI } from '../api/client'
import { useAuth } from '../context/AuthContext'

export default function ResourceDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const [resource, setResource] = useState(null)
  const [reviews, setReviews] = useState([])
  const [phone, setPhone] = useState(user?.phone_number || '')
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      resourcesAPI.get(id),
      resourcesAPI.reviews(id),
    ]).then(([r, rev]) => {
      setResource(r.data)
      setReviews(rev.data.results || rev.data)
    }).finally(() => setLoading(false))
  }, [id])

  const handlePurchase = async () => {
    setMessage('')
    try {
      const res = await resourcesAPI.purchase({ resource_id: +id, phone_number: phone })
      setMessage(res.data.message + (res.data.simulated ? ' (Simulated — configure M-Pesa for live payments)' : ''))
      const r = await resourcesAPI.get(id)
      setResource(r.data)
    } catch (err) {
      setMessage(err.response?.data?.error || 'Payment failed.')
    }
  }

  const handleDownload = async () => {
    try {
      const res = await resourcesAPI.download(id)
      if (res.data.file_url) window.open(res.data.file_url, '_blank')
    } catch (err) {
      setMessage(err.response?.data?.error || 'Download not available.')
    }
  }

  const submitReview = async (e) => {
    e.preventDefault()
    await resourcesAPI.createReview(id, reviewForm)
    const rev = await resourcesAPI.reviews(id)
    setReviews(rev.data.results || rev.data)
    setReviewForm({ rating: 5, comment: '' })
  }

  const reportResource = async () => {
    const reason = prompt('Reason for report:')
    if (reason) {
      await resourcesAPI.report({ resource: +id, reason })
      setMessage('Report submitted. An admin will review it.')
    }
  }

  if (loading) return <div className="flex h-64 items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-cream-300 border-t-navy-800" /></div>
  if (!resource) return <p>Resource not found.</p>

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="card">
        <div className="mb-2 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{resource.title}</h1>
            <p className="text-navy-500">by {resource.author_name}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${resource.is_free ? 'bg-accent-100 text-accent-700' : 'bg-cream-200 text-navy-800'}`}>
            {resource.is_free ? 'Free' : `KES ${resource.price}`}
          </span>
        </div>
        <p className="mt-4 text-navy-600 dark:text-cream-300">{resource.description}</p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-navy-500">
          {resource.course_code && <span>{resource.course_code}</span>}
          {resource.university && <span>{resource.university}</span>}
          {resource.topic && <span>{resource.topic}</span>}
          {resource.average_rating > 0 && (
            <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{resource.average_rating.toFixed(1)} ({resource.rating_count})</span>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {(resource.is_free || resource.is_owned) ? (
            <button type="button" className="btn-primary" onClick={handleDownload}>
              <Download className="h-4 w-4" /> Download
            </button>
          ) : (
            <div className="flex flex-wrap items-end gap-2">
              <div>
                <label className="label">M-Pesa Number</label>
                <input className="input w-48" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XXXXXXXX" />
              </div>
              <button type="button" className="btn-primary" onClick={handlePurchase}>
                <ShoppingCart className="h-4 w-4" /> Pay with M-Pesa
              </button>
            </div>
          )}
          <button type="button" className="btn-secondary" onClick={reportResource}>
            <Flag className="h-4 w-4" /> Report
          </button>
        </div>
        {message && <p className="mt-4 text-sm text-navy-800">{message}</p>}
      </div>

      <div className="card">
        <h2 className="mb-4 font-semibold">Reviews</h2>
        <form onSubmit={submitReview} className="mb-6 space-y-3 border-b pb-6">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: n })}>
                <Star className={`h-6 w-6 ${n <= reviewForm.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
              </button>
            ))}
          </div>
          <textarea className="input" placeholder="Write a review..." value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} rows={2} />
          <button type="submit" className="btn-primary text-sm">Submit Review</button>
        </form>
        {reviews.map((r) => (
          <div key={r.id} className="mb-4 border-b border-cream-200 pb-4 last:border-0 dark:border-navy-800">
            <div className="flex items-center gap-2">
              <span className="font-medium">{r.username}</span>
              <span className="flex">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}</span>
            </div>
            <p className="mt-1 text-sm text-navy-600 dark:text-cream-300">{r.comment}</p>
          </div>
        ))}
        {reviews.length === 0 && <p className="text-sm text-navy-500">No reviews yet.</p>}
      </div>
    </div>
  )
}
