import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart3, BookOpen, Clock, Flame, Play, Star, Target, TrendingUp,
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { dashboardAPI } from '../api/client'

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardAPI.get()
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cream-300 border-t-navy-800" />
      </div>
    )
  }

  const analytics = data?.analytics || {}
  const courseChart = Object.entries(analytics.study_by_course || {}).map(([name, value]) => ({ name, minutes: value }))
  const progressData = (data?.courses || []).map((c) => ({ name: c.code, progress: c.study_progress }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy-950 dark:text-cream-50">
            Welcome back, {data?.user?.name || 'Student'}
          </h1>
          <p className="text-navy-500">
            {data?.user?.university} · {data?.user?.semester || 'Current semester'}
          </p>
        </div>
        <Link to="/study" className="btn-primary">
          <Play className="h-4 w-4" />
          Quick Start Pomodoro
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Target}
          label="Nearest Exam"
          value={data?.nearest_exam?.title || 'None scheduled'}
          sub={data?.days_until_exam != null ? `${data.days_until_exam} days left` : ''}
          accent="text-red-500"
        />
        <StatCard
          icon={Flame}
          label="Study Streak"
          value={`${analytics.current_streak || 0} days`}
          sub="Keep it going!"
          accent="text-orange-500"
        />
        <StatCard
          icon={Clock}
          label="Weekly Study Time"
          value={`${Math.round((analytics.weekly_study_minutes || 0) / 60 * 10) / 10}h`}
          sub={`Total: ${Math.round((analytics.total_study_minutes || 0) / 60)}h`}
          accent="text-navy-700"
        />
        <StatCard
          icon={TrendingUp}
          label="Most Studied"
          value={analytics.most_studied_course || '—'}
          sub="Top course this term"
          accent="text-accent-500"
        />
      </div>

      {analytics.needs_break_reminder && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
          {analytics.break_message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Course progress */}
        <div className="card">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-navy-800" />
            <h2 className="font-semibold">Course Progress</h2>
          </div>
          {progressData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={progressData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="progress" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-navy-500">Add courses to see progress. <Link to="/courses" className="text-navy-800">Manage courses</Link></p>
          )}
        </div>

        {/* Study by course */}
        <div className="card">
          <div className="mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent-600" />
            <h2 className="font-semibold">Study Time by Course</h2>
          </div>
          {courseChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={courseChart} dataKey="minutes" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {courseChart.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-navy-500">Start a focus session to track analytics.</p>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's plan */}
        <div className="card lg:col-span-1">
          <h2 className="mb-4 font-semibold">Today&apos;s Study Plan</h2>
          {data?.today_tasks?.length > 0 ? (
            <ul className="space-y-2">
              {data.today_tasks.map((t) => (
                <li key={t.id} className="flex items-center gap-2 rounded-lg bg-cream-200 p-3 dark:bg-navy-800">
                  <input type="checkbox" className="rounded" readOnly />
                  <span className="flex-1 text-sm">{t.title}</span>
                  <span className="text-xs text-navy-500">{t.estimated_minutes}m</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-navy-500">No tasks for today. <Link to="/plan" className="text-navy-800">Create a plan</Link></p>
          )}
        </div>

        {/* Upcoming exams */}
        <div className="card">
          <h2 className="mb-4 font-semibold">Upcoming Exams</h2>
          {data?.upcoming_exams?.length > 0 ? (
            <ul className="space-y-3">
              {data.upcoming_exams.map((e) => (
                <li key={e.id} className="flex justify-between text-sm">
                  <span>{e.title}</span>
                  <span className="font-medium text-navy-800">{e.days_until}d</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-navy-500">No upcoming exams.</p>
          )}
        </div>

        {/* Recent resources */}
        <div className="card">
          <h2 className="mb-4 font-semibold">Recent & Favourites</h2>
          <div className="space-y-2">
            {[...(data?.recent_purchases || []), ...(data?.favorites || [])].slice(0, 5).map((r) => (
              <Link key={r.id} to={`/resources/${r.id}`} className="flex items-center gap-2 rounded-lg p-2 text-sm hover:bg-cream-200 dark:hover:bg-navy-800">
                <BookOpen className="h-4 w-4 text-navy-700" />
                <span className="truncate">{r.title}</span>
                {r.average_rating > 0 && (
                  <span className="ml-auto flex items-center gap-1 text-xs text-amber-500">
                    <Star className="h-3 w-3 fill-current" /> {r.average_rating.toFixed(1)}
                  </span>
                )}
              </Link>
            ))}
            {!data?.recent_purchases?.length && !data?.favorites?.length && (
              <p className="text-sm text-navy-500"><Link to="/resources" className="text-navy-800">Browse resources</Link></p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-navy-500">{label}</p>
          <p className="mt-1 text-lg font-bold text-navy-950 dark:text-cream-50">{value}</p>
          {sub && <p className="mt-0.5 text-xs text-navy-500">{sub}</p>}
        </div>
        <div className={`rounded-xl bg-cream-200 p-2.5 dark:bg-navy-800 ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}
