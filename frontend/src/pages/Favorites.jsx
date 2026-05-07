import { useState, useEffect } from 'react'
import client from '../api/client'
import ProductCard from '../components/ProductCard'
import Icon from '../components/Icon'

export default function Favorites({ onClose }) {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    client('/favorites')
      .then(data => { setFavorites(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="tb-overlay tb-overlay--right">
      <div className="tb-drawer">
        <div className="tb-drawer-header">
          <h2 className="tb-drawer-title">Mis favoritos</h2>
          <button onClick={onClose} className="tb-drawer-close"><Icon name="x" size={20} /></button>
        </div>

        <div className="tb-drawer-body">
          {loading ? (
            <div className="tb-loading-state">
              <p className="tb-text-muted">Cargando favoritos...</p>
            </div>
          ) : favorites.length === 0 ? (
            <div className="tb-empty-center">
              <Icon name="heart" size={40} style={{ color: 'var(--fg-4)' }} />
              <p className="tb-text-muted">No tienes favoritos todavia</p>
            </div>
          ) : (
            <div className="tb-favs-grid">
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
