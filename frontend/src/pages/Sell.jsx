import { useState, useEffect, useRef } from 'react'
import client from '../api/client'
import Header from '../components/Header'
import Icon from '../components/Icon'
import { usePageTitle } from '../hooks/usePageTitle'

export default function Sell() {
  usePageTitle('Vender')
  const [categories, setCategories] = useState([])
  const [images, setImages]         = useState([])
  const [previews, setPreviews]     = useState([])
  const [loading, setLoading]       = useState(false)
  const [errors, setErrors]         = useState({})
  const [success, setSuccess]       = useState(false)
  const fileInputRef                = useRef(null)

  const [form, setForm] = useState({
    name: '', description: '', price: '', condition: '', category_id: '',
  })

  useEffect(() => {
    client('/categories').then(setCategories).catch(() => {})
  }, [])

  const update = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
    setErrors(prev => ({ ...prev, [key]: null }))
  }

  const handleImages = (e) => {
    const files = Array.from(e.target.files)
    if (images.length + files.length > 5) {
      setErrors(prev => ({ ...prev, images: 'Máximo 5 imágenes' }))
      return
    }
    setImages([...images, ...files])
    setPreviews([...previews, ...files.map(f => URL.createObjectURL(f))])
    setErrors(prev => ({ ...prev, images: null }))
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim())               e.name        = 'El nombre es obligatorio'
    if (!form.price)                     e.price       = 'El precio es obligatorio'
    else if (Number(form.price) < 0)     e.price       = 'El precio no puede ser negativo'
    else if (Number(form.price) > 99999) e.price       = 'El precio máximo es 99.999€'
    if (!form.condition)                 e.condition   = 'El estado es obligatorio'
    if (!form.category_id)               e.category_id = 'La categoría es obligatoria'
    if (images.length === 0)             e.images      = 'Añade al menos una imagen'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return }

    setLoading(true)
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([key, value]) => formData.append(key, value))
      images.forEach(img => formData.append('images[]', img))

      await client('/products', { method: 'POST', body: formData, isFormData: true })

      setSuccess(true)
      setTimeout(() => window.dispatchEvent(new CustomEvent('navigate:home')), 2000)
    } catch (err) {
      if (err.errors) setErrors(err.errors)
      else setErrors({ general: err.message || 'Error al publicar el producto' })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="tb-page">
        <Header />
        <div className="tb-sell-success">
          <div className="tb-sell-success-icon"><Icon name="check" size={32} color="var(--badge-green-fg)" /></div>
          <h2 className="tb-sell-success-title">Producto publicado</h2>
          <p className="tb-text-muted">Redirigiendo a la página principal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="tb-page">
      <Header />
      <main className="tb-container-form">
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('navigate:home'))}
          className="tb-btn-back"
        >
          <Icon name="arrow-left" size={16} /> Volver
        </button>

        <div className="tb-card">
          <h1 className="tb-card-title">Publicar producto</h1>

          <form onSubmit={handleSubmit} className="tb-form-stack-lg">

            <div className="tb-form-group">
              <label className="tb-form-label">
                Fotos <span className="tb-text-muted" style={{ fontWeight: 400 }}>(máximo 5)</span>
              </label>

              <div className="tb-upload-grid">
                {previews.map((src, index) => (
                  <div key={index} className="tb-upload-preview">
                    <img
                      src={src}
                      alt={`Imagen ${index + 1}`}
                      className={`tb-upload-img${index === 0 ? ' tb-upload-img--primary' : ''}`}
                    />
                    {index === 0 && (
                      <span className="tb-upload-badge-primary">Principal</span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="tb-upload-remove"
                    >
                      <Icon name="x" size={12} />
                    </button>
                  </div>
                ))}

                {images.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="tb-upload-add"
                  >
                    <span className="tb-upload-add-icon">+</span>
                    <span className="tb-upload-add-label">Añadir</span>
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImages}
                style={{ display: 'none' }}
              />
              {errors.images && <p className="tb-hint-error">{errors.images}</p>}
            </div>

            <div className="tb-form-group">
              <label className="tb-form-label">Nombre del producto</label>
              <input
                type="text"
                value={form.name}
                onChange={e => update('name', e.target.value)}
                placeholder="Ej: Charizard VMAX Rainbow Rare"
                maxLength={150}
                className={`tb-input${errors.name ? ' tb-input--error' : ''}`}
              />
              {form.name.length >= 140 && (
                <p className="tb-hint-warn">{150 - form.name.length} caracteres restantes</p>
              )}
              {errors.name && <p className="tb-hint-error">{errors.name}</p>}
            </div>

            <div className="tb-form-group">
              <label className="tb-form-label">
                Descripción <span className="tb-text-muted" style={{ fontWeight: 400 }}>(opcional)</span>
              </label>
              <textarea
                value={form.description}
                onChange={e => update('description', e.target.value)}
                placeholder="Describe el estado del producto, si tiene caja original, etc."
                rows={4}
                maxLength={2000}
                className="tb-textarea"
              />
              {form.description.length >= 1900 && (
                <p className="tb-hint-warn">{2000 - form.description.length} caracteres restantes</p>
              )}
            </div>

            <div className="tb-form-row-2">
              <div className="tb-form-group">
                <label className="tb-form-label">Precio</label>
                <div className="tb-input-suffix-wrap">
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => update('price', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    max="99999"
                    step="0.01"
                    className={`tb-input${errors.price ? ' tb-input--error' : ''}`}
                    style={{ paddingRight: '28px' }}
                  />
                  <span className="tb-input-suffix">€</span>
                </div>
                {errors.price && <p className="tb-hint-error">{errors.price}</p>}
              </div>

              <div className="tb-form-group">
                <label className="tb-form-label">Estado</label>
                <select
                  value={form.condition}
                  onChange={e => update('condition', e.target.value)}
                  className={`tb-select${errors.condition ? ' tb-select--error' : ''}`}
                >
                  <option value="">Seleccionar</option>
                  <option value="nuevo">Nuevo</option>
                  <option value="casi_nuevo">Casi nuevo</option>
                  <option value="usado">Usado</option>
                </select>
                {errors.condition && <p className="tb-hint-error">{errors.condition}</p>}
              </div>
            </div>

            <div className="tb-form-group">
              <label className="tb-form-label">Categoría</label>
              <select
                value={form.category_id}
                onChange={e => update('category_id', e.target.value)}
                className={`tb-select${errors.category_id ? ' tb-select--error' : ''}`}
              >
                <option value="">Seleccionar categoría</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.category_id && <p className="tb-hint-error">{errors.category_id}</p>}
            </div>

            {errors.general && (
              <p className="tb-msg-error">{errors.general}</p>
            )}

            <button type="submit" disabled={loading} className="tb-btn-primary">
              {loading ? 'Publicando...' : 'Publicar producto'}
            </button>

          </form>
        </div>
      </main>
    </div>
  )
}
