import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Brain, CalendarDays, GraduationCap, Library, Timer } from 'lucide-react'

const features = [
  { icon: CalendarDays, title: 'Plan', desc: 'Study planner with exams, tasks, and AI suggestions' },
  { icon: Timer, title: 'Study', desc: 'Focus time Pomodoro sessions linked to courses' },
  { icon: Brain, title: 'Recall', desc: 'Flashcards & quizzes with spaced repetition' },
  { icon: GraduationCap, title: 'Track', desc: 'Analytics, streaks, and topic mastery' },
  { icon: Library, title: 'Resources', desc: 'Share, buy, borrow academic materials' },
]

export default function Landing() {
  return (
    <div className="min-h-screen bg-cream-100 text-navy-800 dark:bg-navy-950 dark:text-cream-100">
      <header className="mx-auto flex max-w-6xl items-center justify-between border-b border-cream-300 px-4 py-6 dark:border-navy-700">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-navy-800 text-cream-50 dark:bg-cream-100 dark:text-navy-900">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold text-navy-950 dark:text-cream-50">NuruHub</span>
        </div>
        <div className="flex gap-3">
          <Link to="/login" className="btn-secondary">Sign in</Link>
          <Link to="/register" className="btn-primary">Get started</Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-20 text-center">
        <div className="ticks mb-8" />
        <h1 className="text-4xl font-medium tracking-tight text-navy-950 dark:text-cream-50 sm:text-5xl lg:text-6xl">
          Your academic productivity<br />
          <span className="text-navy-600 dark:text-cream-200">& peer research platform</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-navy-600 dark:text-cream-300">
          Dashboard → Plan → Study → Recall → Track → Resources.
          Everything you need to excel in university, in one calm, professional workspace.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link to="/register" className="btn-primary px-8 py-3 text-base">
            Start for free <ArrowRight className="h-5 w-5" />
          </Link>
          <Link to="/login" className="btn-secondary px-8 py-3 text-base">Sign in</Link>
        </div>
        <div className="ticks mt-12" />
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
        {features.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="card">
            <div className="mb-4 inline-flex rounded-lg bg-cream-200 p-3 text-navy-800 dark:bg-navy-800 dark:text-cream-100">
              <Icon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-navy-950 dark:text-cream-50">{title}</h3>
            <p className="mt-2 text-sm text-navy-600 dark:text-cream-300">{desc}</p>
          </div>
        ))}
        <div className="card sm:col-span-2 lg:col-span-1">
          <BookOpen className="mb-4 h-8 w-8 text-accent-600" />
          <h3 className="text-lg font-medium text-navy-950 dark:text-cream-50">M-Pesa Payments</h3>
          <p className="mt-2 text-sm text-navy-600 dark:text-cream-300">Buy premium resources with Safaricom STK push. Contributors earn from their uploads.</p>
        </div>
      </section>

      <footer className="border-t border-cream-300 py-8 text-center text-sm text-navy-500 dark:border-navy-700 dark:text-cream-400">
        NuruHub — Plan · Study · Recall · Track · Resources
      </footer>
    </div>
  )
}
