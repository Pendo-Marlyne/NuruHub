import { useEffect, useState } from 'react'
import { Calendar, CheckCircle2, Plus, Sparkles } from 'lucide-react'
import { coursesAPI, studyAPI } from '../api/client'

export default function Plan() {
  const [plans, setPlans] = useState([])
  const [exams, setExams] = useState([])
  const [courses, setCourses] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [showTaskForm, setShowTaskForm] = useState(null)
  const [planForm, setPlanForm] = useState({ title: '', start_date: '', course: '', exam: '' })
  const [taskForm, setTaskForm] = useState({ title: '', due_date: '', estimated_minutes: 30 })
  const [suggestions, setSuggestions] = useState('')

  const load = () => {
    studyAPI.plans().then((r) => setPlans(r.data.results || r.data))
    coursesAPI.exams().then((r) => setExams(r.data.results || r.data))
    coursesAPI.list().then((r) => setCourses(r.data.results || r.data))
  }

  useEffect(() => { load() }, [])

  const createPlan = async (e) => {
    e.preventDefault()
    await studyAPI.createPlan({
      ...planForm,
      course: planForm.course || null,
      exam: planForm.exam || null,
    })
    setShowForm(false)
    setPlanForm({ title: '', start_date: '', course: '', exam: '' })
    load()
  }

  const createTask = async (e, planId) => {
    e.preventDefault()
    await studyAPI.createTask(planId, taskForm)
    setShowTaskForm(null)
    setTaskForm({ title: '', due_date: '', estimated_minutes: 30 })
    load()
  }

  const completeTask = async (planId, taskId) => {
    await studyAPI.completeTask(planId, taskId)
    load()
  }

  const getSuggestions = async (planId) => {
    const res = await studyAPI.suggestPlan(planId)
    setSuggestions(res.data.suggestions)
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Study Planner</h1>
          <p className="text-navy-500">Organise exams, goals, and daily tasks with AI suggestions</p>
        </div>
        <button type="button" className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" /> New Plan
        </button>
      </div>

      {suggestions && (
        <div className="rounded-2xl border border-cream-300 bg-cream-200 p-4 dark:border-navy-700 dark:bg-navy-900/50">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-5 w-5 text-navy-800" />
            <p className="text-sm">{suggestions}</p>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={createPlan} className="card space-y-4">
          <h2 className="font-semibold">Create Study Plan</h2>
          <input className="input" placeholder="Plan title" value={planForm.title} onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })} required />
          <input type="date" className="input" value={planForm.start_date} onChange={(e) => setPlanForm({ ...planForm, start_date: e.target.value })} required />
          <select className="input" value={planForm.course} onChange={(e) => setPlanForm({ ...planForm, course: e.target.value })}>
            <option value="">Link course (optional)</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
          </select>
          <select className="input" value={planForm.exam} onChange={(e) => setPlanForm({ ...planForm, exam: e.target.value })}>
            <option value="">Link exam (optional)</option>
            {exams.map((ex) => <option key={ex.id} value={ex.id}>{ex.title}</option>)}
          </select>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">Create</button>
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {/* Calendar-style today view */}
      <div className="card">
        <div className="mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-navy-800" />
          <h2 className="font-semibold">Today — {today}</h2>
        </div>
        <div className="grid gap-2">
          {plans.flatMap((p) => (p.tasks || []).filter((t) => t.due_date === today && !t.is_completed)).map((t) => (
            <div key={t.id} className="flex items-center gap-3 rounded-xl bg-cream-200 p-3 dark:bg-navy-800">
              <button type="button" onClick={() => completeTask(p.id, t.id)}>
                <CheckCircle2 className="h-5 w-5 text-navy-400 hover:text-accent-500" />
              </button>
              <span className="flex-1 text-sm">{t.title}</span>
              <span className="text-xs text-navy-500">{t.estimated_minutes} min</span>
            </div>
          ))}
        </div>
      </div>

      {/* Plans list */}
      <div className="grid gap-4 lg:grid-cols-2">
        {plans.map((plan) => (
          <div key={plan.id} className="card">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{plan.title}</h3>
                {plan.days_until_exam != null && (
                  <p className="text-sm text-red-500">{plan.days_until_exam} days until exam</p>
                )}
              </div>
              <button type="button" className="text-sm text-navy-800" onClick={() => getSuggestions(plan.id)}>
                AI Suggest
              </button>
            </div>
            <ul className="mb-4 space-y-2">
              {(plan.tasks || []).map((t) => (
                <li key={t.id} className={`flex items-center gap-2 text-sm ${t.is_completed ? 'text-navy-400 line-through' : ''}`}>
                  {!t.is_completed ? (
                    <button type="button" onClick={() => completeTask(plan.id, t.id)}>
                      <CheckCircle2 className="h-4 w-4 text-navy-400" />
                    </button>
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-accent-500" />
                  )}
                  {t.title}
                  {t.due_date && <span className="ml-auto text-xs">{t.due_date}</span>}
                </li>
              ))}
            </ul>
            {showTaskForm === plan.id ? (
              <form onSubmit={(e) => createTask(e, plan.id)} className="space-y-2 border-t pt-4">
                <input className="input" placeholder="Task title" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required />
                <input type="date" className="input" value={taskForm.due_date} onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })} />
                <input type="number" className="input" placeholder="Minutes" value={taskForm.estimated_minutes} onChange={(e) => setTaskForm({ ...taskForm, estimated_minutes: +e.target.value })} />
                <button type="submit" className="btn-primary text-sm">Add task</button>
              </form>
            ) : (
              <button type="button" className="text-sm text-navy-800" onClick={() => setShowTaskForm(plan.id)}>+ Add task</button>
            )}
          </div>
        ))}
      </div>

      {plans.length === 0 && !showForm && (
        <div className="card py-12 text-center text-navy-500">
          No study plans yet. Create one to get started.
        </div>
      )}
    </div>
  )
}
