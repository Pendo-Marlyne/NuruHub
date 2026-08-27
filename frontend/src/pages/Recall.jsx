import { useEffect, useState } from 'react'
import { Brain, ChevronLeft, ChevronRight, Plus, RotateCcw } from 'lucide-react'
import { coursesAPI, studyAPI } from '../api/client'

export default function Recall() {
  const [tab, setTab] = useState('flashcards')
  const [flashcards, setFlashcards] = useState([])
  const [practiceCards, setPracticeCards] = useState([])
  const [current, setCurrent] = useState(0)
  const [revealed, setRevealed] = useState(false)
  const [courses, setCourses] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ question: '', answer: '', course: '', difficulty: 'medium' })
  const [quizzes, setQuizzes] = useState([])
  const [mastery, setMastery] = useState([])

  useEffect(() => {
    studyAPI.flashcards().then((r) => setFlashcards(r.data.results || r.data))
    coursesAPI.list().then((r) => setCourses(r.data.results || r.data))
    studyAPI.quizzes().then((r) => setQuizzes(r.data.results || r.data))
    studyAPI.mastery().then((r) => setMastery(r.data.results || r.data))
  }, [])

  const startPractice = async () => {
    const res = await studyAPI.practiceFlashcards()
    setPracticeCards(res.data)
    setCurrent(0)
    setRevealed(false)
    setTab('practice')
  }

  const reviewCard = async (correct, difficulty) => {
    const card = practiceCards[current]
    await studyAPI.reviewFlashcard(card.id, { correct, difficulty })
    if (current < practiceCards.length - 1) {
      setCurrent((c) => c + 1)
      setRevealed(false)
    } else {
      setTab('flashcards')
      studyAPI.mastery().then((r) => setMastery(r.data.results || r.data))
    }
  }

  const createFlashcard = async (e) => {
    e.preventDefault()
    await studyAPI.createFlashcard({ ...form, course: form.course || null })
    setShowForm(false)
    setForm({ question: '', answer: '', course: '', difficulty: 'medium' })
    studyAPI.flashcards().then((r) => setFlashcards(r.data.results || r.data))
  }

  const card = practiceCards[current]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Active Recall</h1>
          <p className="text-navy-500">Flashcards & quizzes — hard topics appear more often</p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" /> Add Card
          </button>
          <button type="button" className="btn-primary" onClick={startPractice}>
            <Brain className="h-4 w-4" /> Practice
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-cream-300 dark:border-navy-700">
        {['flashcards', 'practice', 'quizzes', 'mastery'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize ${tab === t ? 'border-b-2 border-navy-800 text-navy-800' : 'text-navy-500'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {showForm && (
        <form onSubmit={createFlashcard} className="card space-y-4">
          <textarea className="input" placeholder="Question" value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} required rows={2} />
          <textarea className="input" placeholder="Answer" value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} required rows={2} />
          <select className="input" value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>
            <option value="">Course (optional)</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.code}</option>)}
          </select>
          <select className="input" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">Save</button>
            <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {tab === 'flashcards' && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {flashcards.map((f) => (
            <div key={f.id} className="card">
              <span className={`mb-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                f.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
                f.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
              }`}>{f.difficulty}</span>
              <p className="font-medium">{f.question}</p>
              <p className="mt-2 text-sm text-navy-500">{f.answer}</p>
            </div>
          ))}
          {flashcards.length === 0 && <p className="col-span-full text-center text-navy-500">No flashcards yet.</p>}
        </div>
      )}

      {tab === 'practice' && card && (
        <div className="mx-auto max-w-xl">
          <div className="card min-h-[240px] text-center">
            <p className="mb-2 text-sm text-navy-500">Card {current + 1} of {practiceCards.length}</p>
            <p className="text-xl font-medium">{revealed ? card.answer : card.question}</p>
            {!revealed ? (
              <button type="button" className="btn-primary mt-8" onClick={() => setRevealed(true)}>Reveal Answer</button>
            ) : (
              <div className="mt-8 space-y-3">
                <p className="text-sm text-navy-500">How did you do?</p>
                <div className="flex flex-wrap justify-center gap-2">
                  <button type="button" className="btn-primary" onClick={() => reviewCard(true, 'easy')}>Easy ✓</button>
                  <button type="button" className="btn-secondary" onClick={() => reviewCard(true, 'medium')}>Medium ✓</button>
                  <button type="button" className="btn-secondary" onClick={() => reviewCard(false, 'hard')}>Hard ✗</button>
                </div>
              </div>
            )}
          </div>
          <div className="mt-4 flex justify-between">
            <button type="button" disabled={current === 0} onClick={() => { setCurrent((c) => c - 1); setRevealed(false) }}>
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button type="button" onClick={() => { setRevealed(false) }}><RotateCcw className="h-5 w-5" /></button>
            <button type="button" disabled={current >= practiceCards.length - 1} onClick={() => { setCurrent((c) => c + 1); setRevealed(false) }}>
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}

      {tab === 'practice' && !card && (
        <div className="card py-12 text-center text-navy-500">
          Click Practice to start a weighted recall session.
        </div>
      )}

      {tab === 'quizzes' && (
        <div className="grid gap-4 sm:grid-cols-2">
          {quizzes.map((q) => (
            <div key={q.id} className="card">
              <h3 className="font-semibold">{q.title}</h3>
              <p className="text-sm text-navy-500">{q.questions?.length || 0} questions</p>
            </div>
          ))}
          {quizzes.length === 0 && <p className="text-navy-500">Create quizzes from your courses.</p>}
        </div>
      )}

      {tab === 'mastery' && (
        <div className="space-y-3">
          {mastery.map((m) => (
            <div key={m.id} className="card flex items-center gap-4">
              <div className="flex-1">
                <p className="font-medium">{m.topic_name}</p>
                <p className="text-sm text-navy-500">{m.course_code}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-navy-800">{Math.round(m.mastery_score)}%</p>
                <p className="text-xs text-navy-500">H:{m.hard_count} M:{m.medium_count} E:{m.easy_count}</p>
              </div>
            </div>
          ))}
          {mastery.length === 0 && <p className="text-navy-500">Practice flashcards to build mastery analytics.</p>}
        </div>
      )}
    </div>
  )
}
