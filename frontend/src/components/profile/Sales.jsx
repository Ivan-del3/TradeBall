import { useState, useEffect, useCallback } from 'react'
import client from '../../api/client'
import { LoadingCard, Empty } from './shared'

const STATUS_LABEL = {
  disponible: { text: 'A la venta',  color: 'bg-green-100 text-green-700' },
  reservado:  { text: 'En curso',    color: 'bg-yellow-100 text-yellow-700' },
  vendido:    { text: 'Finalizado',  color: 'bg-gray-100 text-gray-500' },
}

export default function Sales() {
  const [sales, setSales]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [popup, setPopup]           = useState(null) // product with pending_order
  const [actionLoading, setAction]  = useState(false)
  const [actionError, setActionErr] = useState('')

  const loadSales = useCallback(() => {
    client('/sales')
      .then(data => { setSales(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  // Initial load + polling every 3s (same pattern as Chat)
  useEffect(() => {
    loadSales()
    const id = setInterval(loadSales, 3000)
    return () => clearInterval(id)
  }, [loadSales])

  // Count products with pending purchase requests
  const pendingCount = sales.filter(p => p.pending_order).length

  const openPopup = (product) => {
    setPopup(product)
    setActionErr('')
  }

  const closePopup = () => {
    setPopup(null)
    setActionErr('')
  }

  const handleConfirm = async () => {
    if (!popup?.pending_order) return
    setAction(true)
    setActionErr('')
    try {
      await client(`/purchases/${popup.pending_order.id}/confirm`, { method: 'POST' })
      setSales(prev => prev.map(p =>
        p.id === popup.id
          ? { ...p, available: 'vendido', pending_order: null }
          : p
      ))
      closePopup()
    } catch (err) {
      setActionErr(err.message || 'Error al confirmar.')
    } finally {
      setAction(false)
    }
  }

  const handleReject = async () => {
    if (!popup?.pending_order) return
    setAction(true)
    setActionErr('')
    try {
      await client(`/purchases/${popup.pending_order.id}/reject`, { method: 'POST' })
      setSales(prev => prev.map(p =>
        p.id === popup.id
          ? { ...p, available: 'disponible', pending_order: null }
          : p
      ))
      closePopup()
    } catch (err) {
      setActionErr(err.message || 'Error al rechazar.')
    } finally {
      setAction(false)
    }
  }

  if (loading) return <LoadingCard />

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900">Mis ventas</h2>
          {pendingCount > 0 && (
            <span className="bg-yellow-400 text-black text-xs font-bold px-2.5 py-1 rounded-full">
              {pendingCount} solicitud{pendingCount > 1 ? 'es' : ''} pendiente{pendingCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {sales.length === 0 ? (
          <Empty text="No tienes productos en venta" />
        ) : (
          <div className="space-y-3">
            {sales.map(product => (
              <SaleRow
                key={product.id}
                product={product}
                onOpenPopup={openPopup}
              />
            ))}
          </div>
        )}
      </div>

      {popup && (
        <PurchasePopup
          product={popup}
          loading={actionLoading}
          error={actionError}
          onConfirm={handleConfirm}
          onReject={handleReject}
          onClose={closePopup}
        />
      )}
    </>
  )
}

function SaleRow({ product, onOpenPopup }) {
  const image   = product.main_image?.image_url
  const status  = STATUS_LABEL[product.available] ?? STATUS_LABEL['disponible']
  const hasPending = !!product.pending_order

  const handleClick = () => {
    if (hasPending) {
      onOpenPopup(product)
    } else {
      window.dispatchEvent(new CustomEvent('navigate:product', {
        detail: { productId: product.id }
      }))
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`relative flex items-center gap-4 p-3 border rounded-xl transition cursor-pointer ${
        hasPending
          ? 'border-yellow-300 bg-yellow-50 hover:border-yellow-400'
          : 'border-gray-100 hover:border-gray-200 hover:shadow-sm'
      }`}
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
        {hasPending && (
          <p className="text-xs text-yellow-700 font-medium mt-0.5">
            {product.pending_order.buyer?.name} {product.pending_order.buyer?.lastname} quiere comprarlo
          </p>
        )}
      </div>

      <div className="flex flex-col items-end gap-1.5">
        <span className="text-sm font-bold text-gray-900">{Number(product.price).toFixed(2)}€</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
          {status.text}
        </span>
        {hasPending && (
          <span className="bg-yellow-400 text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            1
          </span>
        )}
      </div>
    </div>
  )
}

function PurchasePopup({ product, loading, error, onConfirm, onReject, onClose }) {
  const order = product.pending_order
  const image = product.main_image?.image_url

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-gray-900">Solicitud de compra</h3>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition text-lg"
          >
            ×
          </button>
        </div>

        {/* Product info */}
        <div className="flex items-center gap-4 mb-5 p-3 bg-gray-50 rounded-xl">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-white flex-shrink-0 border border-gray-100">
            {image ? (
              <img src={image} alt={product.name} className="w-full h-full object-contain p-1" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                Sin imagen
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
            <p className="text-lg font-bold text-gray-900 mt-0.5">{Number(product.price).toFixed(2)}€</p>
          </div>
        </div>

        {/* Buyer info */}
        <div className="mb-5">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Comprador</p>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-black text-sm flex-shrink-0 overflow-hidden">
              {order?.buyer?.avatar_url ? (
                <img src={order.buyer.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                order?.buyer?.name?.charAt(0)?.toUpperCase()
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {order?.buyer?.name} {order?.buyer?.lastname}
              </p>
              <p className="text-xs text-gray-400">{order?.buyer?.email}</p>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-500 mb-4">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-yellow-400 text-black font-semibold py-2.5 rounded-xl hover:bg-yellow-300 transition text-sm disabled:opacity-50"
          >
            {loading ? 'Procesando...' : 'Confirmar venta'}
          </button>
          <button
            onClick={onReject}
            disabled={loading}
            className="flex-1 border-2 border-red-200 text-red-500 font-semibold py-2.5 rounded-xl hover:bg-red-50 transition text-sm disabled:opacity-50"
          >
            Rechazar
          </button>
        </div>
      </div>
    </div>
  )
}
