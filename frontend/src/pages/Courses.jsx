import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { coursesAPI } from '../api/client'

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [exams, setExams] = useState([])
  const [selected, setSelected] = useState(null)
  const [topics, setTopics] = useState([])
  const [showCourseForm, setShowCourseForm] = useState(false)
  const [showExamForm, setShowExamForm] = useState(false)
  const [courseForm, setCourseForm] = useState({ code: '', name: '', lecturer: '', semester: '', exam_date: '', notes: '' })
  const [topicForm, setTopicForm] = useState({ name: '', description: '' })
  const [examForm, setExamForm] = useState({ title: '', exam_date: '', course: '', location: '' })

  const load = () => {
    coursesAPI.list().then((r) => setCourses(r.data.results || r.data))
    coursesAPI.exams().then((r) => setExams(r.data.results || r.data))
  }

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (selected) {
      coursesAPI.topics(selected.id).then((r) => setTopics(r.data.results || r.data))
    }
  }, [selected])

  const createCourse = async (e) => {
    e.preventDefault()
    await coursesAPI.create(courseForm)
    setShowCourseForm(false)
    setCourseForm({ code: '', name: '', lecturer: '', semester: '', exam_date: '', notes: '' })
    load()
  }

  const createTopic = async (e) => {
    e.preventDefault()
    await coursesAPI.createTopic(selected.id, topicForm)
    setTopicForm({ name: '', description: '' })
    coursesAPI.topics(selected.id).then((r) => setTopics(r.data.results || r.data))
  }

  const createExam = async (e) => {
    e.preventDefault()
    await coursesAPI.createExam({ ...examForm, course: examForm.course || null })
    setShowExamForm(false)
    setExamForm({ title: '', exam_date: '', course: '', location: '' })
    load()
  }

  const updateProgress = async (course, progress) => {
    await coursesAPI.update(course.id, { study_progress: progress })
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Course Management</h1>
          <p className="text-navy-500">Manage courses, topics, exams, and progress</p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary" onClick={() => setShowExamForm(true)}>Add Exam</button>
          <button type="button" className="btn-primary" onClick={() => setShowCourseForm(true)}>
            <Plus className="h-4 w-4" /> Add Course
          </button>
        </div>
      </div>

      {showCourseForm && (
        <form onSubmit={createCourse} className="card grid gap-3 sm:grid-cols-2">
          <input className="input" placeholder="Course code" value={courseForm.code} onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })} required />
          <input className="input" placeholder="Course name" value={courseForm.name} onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })} required />
          <input className="input" placeholder="Lecturer" value={courseForm.lecturer} onChange={(e) => setCourseForm({ ...courseForm, lecturer: e.target.value })} />
          <input className="input" placeholder="Semester" value={courseForm.semester} onChange={(e) => setCourseForm({ ...courseForm, semester: e.target.value })} />
          <input type="date" className="input" value={courseForm.exam_date} onChange={(e) => setCourseForm({ ...courseForm, exam_date: e.target.value })} />
          <textarea className="input sm:col-span-2" placeholder="Notes" value={courseForm.notes} onChange={(e) => setCourseForm({ ...courseForm, notes: e.target.value })} rows={2} />
          <div className="flex gap-2 sm:col-span-2">
            <button type="submit" className="btn-primary">Save Course</button>
            <button type="button" className="btn-secondary" onClick={() => setShowCourseForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {showExamForm && (
        <form onSubmit={createExam} className="card space-y-3">
          <input className="input" placeholder="Exam title" value={examForm.title} onChange={(e) => setExamForm({ ...examForm, title: e.target.value })} required />
          <input type="datetime-local" className="input" value={examForm.exam_date} onChange={(e) => setExamForm({ ...examForm, exam_date: e.target.value })} required />
          <select className="input" value={examForm.course} onChange={(e) => setExamForm({ ...examForm, course: e.target.value })}>
            <option value="">Link course</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.code}</option>)}
          </select>
          <input className="input" placeholder="Location" value={examForm.location} onChange={(e) => setExamForm({ ...examForm, location: e.target.value })} />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary">Save Exam</button>
            <button type="button" className="btn-secondary" onClick={() => setShowExamForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h2 className="font-semibold">Your Courses</h2>
          {courses.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelected(c)}
              className={`card w-full text-left transition ${selected?.id === c.id ? 'ring-2 ring-navy-600' : ''}`}
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">{c.code}</p>
                  <p className="text-sm text-navy-500">{c.name}</p>
                  {c.lecturer && <p className="text-xs text-navy-400">{c.lecturer}</p>}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-navy-800">{c.study_progress}%</p>
                  <input type="range" min="0" max="100" value={c.study_progress}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => updateProgress(c, +e.target.value)}
                    className="mt-1 w-24" />
                </div>
              </div>
            </button>
          ))}
          {courses.length === 0 && <p className="text-navy-500">No courses yet.</p>}
        </div>

        <div>
          {selected ? (
            <div className="card">
              <h2 className="mb-4 font-semibold">{selected.code} — Topics</h2>
              <form onSubmit={createTopic} className="mb-4 space-y-2">
                <input className="input" placeholder="Topic name" value={topicForm.name} onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })} required />
                <input className="input" placeholder="Description" value={topicForm.description} onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })} />
                <button type="submit" className="btn-primary text-sm">Add Topic</button>
              </form>
              <ul className="space-y-2">
                {topics.map((t) => (
                  <li key={t.id} className="flex items-center justify-between rounded-lg bg-cream-200 p-3 dark:bg-navy-800">
                    <span>{t.name}</span>
                    <span className="text-xs text-navy-500">{t.mastery_level}% mastery</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="card py-12 text-center text-navy-500">Select a course to manage topics</div>
          )}

          <div className="card mt-4">
            <h2 className="mb-3 font-semibold">Upcoming Exams</h2>
            {exams.map((e) => (
              <div key={e.id} className="mb-2 flex justify-between text-sm">
                <span>{e.title}</span>
                <span className="text-navy-800">{e.days_until}d</span>
              </div>
            ))}
            {exams.length === 0 && <p className="text-sm text-navy-500">No exams scheduled.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
