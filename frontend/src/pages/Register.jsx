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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onMouseDown={(e) => { if (e.target === e.currentTarget) onSuccess?.() }}>
      <div className="bg-white rounded-2xl shadow-2xl w-[480px] h-[480px] relative flex flex-col justify-center p-10">

        <button onClick={onSuccess} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>

        {success ? (
          <div className="flex flex-col items-center justify-center text-center gap-4">
            <div className="text-5xl">🎉</div>
            <h2 className="text-2xl font-bold text-gray-800">¡Bienvenido, {name}!</h2>
            <p className="text-gray-500">Tu cuenta ha sido creada con éxito.</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-6 text-center">Crear cuenta</h1>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                  <input type="text" value={lastname} onChange={e => setLastname(e.target.value)} required
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
                <input type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:opacity-50 transition">
                {loading ? 'Registrando...' : 'Registrarse'}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <button onClick={onSwitch} className="text-blue-600 hover:underline">Inicia sesión</button>
            </p>
          </>
        )}
      </div>
    </div>
  )
}