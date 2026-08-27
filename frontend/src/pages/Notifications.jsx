import { useEffect, useState } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { notificationsAPI } from '../api/client'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    notificationsAPI.list()
      .then((r) => setNotifications(r.data.results || r.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const markRead = async (id) => {
    await notificationsAPI.markRead(id)
    load()
  }

  const markAllRead = async () => {
    await notificationsAPI.markAllRead()
    load()
  }

  const typeColors = {
    exam: 'bg-red-100 text-red-700',
    study: 'bg-blue-100 text-blue-700',
    deadline: 'bg-amber-100 text-amber-700',
    goal: 'bg-green-100 text-green-700',
    book: 'bg-purple-100 text-purple-700',
    payment: 'bg-emerald-100 text-emerald-700',
    account: 'bg-cream-200 text-navy-700',
    system: 'bg-cream-200 text-navy-700',
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cream-300 border-t-navy-800" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-navy-500">Exams, study reminders, deadlines, and more</p>
        </div>
        {notifications.some((n) => !n.is_read) && (
          <button type="button" className="btn-secondary text-sm" onClick={markAllRead}>
            <CheckCheck className="h-4 w-4" /> Mark all read
          </button>
        )}
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`card flex gap-4 ${!n.is_read ? 'border-cream-300 bg-cream-200/50 dark:border-primary-800 dark:bg-primary-900/20' : ''}`}
          >
            <div className="rounded-xl bg-white p-2 dark:bg-navy-800">
              <Bell className="h-5 w-5 text-navy-800" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium">{n.title}</h3>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs capitalize ${typeColors[n.notification_type] || typeColors.system}`}>
                  {n.notification_type}
                </span>
              </div>
              <p className="mt-1 text-sm text-navy-600 dark:text-cream-300">{n.message}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs text-navy-400">{new Date(n.created_at).toLocaleString()}</span>
                {!n.is_read && (
                  <button type="button" className="text-xs text-navy-800" onClick={() => markRead(n.id)}>Mark read</button>
                )}
              </div>
            </div>
          </div>
        ))}
        {notifications.length === 0 && (
          <div className="card py-12 text-center text-navy-500">
            <Bell className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            No notifications yet. They will appear here for exams, study plans, and account updates.
          </div>
        )}
      </div>
    </div>
  )
}
