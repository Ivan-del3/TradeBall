import { useState, useEffect } from 'react'
import client from '../../api/client'
import { LoadingCard, Empty } from './shared'

export default function Purchases() {
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading]     = useState(true)

  const reload = () =>
    client('/purchases').then(data => setPurchases(data)).catch(() => {})

  useEffect(() => {
    client('/purchases')
      .then(data => { setPurchases(data); setLoading(false) })
      .catch(() => setLoading(false))

    const id = setInterval(reload, 15000)
    return () => clearInterval(id)
  }, [])

  if (loading) return <LoadingCard />

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Mis compras</h2>

      {purchases.length === 0 ? (
        <Empty text="No tienes compras todavía" />
      ) : (
        <div className="space-y-3">
          {purchases.map(order => (
            <PurchaseRow key={order.id} order={order} onReload={reload} />
          ))}
        </div>
      )}
    </div>
  )
}

const STATUS_CONFIG = {
  pendiente:             { label: 'Pendiente',             className: 'bg-yellow-100 text-yellow-700' },
  confirmado:            { label: 'Enviado',               className: 'bg-blue-100 text-blue-700' },
  devolucion_solicitada: { label: 'Devolución solicitada', className: 'bg-orange-100 text-orange-700' },
  completado:            { label: 'Completado',            className: 'bg-green-100 text-green-700' },
  cancelado:             { label: 'Cancelado',             className: 'bg-red-100 text-red-600' },
}

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: 'bg-gray-100 text-gray-500' }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${config.className}`}>
      {config.label}
    </span>
  )
}

function PurchaseRow({ order, onReload }) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const image = order.product?.main_image?.image_url
  const needsAction = order.status === 'confirmado'

  const handleProductClick = () => {
    window.dispatchEvent(new CustomEvent('navigate:product', {
      detail: { productId: order.product?.id, fromSection: 'purchases' }
    }))
  }

  const handleAction = async (endpoint) => {
    setLoading(true)
    setError('')
    try {
      await client(`/purchases/${order.id}/${endpoint}`, { method: 'POST' })
      onReload()
    } catch (err) {
      setError(err.message || 'Error al procesar la acción.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`p-3 border rounded-xl transition ${
      needsAction
        ? 'border-blue-300 bg-blue-50'
        : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
    }`}>
      <div className="flex items-center gap-4">
        <div
          onClick={handleProductClick}
          className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer"
        >
          {image ? (
            <img src={image} alt={order.product?.name} className="w-full h-full object-contain p-1" />
          ) : (
            <div className="w-full h-full bg-gray-100 rounded-lg" />
          )}
        </div>
        <div className="flex-1 min-w-0 cursor-pointer" onClick={handleProductClick}>
          <p className="text-sm font-medium text-gray-900 truncate">{order.product?.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            Vendedor: {order.seller?.name} {order.seller?.lastname}
          </p>
          {needsAction && (
            <p className="text-xs text-blue-600 font-medium mt-0.5">
              El vendedor ha confirmado el envío — ¿has recibido el producto?
            </p>
          )}
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-bold text-gray-900">
            {Number(order.purchase_price).toFixed(2)}€
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(order.updated_at).toLocaleDateString('es-ES')}
          </p>
          <StatusBadge status={order.status} />
        </div>
      </div>

      {needsAction && (
        <div className="mt-3 pt-3 border-t border-blue-200">
          {error && <p className="text-xs text-red-500 mb-2">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={() => handleAction('buyer-confirm')}
              disabled={loading}
              className="flex-1 bg-green-500 text-white font-semibold py-2 rounded-lg hover:bg-green-600 transition text-xs disabled:opacity-50"
            >
              {loading ? 'Procesando...' : 'Producto recibido OK'}
            </button>
            <button
              onClick={() => handleAction('buyer-reject')}
              disabled={loading}
              className="flex-1 border-2 border-red-200 text-red-500 font-semibold py-2 rounded-lg hover:bg-red-50 transition text-xs disabled:opacity-50"
            >
              Producto no conforme
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
