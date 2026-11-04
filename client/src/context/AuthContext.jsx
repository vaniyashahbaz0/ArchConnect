import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('token')))

  useEffect(() => {
    const savedToken = localStorage.getItem('token')

    if (!savedToken) {
      return
    }

    api
      .get('/auth/me')
      .then((res) => {
        setUser(res.data.user)
      })
      .catch(() => {
        localStorage.removeItem('token')
        setToken(null)
        setUser(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  const saveSession = (data) => {
    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUser(data.user)
  }

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    saveSession(res.data)
    return res.data.user
  }

  const register = async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password })
    saveSession(res.data)
    return res.data.user
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.log('Logout request failed, clearing session anyway')
    }

    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
