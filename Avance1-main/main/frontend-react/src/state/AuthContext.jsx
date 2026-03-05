import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../utils/apiFetch.js'

const AuthContext = createContext(null)

function readStored() {
  return {
    token: localStorage.getItem('token') || '',
    userId: localStorage.getItem('userId') || '',
    username: localStorage.getItem('username') || '',
    role: localStorage.getItem('role') || '',
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => readStored())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function bootstrap() {
      try {
        if (!auth.token) {
          if (!cancelled) setLoading(false)
          return
        }

        const me = await apiFetch('/api/auth/me', {
          token: auth.token,
        })

        if (cancelled) return
        setAuth((prev) => ({
          ...prev,
          userId: me._id || prev.userId,
          username: me.username || prev.username,
          role: me.role || prev.role || 'user',
        }))
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('userId')
        localStorage.removeItem('username')
        localStorage.removeItem('role')
        if (!cancelled) setAuth({ token: '', userId: '', username: '', role: '' })
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    bootstrap()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo(() => {
    return {
      loading,
      token: auth.token,
      userId: auth.userId,
      username: auth.username,
      role: auth.role,
      isAuthenticated: !!auth.token,
      async login(username, password) {
        const data = await apiFetch('/api/auth/login', {
          method: 'POST',
          body: { username, password },
        })

        localStorage.setItem('token', data.token)
        localStorage.setItem('userId', data.userId)
        localStorage.setItem('username', data.username)
        localStorage.setItem('role', data.role || 'user')

        setAuth({
          token: data.token,
          userId: data.userId,
          username: data.username,
          role: data.role || 'user',
        })
      },
      logout() {
        localStorage.removeItem('token')
        localStorage.removeItem('userId')
        localStorage.removeItem('username')
        localStorage.removeItem('role')
        setAuth({ token: '', userId: '', username: '', role: '' })
      },
    }
  }, [auth, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
