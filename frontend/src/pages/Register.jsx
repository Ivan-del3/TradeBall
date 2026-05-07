import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function Register({ onSwitch, onSuccess }) {
  const { register }                          = useAuth()
  const [name, setName]                       = useState('')
  const [lastname, setLastname]               = useState('')
  const [email, setEmail]                     = useState('')
  const [password, setPassword]               = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError]                     = useState(null)
  const [loading, setLoading]                 = useState(false)
  const [success, setSuccess]                 = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (password !== passwordConfirm) { setError('Las contraseñas no coinciden'); return }
    setLoading(true)
    try {
      await register(name, lastname, email, password, passwordConfirm)
      setSuccess(true)
    } catch (err) {
      const firstError = err.errors ? Object.values(err.errors)[0][0] : err.message
      setError(firstError || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="tb-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onSuccess?.() }}>
      <div className="tb-modal tb-modal-auth">
        <button onClick={onSuccess} className="tb-modal-close">&times;</button>

        {success ? (
          <div className="tb-modal-success">
            <div className="tb-modal-emoji">🎉</div>
            <h2 className="tb-modal-title">¡Bienvenido, {name}!</h2>
            <p className="tb-modal-subtitle">Tu cuenta ha sido creada con éxito.</p>
          </div>
        ) : (
          <>
            <h1 className="tb-form-title">Crear cuenta</h1>

            {error && <div className="tb-alert-error">{error}</div>}

            <form onSubmit={handleSubmit} className="tb-form-stack">
              <div className="tb-form-pair">
                <div className="tb-form-group">
                  <label className="tb-form-label">Nombre</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    maxLength={20}
                    className="tb-input"
                  />
                </div>
                <div className="tb-form-group">
                  <label className="tb-form-label">Apellidos</label>
                  <input
                    type="text"
                    value={lastname}
                    onChange={e => setLastname(e.target.value)}
                    required
                    maxLength={20}
                    className="tb-input"
                  />
                </div>
              </div>
              <div className="tb-form-group">
                <label className="tb-form-label">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
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
                  minLength={8}
                  className="tb-input"
                />
                {password.length > 0 && password.length < 8 && (
                  <p className="tb-hint-error">Mínimo 8 caracteres</p>
                )}
              </div>
              <div className="tb-form-group">
                <label className="tb-form-label">Confirmar contraseña</label>
                <input
                  type="password"
                  value={passwordConfirm}
                  onChange={e => setPasswordConfirm(e.target.value)}
                  required
                  className="tb-input"
                />
              </div>
              <button type="submit" disabled={loading} className="tb-btn-primary">
                {loading ? 'Registrando...' : 'Registrarse'}
              </button>
            </form>

            <p className="tb-form-footer">
              ¿Ya tienes cuenta?{' '}
              <button onClick={onSwitch} className="tb-form-link">Inicia sesión</button>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
