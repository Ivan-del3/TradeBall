import { useState, useEffect } from 'react'
import client from '../api/client'
import ProductCard from '../components/ProductCard'

export default function Favorites({ onClose }) {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    client('/favorites')
      .then(data => {
        setFavorites(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-xl">

        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Mis favoritos</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition text-xl font-light"
          >
            X
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <p className="text-gray-400 text-sm">Cargando favoritos...</p>
            </div>
          ) : favorites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <p className="text-4xl">♡</p>
              <p className="text-gray-400 text-sm">No tienes favoritos todavia</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {favorites.map(product => (
                <div key={product.id} onClick={onClose}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}