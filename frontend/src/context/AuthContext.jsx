import { createContext, useContext, useState, useEffect } from 'react'
import client from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // Al cargar la app, comprobar si hay sesión activa
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      client('/me')
        .then(data => setUser(data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const register = async (name, lastname, email, password, passwordConfirmation) => {
    const data = await client('/register', {
      method: 'POST',
      body: { name, lastname, email, password, password_confirmation: passwordConfirmation },
    })
    localStorage.setItem('token', data.token)
    setUser(data.user)
  }

  const login = async (email, password) => {
    const data = await client('/login', {
      method: 'POST',
      body: { email, password },
    })
    localStorage.setItem('token', data.token)
    setUser(data.user)
  }

  const logout = async () => {
    await client('/logout', { method: 'POST' })
    localStorage.removeItem('token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)