import { useState, useEffect } from 'react'
import client from '../../api/client'
import { LoadingCard, Empty } from './shared'

const STATUS_LABEL = {
  disponible:  { text: 'Disponible',  color: 'bg-green-100 text-green-700' },
  reservado:   { text: 'Reservado',   color: 'bg-yellow-100 text-yellow-700' },
  vendido:     { text: 'Vendido',     color: 'bg-gray-100 text-gray-500' },
}

export default function Sales() {
  const [sales, setSales]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client('/sales')
      .then(data => { setSales(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <LoadingCard />

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Mis ventas</h2>

      {sales.length === 0 ? (
        <Empty text="No tienes productos en venta" />
      ) : (
        <div className="space-y-3">
          {sales.map(product => (
            <SaleRow key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}

function SaleRow({ product }) {
  const image = product.main_image?.image_url
  const status = STATUS_LABEL[product.available] || STATUS_LABEL['disponible']

  const handleClick = () => {
    window.dispatchEvent(new CustomEvent('navigate:product', {
      detail: { productId: product.id }
    }))
  }

  return (
    <div
      onClick={handleClick}
      className="flex items-center gap-4 p-3 border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm transition cursor-pointer"
    >
      <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        {image ? (
          <img src={image} alt={product.name} className="w-full h-full object-contain p-1" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
            Sin imagen
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{product.category?.name}</p>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <span className="text-sm font-bold text-gray-900">{Number(product.price).toFixed(2)}€</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
          {status.text}
        </span>
      </div>
    </div>
  )
}