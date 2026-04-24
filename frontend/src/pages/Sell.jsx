import { useState, useEffect, useRef } from 'react'
import client from '../api/client'
import Header from '../components/Header'

export default function Sell() {
  const [categories, setCategories]       = useState([])
  const [images, setImages]               = useState([]) 
  const [previews, setPreviews]           = useState([])
  const [loading, setLoading]             = useState(false)
  const [errors, setErrors]               = useState({})
  const [success, setSuccess]             = useState(false)
  const fileInputRef                      = useRef(null)

  const [form, setForm] = useState({
    name:        '',
    description: '',
    price:       '',
    condition:   '',
    category_id: '',
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
    const newImages   = [...images, ...files]
    const newPreviews = [...previews, ...files.map(f => URL.createObjectURL(f))]
    setImages(newImages)
    setPreviews(newPreviews)
    setErrors(prev => ({ ...prev, images: null }))
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
    setPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim())    e.name        = 'El nombre es obligatorio'
    if (!form.price)          e.price       = 'El precio es obligatorio'
    if (Number(form.price) < 0) e.price     = 'El precio no puede ser negativo'
    if (!form.condition)      e.condition   = 'El estado es obligatorio'
    if (!form.category_id)    e.category_id = 'La categoría es obligatoria'
    if (images.length === 0)  e.images      = 'Añade al menos una imagen'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      Object.entries(form).forEach(([key, value]) => formData.append(key, value))
      images.forEach(img => formData.append('images[]', img))

      await client('/products', {
        method:     'POST',
        body:       formData,
        isFormData: true,
      })

      setSuccess(true)
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('navigate:home'))
      }, 2000)
    } catch (err) {
      if (err.errors) {
        setErrors(err.errors)
      } else {
        setErrors({ general: err.message || 'Error al publicar el producto' })
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex flex-col justify-center items-center py-32 gap-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl">
            ✓
          </div>
          <h2 className="text-xl font-bold text-gray-900">Producto publicado</h2>
          <p className="text-gray-400 text-sm">Redirigiendo a la página principal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">

        <button
          onClick={() => window.dispatchEvent(new CustomEvent('navigate:home'))}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition"
        >
          ← Volver
        </button>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h1 className="text-xl font-bold text-gray-900 mb-6">Publicar producto</h1>

          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fotos <span className="text-gray-400 font-normal">(máximo 5)</span>
              </label>

              <div className="flex flex-wrap gap-3">
                {previews.map((src, index) => (
                  <div key={index} className="relative w-24 h-24">
                    <img
                      src={src}
                      alt={`Imagen ${index + 1}`}
                      className={`w-full h-full object-cover rounded-xl border-2 ${
                        index === 0 ? 'border-yellow-400' : 'border-gray-200'
                      }`}
                    />
                    {index === 0 && (
                      <span className="absolute bottom-1 left-1 bg-yellow-400 text-black text-xs font-bold px-1.5 py-0.5 rounded-md">
                        Principal
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-gray-500 hover:text-red-500 shadow-sm transition"
                    >
                      ×
                    </button>
                  </div>
                ))}

                {images.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-yellow-400 hover:bg-yellow-50 transition"
                  >
                    <span className="text-2xl text-gray-300">+</span>
                    <span className="text-xs text-gray-400">Añadir</span>
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImages}
                className="hidden"
              />
              {errors.images && (
                <p className="text-xs text-red-500 mt-1">{errors.images}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del producto
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => update('name', e.target.value)}
                placeholder="Ej: Charizard VMAX Rainbow Rare"
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 ${
                  errors.name ? 'border-red-300' : 'border-gray-200'
                }`}
              />
              {errors.name && (
                <p className="text-xs text-red-500 mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <textarea
                value={form.description}
                onChange={e => update('description', e.target.value)}
                placeholder="Describe el estado del producto, si tiene caja original, etc."
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                <div className="relative">
                  <input
                    type="number"
                    value={form.price}
                    onChange={e => update('price', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 pr-8 ${
                      errors.price ? 'border-red-300' : 'border-gray-200'
                    }`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
                </div>
                {errors.price && (
                  <p className="text-xs text-red-500 mt-1">{errors.price}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={form.condition}
                  onChange={e => update('condition', e.target.value)}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white ${
                    errors.condition ? 'border-red-300' : 'border-gray-200'
                  }`}
                >
                  <option value="">Seleccionar</option>
                  <option value="nuevo">Nuevo</option>
                  <option value="casi_nuevo">Casi nuevo</option>
                  <option value="usado">Usado</option>
                </select>
                {errors.condition && (
                  <p className="text-xs text-red-500 mt-1">{errors.condition}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                value={form.category_id}
                onChange={e => update('category_id', e.target.value)}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white ${
                  errors.category_id ? 'border-red-300' : 'border-gray-200'
                }`}
              >
                <option value="">Seleccionar categoría</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.category_id && (
                <p className="text-xs text-red-500 mt-1">{errors.category_id}</p>
              )}
            </div>

            {errors.general && (
              <p className="text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">
                {errors.general}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-yellow-400 text-black font-semibold py-3 rounded-xl hover:bg-yellow-300 transition disabled:opacity-50 text-sm"
            >
              {loading ? 'Publicando...' : 'Publicar producto'}
            </button>

          </form>
        </div>
      </main>
    </div>
  )
}