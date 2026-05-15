import { useState, useEffect } from 'react'
import client from '../../api/client'
import { LoadingCard, Empty } from './shared'
import Icon from '../Icon'
import { useAuth } from '../../context/AuthContext'
import ReviewPopup from './ReviewPopup'

const STATUS_LABEL = {
  disponible: { text: 'A la venta',  cls: 'tb-status-badge--disponible' },
  pausado:    { text: 'Pausado',     cls: 'tb-status-badge--vendido' },
  reservado:  { text: 'En curso',    cls: 'tb-status-badge--reservado' },
  vendido:    { text: 'Finalizado',  cls: 'tb-status-badge--vendido' },
}

export default function Sales() {
  const { user }                    = useAuth()
  const [sales, setSales]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [popup, setPopup]           = useState(null)
  const [actionLoading, setAction]  = useState(false)
  const [actionError, setActionErr] = useState('')

  const reload = () =>
    client('/sales').then(data => setSales(data)).catch(() => {})

  useEffect(() => {
    client('/sales')
      .then(data => { setSales(data); setLoading(false) })
      .catch(() => setLoading(false))

    const id = setInterval(reload, 15000)
    return () => clearInterval(id)
  }, [])

  const pendingCount = sales.filter(p => p.pending_order).length

  const openPopup  = (product) => { setPopup(product); setActionErr('') }
  const closePopup = ()        => { setPopup(null);    setActionErr('') }

  const handleToggleVisibility = async (productId) => {
    try {
      const updated = await client(`/products/${productId}/toggle-visibility`, { method: 'PATCH' })
      setSales(prev => prev.map(p => p.id === productId ? { ...p, visible: updated.visible } : p))
    } catch {}
  }

  const handleDelete = async (productId) => {
    try {
      await client(`/products/${productId}`, { method: 'DELETE' })
      setSales(prev => prev.filter(p => p.id !== productId))
    } catch {}
  }

  const handleConfirm = async () => {
    if (!popup?.pending_order) return
    setAction(true); setActionErr('')
    try {
      await client(`/purchases/${popup.pending_order.id}/confirm`, { method: 'POST' })
      setSales(prev => prev.map(p => p.id === popup.id ? { ...p, pending_order: null } : p))
      closePopup()
    } catch (err) {
      setActionErr(err.message || 'Error al confirmar.')
    } finally {
      setAction(false)
    }
  }

  const handleReject = async () => {
    if (!popup?.pending_order) return
    setAction(true); setActionErr('')
    try {
      await client(`/purchases/${popup.pending_order.id}/reject`, { method: 'POST' })
      setSales(prev => prev.map(p =>
        p.id === popup.id ? { ...p, available: 'disponible', pending_order: null } : p
      ))
      closePopup()
    } catch (err) {
      setActionErr(err.message || 'Error al rechazar.')
    } finally {
      setAction(false)
    }
  }

  const handleConfirmReturn = async () => {
    if (!popup?.pending_order) return
    setAction(true); setActionErr('')
    try {
      await client(`/purchases/${popup.pending_order.id}/confirm-return`, { method: 'POST' })
      setSales(prev => prev.map(p =>
        p.id === popup.id ? { ...p, available: 'disponible', pending_order: null } : p
      ))
      closePopup()
    } catch (err) {
      setActionErr(err.message || 'Error al confirmar la devolución.')
    } finally {
      setAction(false)
    }
  }

  if (loading) return <LoadingCard />

  return (
    <>
      <div className="tb-card">
        <div className="tb-section-header">
          <h2 className="tb-section-title">Mis ventas</h2>
          {pendingCount > 0 && (
            <span className="tb-pending-count">
              {pendingCount} solicitud{pendingCount > 1 ? 'es' : ''} pendiente{pendingCount > 1 ? 's' : ''}
            </span>
          )}
        </div>

        {sales.length === 0 ? (
          <Empty text="No tienes productos en venta" />
        ) : (
          <div className="tb-order-list">
            {sales.map(product => (
              <SaleRow key={product.id} product={product} userId={user?.id} onOpenPopup={openPopup} onToggleVisibility={handleToggleVisibility} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {popup && (
        popup.pending_order?.status === 'devolucion_solicitada' ? (
          <ReturnPopup
            product={popup}
            loading={actionLoading}
            error={actionError}
            onConfirmReturn={handleConfirmReturn}
            onClose={closePopup}
          />
        ) : (
          <PurchasePopup
            product={popup}
            loading={actionLoading}
            error={actionError}
            onConfirm={handleConfirm}
            onReject={handleReject}
            onClose={closePopup}
          />
        )
      )}
    </>
  )
}

function SaleRow({ product, userId, onOpenPopup, onToggleVisibility, onDelete }) {
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [reviewing, setReviewing]               = useState(false)
  const [reviewed, setReviewed]                 = useState(
    product.completed_order?.reviews?.some(r => r.user_id === userId) ?? false
  )

  const image      = product.main_image?.image_url
  const statusKey  = product.available === 'disponible' && !product.visible ? 'pausado' : product.available
  const status     = STATUS_LABEL[statusKey] ?? STATUS_LABEL['disponible']
  const hasPending = !!product.pending_order
  const isReturn   = product.pending_order?.status === 'devolucion_solicitada'

  const handleClick = () => {
    if (hasPending) {
      onOpenPopup(product)
    } else {
      window.dispatchEvent(new CustomEvent('navigate:product', {
        detail: { productId: product.id, fromSection: 'sales' }
      }))
    }
  }

  return (
    <div
      onClick={handleClick}
      className={`tb-sale-row${isReturn ? ' tb-sale-row--return' : hasPending ? ' tb-sale-row--pending' : ''}`}
    >
      <div className="tb-sale-thumb">
        {image ? (
          <img src={image} alt={product.name} />
        ) : (
          <span className="tb-sale-thumb-empty">Sin imagen</span>
        )}
      </div>

      <div className="tb-sale-info">
        <p className="tb-sale-name">{product.name}</p>
        <p className="tb-sale-category">{product.category?.name}</p>
        {isReturn ? (
          <p className="tb-sale-buyer-msg tb-sale-buyer-msg--return">
            {product.pending_order.buyer?.name} {product.pending_order.buyer?.lastname} solicita devolución
          </p>
        ) : hasPending ? (
          <p className="tb-sale-buyer-msg tb-sale-buyer-msg--pending">
            {product.pending_order.buyer?.name} {product.pending_order.buyer?.lastname} quiere comprarlo
          </p>
        ) : null}
      </div>

      <div className="tb-sale-status">
        <span className="tb-sale-price">{Number(product.price).toFixed(2)}€</span>
        <span className={`tb-status-badge ${status.cls}`}>{status.text}</span>
        {hasPending && (
          <span className={`tb-sale-badge-dot ${isReturn ? 'tb-sale-badge-dot--return' : 'tb-sale-badge-dot--pending'}`}>
            1
          </span>
        )}
        {!hasPending && product.available === 'disponible' && (
          <>
            {confirmingDelete ? (
              <>
                <button
                  className="tb-sale-edit-btn tb-sale-edit-btn--danger"
                  title="Confirmar eliminación"
                  onClick={e => { e.stopPropagation(); onDelete(product.id) }}
                >
                  <Icon name="check" size={14} />
                </button>
                <button
                  className="tb-sale-edit-btn"
                  title="Cancelar"
                  onClick={e => { e.stopPropagation(); setConfirmingDelete(false) }}
                >
                  <Icon name="x" size={14} />
                </button>
              </>
            ) : (
              <>
                <button
                  className="tb-sale-edit-btn"
                  onClick={e => {
                    e.stopPropagation()
                    window.dispatchEvent(new CustomEvent('navigate:sell', { detail: { productId: product.id } }))
                  }}
                >
                  <Icon name="edit" size={14} />
                </button>
                <button
                  className="tb-sale-edit-btn"
                  title={product.visible ? 'Pausar anuncio' : 'Reactivar anuncio'}
                  onClick={e => { e.stopPropagation(); onToggleVisibility(product.id) }}
                >
                  <Icon name={product.visible ? 'eye' : 'eye-off'} size={14} />
                </button>
                <button
                  className="tb-sale-edit-btn tb-sale-edit-btn--danger"
                  title="Eliminar producto"
                  onClick={e => { e.stopPropagation(); setConfirmingDelete(true) }}
                >
                  <Icon name="trash" size={14} />
                </button>
              </>
            )}
          </>
        )}
        {product.available === 'vendido' && product.completed_order && !reviewed && (
          <button
            className="tb-sale-edit-btn"
            title="Valorar comprador"
            onClick={e => { e.stopPropagation(); setReviewing(true) }}
          >
            <Icon name="star" size={14} />
          </button>
        )}
      </div>

      {reviewing && (
        <ReviewPopup
          orderId={product.completed_order.id}
          reviewedName={`${product.completed_order.buyer?.name} ${product.completed_order.buyer?.lastname}`}
          onDone={(submitted) => { setReviewing(false); if (submitted) setReviewed(true) }}
        />
      )}
    </div>
  )
}

function PurchasePopup({ product, loading, error, onConfirm, onReject, onClose }) {
  const order = product.pending_order
  const image = product.main_image?.image_url

  return (
    <div className="tb-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="tb-popup">
        <div className="tb-modal-header">
          <h3 className="tb-modal-title--sm">Solicitud de compra</h3>
          <button onClick={onClose} className="tb-popup-close"><Icon name="x" size={18} /></button>
        </div>

        <div className="tb-popup-product">
          <div className="tb-popup-thumb">
            {image ? (
              <img src={image} alt={product.name} />
            ) : (
              <span className="tb-popup-thumb-empty">Sin imagen</span>
            )}
          </div>
          <div className="tb-popup-info">
            <p className="tb-popup-product-name">{product.name}</p>
            <p className="tb-popup-product-price">{Number(order.purchase_price).toFixed(2)}€</p>
          </div>
        </div>

        <div className="tb-popup-buyer">
          <p className="tb-label-meta" style={{ marginBottom: 'var(--sp-2)' }}>Comprador</p>
          <div className="tb-popup-buyer-row">
            <div className="tb-buyer-avatar">
              {order?.buyer?.avatar_url ? (
                <img src={order.buyer.avatar_url} alt="Avatar" />
              ) : (
                order?.buyer?.name?.charAt(0)?.toUpperCase()
              )}
            </div>
            <div>
              <p className="tb-buyer-name">{order?.buyer?.name} {order?.buyer?.lastname}</p>
              <p className="tb-buyer-email">{order?.buyer?.email}</p>
            </div>
          </div>
        </div>

        {error && <p className="tb-hint-error" style={{ marginBottom: 'var(--sp-4)' }}>{error}</p>}

        <div className="tb-popup-actions">
          <button onClick={onConfirm} disabled={loading} className="tb-btn-primary" style={{ flex: 1 }}>
            {loading ? 'Procesando...' : 'Confirmar venta'}
          </button>
          <button onClick={onReject} disabled={loading} className="tb-btn-danger-outline">
            Rechazar
          </button>
        </div>
      </div>
    </div>
  )
}

function ReturnPopup({ product, loading, error, onConfirmReturn, onClose }) {
  const order = product.pending_order
  const image = product.main_image?.image_url

  return (
    <div className="tb-overlay" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="tb-popup">
        <div className="tb-modal-header">
          <h3 className="tb-modal-title--sm">Solicitud de devolución</h3>
          <button onClick={onClose} className="tb-popup-close"><Icon name="x" size={18} /></button>
        </div>

        <div className="tb-popup-product tb-popup-product--return">
          <div className="tb-popup-thumb">
            {image ? (
              <img src={image} alt={product.name} />
            ) : (
              <span className="tb-popup-thumb-empty">Sin imagen</span>
            )}
          </div>
          <div className="tb-popup-info">
            <p className="tb-popup-product-name">{product.name}</p>
            <p className="tb-popup-product-price">{Number(product.price).toFixed(2)}€</p>
          </div>
        </div>

        <div className="tb-return-notice">
          <p className="tb-return-text">
            El comprador <strong>{order?.buyer?.name} {order?.buyer?.lastname}</strong> indica
            que el producto no está en las condiciones esperadas y solicita devolvértelo.
          </p>
          <p className="tb-return-note">
            Cuando recibas el producto de vuelta, confirma la devolución para que se vuelva a poner a la venta.
          </p>
        </div>

        {error && <p className="tb-hint-error" style={{ marginBottom: 'var(--sp-4)' }}>{error}</p>}

        <button onClick={onConfirmReturn} disabled={loading} className="tb-btn-danger-solid">
          {loading ? 'Procesando...' : 'He recibido la devolución'}
        </button>
      </div>
    </div>
  )
}
