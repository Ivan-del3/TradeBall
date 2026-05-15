import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Login({ onSwitch, onSuccess }) {
  const { user, login }         = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState(null)
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="tb-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onSuccess?.() }}>
      <div className="tb-modal tb-modal-auth">
        <button onClick={onSuccess} className="tb-modal-close">&times;</button>

        {user ? (
          <div className="tb-modal-success">
            <div className="tb-modal-emoji">👋</div>
            <h2 className="tb-modal-title">¡Bienvenido, {user.name}!</h2>
            <p className="tb-modal-subtitle">Has iniciado sesión correctamente.</p>
          </div>
        ) : (
          <>
            <h1 className="tb-form-title">Iniciar sesión</h1>

            {error && <div className="tb-alert-error">{error}</div>}

            <form onSubmit={handleSubmit} className="tb-form-stack">
              <div className="tb-form-group">
                <label className="tb-form-label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="tb-input"
                />
              </div>
              <div className="tb-form-group">
                <label className="tb-form-label">Contraseña</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="tb-input"
                />
              </div>
              <button type="submit" disabled={loading} className="tb-btn-primary">
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <p className="tb-form-footer">
              ¿No tienes cuenta?{' '}
              <button onClick={onSwitch} className="tb-form-link">Regístrate</button>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
