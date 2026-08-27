import { useEffect, useState } from 'react'
import { Pause, Play, Square, Timer } from 'lucide-react'
import { coursesAPI, studyAPI } from '../api/client'

const MOTIVATIONS = [
  'Get that paper! Your future self will thank you.',
  'Every minute counts toward graduation.',
  'Focus now, celebrate later.',
  'Discipline today, distinction tomorrow.',
  'You are closer to your degree than you think.',
]

export default function Study() {
  const [courses, setCourses] = useState([])
  const [topics, setTopics] = useState([])
  const [form, setForm] = useState({ course: '', topic: '', duration: 25 })
  const [session, setSession] = useState(null)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [running, setRunning] = useState(false)
  const [motivation] = useState(() => MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)])

  useEffect(() => {
    coursesAPI.list().then((r) => setCourses(r.data.results || r.data))
  }, [])

  useEffect(() => {
    if (form.course) {
      coursesAPI.topics(form.course).then((r) => setTopics(r.data.results || r.data))
    } else {
      setTopics([])
    }
  }, [form.course])

  useEffect(() => {
    if (!running || secondsLeft <= 0) return
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [running, secondsLeft])

  useEffect(() => {
    if (secondsLeft === 0 && session && running) {
      handleComplete()
    }
  }, [secondsLeft])

  const startSession = async () => {
    const res = await studyAPI.startSession({
      course: form.course || null,
      topic: form.topic || null,
    })
    setSession(res.data)
    setSecondsLeft(form.duration * 60)
    setRunning(true)
  }

  const handleComplete = async () => {
    setRunning(false)
    if (session) {
      await studyAPI.completeSession(session.id)
      setSession(null)
    }
  }

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Focus Time</h1>
        <p className="text-navy-500">Course-linked Pomodoro sessions for deep study</p>
      </div>

      <div className="card text-center">
        <Timer className="mx-auto mb-4 h-12 w-12 text-navy-800" />
        <div className="mb-6 text-6xl font-bold tabular-nums text-navy-950 dark:text-cream-50">
          {formatTime(secondsLeft || form.duration * 60)}
        </div>
        <p className="mb-6 text-sm italic text-navy-500">{motivation}</p>

        {!session ? (
          <div className="space-y-4 text-left">
            <div>
              <label className="label">Course</label>
              <select className="input" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value, topic: '' })}>
                <option value="">Select course</option>
                {courses.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Topic</label>
              <select className="input" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} disabled={!form.course}>
                <option value="">Select topic</option>
                {topics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Duration (minutes)</label>
              <select className="input" value={form.duration} onChange={(e) => setForm({ ...form, duration: +e.target.value })}>
                <option value={15}>15 min</option>
                <option value={25}>25 min (Pomodoro)</option>
                <option value={45}>45 min</option>
                <option value={60}>60 min</option>
                <option value={120}>2 hours</option>
              </select>
            </div>
            <button type="button" className="btn-primary w-full" onClick={startSession}>
              <Play className="h-4 w-4" /> Start Focus Session
            </button>
          </div>
        ) : (
          <div className="flex justify-center gap-3">
            <button type="button" className="btn-secondary" onClick={() => setRunning(!running)}>
              {running ? <><Pause className="h-4 w-4" /> Pause</> : <><Play className="h-4 w-4" /> Resume</>}
            </button>
            <button type="button" className="btn-primary" onClick={handleComplete}>
              <Square className="h-4 w-4" /> End Session
            </button>
          </div>
        )}
      </div>

      {form.duration >= 120 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
          Remember to take a 5-minute break every 2 hours of study for better retention.
        </div>
      )}
    </div>
  )
}
