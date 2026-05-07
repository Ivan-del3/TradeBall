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
    <div className="tb-card">
      <h2 className="tb-card-title">Mi perfil</h2>

      <form onSubmit={handleSubmit} className="tb-form-stack-lg">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-5)' }}>
          <div className="tb-profile-avatar-edit">
            <div className="tb-profile-avatar-preview">
              {preview ? (
                <img src={preview} alt="Avatar" className="tb-img-cover" />
              ) : (
                <span className="tb-profile-avatar-placeholder">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <label className="tb-avatar-upload-btn">
              <span style={{ fontSize: 'var(--fs-small)' }}>+</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatar}
                style={{ display: 'none' }}
              />
            </label>
          </div>
          <div>
            <p className="tb-profile-user-name">{user?.name} {user?.lastname}</p>
            <p className="tb-profile-user-email">{user?.email}</p>
          </div>
        </div>

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
            {name.length >= 15 && (
              <p className="tb-hint-warn">{20 - name.length} caracteres restantes</p>
            )}
          </div>
          <div className="tb-form-group">
            <label className="tb-form-label">Apellido</label>
            <input
              type="text"
              value={lastname}
              onChange={e => setLastname(e.target.value)}
              required
              maxLength={20}
              className="tb-input"
            />
            {lastname.length >= 15 && (
              <p className="tb-hint-warn">{20 - lastname.length} caracteres restantes</p>
            )}
          </div>
        </div>

        <div className="tb-form-group">
          <label className="tb-form-label">Email</label>
          <input
            type="email"
            value={user?.email}
            disabled
            className="tb-input tb-input--disabled"
          />
        </div>

        {error   && <p className="tb-msg-error">{error}</p>}
        {success && <p className="tb-msg-success">Perfil actualizado correctamente</p>}

        <button type="submit" disabled={loading} className="tb-btn-primary" style={{ width: 'auto', alignSelf: 'flex-start' }}>
          {loading ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </div>
  )
}
