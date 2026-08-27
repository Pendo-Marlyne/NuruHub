import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Bell, BookOpen, Brain, CalendarDays, GraduationCap, Home,
  Library, LogOut, Menu, Moon, Search, Sun, Timer, X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import GlobalSearch from './GlobalSearch'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: Home },
  { to: '/plan', label: 'Plan', icon: CalendarDays },
  { to: '/study', label: 'Study', icon: Timer },
  { to: '/recall', label: 'Recall', icon: Brain },
  { to: '/track', label: 'Track', icon: GraduationCap },
  { to: '/resources', label: 'Resources', icon: Library },
  { to: '/courses', label: 'Courses', icon: BookOpen },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const { darkMode, toggleTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const NavLinks = ({ mobile = false }) => (
    <>
      {navItems.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={() => mobile && setMobileOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              isActive
                ? 'bg-cream-100/15 text-cream-50'
                : 'text-cream-200/80 hover:bg-navy-700/60 hover:text-cream-50'
            }`
          }
        >
          <Icon className="h-5 w-5 shrink-0" />
          {label}
        </NavLink>
      ))}
    </>
  )

  return (
    <div className="min-h-screen bg-cream-100 dark:bg-navy-950">
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-navy-950/60 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Navy sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-navy-700 bg-navy-900 transition-transform lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-navy-700 px-5">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cream-100 text-navy-900">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-cream-50">NuruHub</span>
          </Link>
          <button type="button" className="text-cream-200 lg:hidden" onClick={() => setMobileOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          <NavLinks mobile />
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-navy-700 p-4">
          <div className="mb-1 truncate text-sm font-medium text-cream-50">
            {user?.first_name || user?.username}
          </div>
          <div className="truncate text-xs text-cream-300">{user?.university || 'Student'}</div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-cream-300 bg-cream-50/90 px-4 backdrop-blur dark:border-navy-700 dark:bg-navy-900/90 lg:px-6">
          <button
            type="button"
            className="rounded-lg p-2 text-navy-800 hover:bg-cream-200 dark:text-cream-100 dark:hover:bg-navy-800 lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex flex-1 items-center gap-2 rounded-lg border border-cream-300 bg-cream-100 px-4 py-2 text-sm text-navy-500 dark:border-navy-600 dark:bg-navy-800 dark:text-cream-300 lg:max-w-md"
          >
            <Search className="h-4 w-4" />
            Search courses, topics, resources...
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-lg p-2 text-navy-800 hover:bg-cream-200 dark:text-cream-100 dark:hover:bg-navy-800"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Link to="/notifications" className="relative rounded-lg p-2 text-navy-800 hover:bg-cream-200 dark:text-cream-100 dark:hover:bg-navy-800">
              <Bell className="h-5 w-5" />
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="hidden rounded-lg p-2 text-navy-800 hover:bg-cream-200 dark:text-cream-100 dark:hover:bg-navy-800 sm:block"
              aria-label="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {searchOpen && <GlobalSearch onClose={() => setSearchOpen(false)} />}
    </div>
  )
}
