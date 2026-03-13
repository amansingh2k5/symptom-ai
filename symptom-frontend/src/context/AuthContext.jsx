import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })
  const [token,   setToken]   = useState(() => localStorage.getItem('token') || null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) { setLoading(false); return }
    authAPI.getMe()
      .then(({ data }) => setUser(data.user))
      .catch(() => logout())
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line

  const login = useCallback((userData, jwt) => {
    setUser(userData); setToken(jwt)
    localStorage.setItem('user',  JSON.stringify(userData))
    localStorage.setItem('token', jwt)
  }, [])

  const logout = useCallback(() => {
    setUser(null); setToken(null)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }, [])

  const updateUser = useCallback((updated) => {
    setUser(updated)
    localStorage.setItem('user', JSON.stringify(updated))
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
