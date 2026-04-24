import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import client from '../../api/client'

export default function UserInfo() {
  const { user, setUser } = useAuth()
  const [name, setName]         = useState(user?.name || '')
  const [lastname, setLastname] = useState(user?.lastname || '')
  const [avatar, setAvatar]     = useState(null)
  const [preview, setPreview]   = useState(user?.avatar_url || null)
  const [loading, setLoading]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [error, setError]       = useState(null)

  const handleAvatar = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setAvatar(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('lastname', lastname)
      if (avatar) formData.append('avatar', avatar)

      const data = await client('/profile', {
        method: 'POST',
        body: formData,
        isFormData: true,
      })

      setUser(data.user)
      setSuccess(true)
    } catch (err) {
      setError(err.message || 'Error al actualizar el perfil')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Mi perfil</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-yellow-400 flex items-center justify-center">
              {preview ? (
                <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-black">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-white border border-gray-200 rounded-full w-7 h-7 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition shadow-sm">
              <span className="text-xs">+</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatar}
                className="hidden"
              />
            </label>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{user?.name} {user?.lastname}</p>
            <p className="text-xs text-gray-400">{user?.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
            <input
              type="text"
              value={lastname}
              onChange={e => setLastname(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={user?.email}
            disabled
            className="w-full border border-gray-100 rounded-xl px-4 py-2.5 text-sm bg-gray-50 text-gray-400 cursor-not-allowed"
          />
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 px-4 py-2 rounded-xl">{error}</p>
        )}
        {success && (
          <p className="text-sm text-green-600 bg-green-50 px-4 py-2 rounded-xl">Perfil actualizado correctamente</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="bg-yellow-400 text-black font-semibold px-6 py-2.5 rounded-xl hover:bg-yellow-300 transition disabled:opacity-50 text-sm"
        >
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}