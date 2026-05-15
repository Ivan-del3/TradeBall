import { useState, useEffect } from 'react'
import client from '../../api/client'
import { LoadingCard, Empty } from './shared'
import Icon from '../Icon'
import ReviewPopup from './ReviewPopup'

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
    <div className="tb-card">
      <h2 className="tb-card-title">Mis compras</h2>

      {purchases.length === 0 ? (
        <Empty text="No tienes compras todavía" />
      ) : (
        <div className="tb-order-list">
          {purchases.map(order => (
            <PurchaseRow key={order.id} order={order} onReload={reload} />
          ))}
        </div>
      )}
    </div>
  )
}

const STATUS_CONFIG = {
  pendiente:             { label: 'Pendiente',             cls: 'tb-status-badge--pendiente' },
  confirmado:            { label: 'Enviado',               cls: 'tb-status-badge--confirmado' },
  devolucion_solicitada: { label: 'Devolución solicitada', cls: 'tb-status-badge--devolucion_solicitada' },
  completado:            { label: 'Completado',            cls: 'tb-status-badge--completado' },
  cancelado:             { label: 'Cancelado',             cls: 'tb-status-badge--cancelado' },
}

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] ?? { label: status, cls: '' }
  return (
    <span className={`tb-status-badge ${config.cls}`}>{config.label}</span>
  )
}

function PurchaseRow({ order, onReload }) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [reviewing, setReviewing] = useState(false)
  const [reviewed, setReviewed]   = useState(order.has_review ?? false)
  const image       = order.product?.main_image?.image_url
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
    <div className={`tb-order-row${needsAction ? ' tb-order-row--action' : ''}`}>
      <div className="tb-order-row-inner">
        <div
          onClick={handleProductClick}
          className="tb-order-thumb tb-order-thumb--clickable"
        >
          {image ? (
            <img src={image} alt={order.product?.name} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'var(--bg-3)', borderRadius: 'var(--r-sm)' }} />
          )}
        </div>

        <div className="tb-order-info" onClick={handleProductClick}>
          <p className="tb-order-product-name">{order.product?.name}</p>
          <p className="tb-order-seller">
            Vendedor: {order.seller?.name} {order.seller?.lastname}
          </p>
          {needsAction && (
            <p className="tb-order-action-label">
              El vendedor ha confirmado el envío — ¿has recibido el producto?
            </p>
          )}
        </div>

        <div className="tb-order-meta">
          <p className="tb-order-price">{Number(order.purchase_price).toFixed(2)}€</p>
          <p className="tb-order-date">
            {new Date(order.updated_at).toLocaleDateString('es-ES')}
          </p>
          <StatusBadge status={order.status} />
          {order.status === 'completado' && !reviewed && (
            <button
              onClick={e => { e.stopPropagation(); setReviewing(true) }}
              className="tb-btn-review"
            >
              <Icon name="star" size={14} /> Valorar
            </button>
          )}
        </div>
      </div>

      {needsAction && (
        <div className="tb-order-action-area">
          {error && <p className="tb-hint-error" style={{ marginBottom: 'var(--sp-2)' }}>{error}</p>}
          <div className="tb-order-action-btns">
            <button
              onClick={() => handleAction('buyer-confirm')}
              disabled={loading}
              className="tb-btn-confirm"
            >
              {loading ? 'Procesando...' : 'Producto recibido OK'}
            </button>
            <button
              onClick={() => handleAction('buyer-reject')}
              disabled={loading}
              className="tb-btn-reject"
            >
              Producto no conforme
            </button>
          </div>
        </div>
      )}

      {reviewing && (
        <ReviewPopup
          orderId={order.id}
          reviewedName={`${order.seller?.name} ${order.seller?.lastname}`}
          onDone={(submitted) => { setReviewing(false); if (submitted) setReviewed(true) }}
        />
      )}
    </div>
  )
}
