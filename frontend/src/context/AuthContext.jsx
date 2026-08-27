import { createContext, useContext, useEffect, useState } from 'react'
import { authAPI } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('nuruhub_user')
    return saved ? JSON.parse(saved) : null
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('nuruhub_token')
    if (token && !user) {
      authAPI.profile()
        .then((res) => {
          setUser(res.data)
          localStorage.setItem('nuruhub_user', JSON.stringify(res.data))
        })
        .catch(() => {
          localStorage.removeItem('nuruhub_token')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (username, password) => {
    const res = await authAPI.login({ username, password })
    localStorage.setItem('nuruhub_token', res.data.token)
    localStorage.setItem('nuruhub_user', JSON.stringify(res.data.user))
    setUser(res.data.user)
    return res.data
  }

  const register = async (data) => {
    const res = await authAPI.register(data)
    localStorage.setItem('nuruhub_token', res.data.token)
    localStorage.setItem('nuruhub_user', JSON.stringify(res.data.user))
    setUser(res.data.user)
    return res.data
  }

  const logout = async () => {
    try { await authAPI.logout() } catch { /* ignore */ }
    localStorage.removeItem('nuruhub_token')
    localStorage.removeItem('nuruhub_user')
    setUser(null)
  }

  const updateUser = (data) => {
    setUser(data)
    localStorage.setItem('nuruhub_user', JSON.stringify(data))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
