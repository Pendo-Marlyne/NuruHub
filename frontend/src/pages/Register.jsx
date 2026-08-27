import { useState } from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const [form, setForm] = useState({
    username: '', email: '', password: '', password_confirm: '',
    first_name: '', last_name: '', university: '', current_semester: '', phone_number: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    if (form.password.length < 8) {
      setErrors({ password: 'Password must be at least 8 characters.' })
      return
    }
    if (form.password !== form.password_confirm) {
      setErrors({ password_confirm: 'Passwords do not match.' })
      return
    }
    setLoading(true)
    try {
      await register(form)
      window.location.href = '/dashboard'
    } catch (err) {
      setErrors(err.response?.data || { general: 'Registration failed.' })
    } finally {
      setLoading(false)
    }
  }

  const field = (name, label, type = 'text') => (
    <div>
      <label className="label">{label}</label>
      <input
        type={type}
        className="input"
        value={form[name]}
        onChange={(e) => setForm({ ...form, [name]: e.target.value })}
        required={['username', 'email', 'password', 'password_confirm'].includes(name)}
      />
      {errors[name] && <p className="mt-1 text-xs text-red-600">{Array.isArray(errors[name]) ? errors[name][0] : errors[name]}</p>}
    </div>
  )

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream-100 p-4 dark:bg-navy-950">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-navy-800 text-cream-50 dark:bg-cream-100 dark:text-navy-900">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-medium text-navy-950 dark:text-cream-50">Join NuruHub</h1>
          <p className="mt-2 text-navy-600 dark:text-cream-300">Plan · Study · Recall · Track · Resources</p>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {field('first_name', 'First name')}
            {field('last_name', 'Last name')}
          </div>
          {field('username', 'Username')}
          {field('email', 'Email', 'email')}
          {field('university', 'University')}
          {field('current_semester', 'Current semester')}
          {field('phone_number', 'Phone (M-Pesa)')}
          {field('password', 'Password', 'password')}
          {field('password_confirm', 'Confirm password', 'password')}
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
          <p className="text-center text-sm text-navy-600 dark:text-cream-400">
            Already have an account? <Link to="/login" className="font-medium text-navy-800 underline dark:text-cream-200">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
