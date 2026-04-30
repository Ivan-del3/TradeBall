import { useState, useEffect } from 'react'
import client from '../../api/client'
import { LoadingCard, Empty } from './shared'

export default function Purchases() {
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    client('/purchases')
      .then(data => { setPurchases(data); setLoading(false) })
      .catch(() => setLoading(false))

    const id = setInterval(() => {
      client('/purchases')
        .then(data => setPurchases(data))
        .catch(() => {})
    }, 15000)
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
            <PurchaseRow key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}

const STATUS_CONFIG = {
  pendiente:  { label: 'Reservado',  className: 'bg-yellow-100 text-yellow-700' },
  completado: { label: 'Completado', className: 'bg-green-100 text-green-700' },
  cancelado:  { label: 'Cancelado',  className: 'bg-red-100 text-red-600' },
}

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: 'bg-gray-100 text-gray-500' }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${config.className}`}>
      {config.label}
    </span>
  )
}

function PurchaseRow({ order }) {
  const image = order.product?.main_image?.image_url

  const handleClick = () => {
    window.dispatchEvent(new CustomEvent('navigate:product', {
      detail: { productId: order.product?.id }
    }))
  }

  return (
    <div
      onClick={handleClick}
      className="flex items-center gap-4 p-3 border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm transition cursor-pointer"
    >
      <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        {image ? (
          <img src={image} alt={order.product?.name} className="w-full h-full object-contain p-1" />
        ) : (
          <div className="w-full h-full bg-gray-100 rounded-lg" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{order.product?.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          Vendedor: {order.seller?.name} {order.seller?.lastname}
        </p>
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
  )
}
