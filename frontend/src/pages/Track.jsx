import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'
import { Clock, Flame, Target, TrendingUp } from 'lucide-react'
import { studyAPI } from '../api/client'

export default function Track() {
  const [analytics, setAnalytics] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      studyAPI.analytics(),
      studyAPI.sessions(),
    ]).then(([a, s]) => {
      setAnalytics(a.data)
      setSessions((s.data.results || s.data).filter((x) => x.status === 'completed'))
    }).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cream-300 border-t-navy-800" />
      </div>
    )
  }

  const courseData = Object.entries(analytics?.study_by_course || {}).map(([name, minutes]) => ({
    name, hours: Math.round(minutes / 60 * 10) / 10,
  }))
  const topicData = Object.entries(analytics?.study_by_topic || {}).map(([name, minutes]) => ({
    name: name.length > 15 ? name.slice(0, 15) + '…' : name, minutes,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Study Analytics</h1>
        <p className="text-navy-500">Track your progress, streaks, and topic focus</p>
      </div>

      {analytics?.needs_break_reminder && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
          {analytics.break_message}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric icon={Clock} label="Total Study Time" value={`${Math.round((analytics?.total_study_minutes || 0) / 60)}h`} />
        <Metric icon={TrendingUp} label="This Week" value={`${Math.round((analytics?.weekly_study_minutes || 0) / 60 * 10) / 10}h`} />
        <Metric icon={Flame} label="Current Streak" value={`${analytics?.current_streak || 0} days`} />
        <Metric icon={Target} label="Top Course" value={analytics?.most_studied_course || '—'} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-4 font-semibold">Study Time by Course (hours)</h2>
          {courseData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={courseData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="hours" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-navy-500">Complete focus sessions to see charts.</p>
          )}
        </div>

        <div className="card">
          <h2 className="mb-4 font-semibold">Study Time by Topic (minutes)</h2>
          {topicData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={topicData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="minutes" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-navy-500">Link topics to sessions for topic analytics.</p>
          )}
        </div>
      </div>

      <div className="card">
        <h2 className="mb-4 font-semibold">Recent Sessions</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cream-300 text-left text-navy-500 dark:border-navy-700">
                <th className="pb-2">Course</th>
                <th className="pb-2">Topic</th>
                <th className="pb-2">Duration</th>
                <th className="pb-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {sessions.slice(0, 10).map((s) => (
                <tr key={s.id} className="border-b border-cream-200 dark:border-navy-800">
                  <td className="py-2">{s.course_name || '—'}</td>
                  <td className="py-2">{s.topic_name || '—'}</td>
                  <td className="py-2">{s.duration_minutes} min</td>
                  <td className="py-2">{new Date(s.start_time).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {sessions.length === 0 && <p className="py-4 text-navy-500">No completed sessions yet.</p>}
        </div>
      </div>
    </div>
  )
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="card">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-cream-200 p-2.5 text-navy-800 dark:bg-primary-900/40">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-navy-500">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  )
}
