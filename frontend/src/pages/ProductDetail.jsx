import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'
import Header from '../components/Header'
import Icon from '../components/Icon'
import Login from './Login'
import { useAuthModal } from '../context/AuthModalContext'
import Register from './Register'
import { usePageTitle } from '../hooks/usePageTitle'
import SellerReviewsModal from '../components/SellerReviewsModal'

export default function ProductDetail({ productId, canGoBack }) {
  const { user }                              = useAuth()
  const [product, setProduct]                 = useState(null)
  const [loading, setLoading]                 = useState(true)
  const [selectedImage, setSelectedImage]     = useState(0)
  const [isFavorite, setIsFavorite]           = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [walletBalance, setWalletBalance]     = useState(null)
  const [buyLoading, setBuyLoading]           = useState(false)
  const [buyError, setBuyError]               = useState('')
  const [buySuccess, setBuySuccess]           = useState(false)
  const [contactError, setContactError]       = useState('')
  const [gone, setGone]                       = useState(false)
  const [sellerReviews, setSellerReviews]     = useState(null)
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false)
  const { modal, openLogin, openRegister, closeModal } = useAuthModal()
  usePageTitle(product?.name ?? null)

  useEffect(() => {
    client(`/products/${productId}`)
      .then(data => { setProduct(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [productId])

  useEffect(() => {
    if (!user || !product) return
    client('/favorites')
      .then(favs => setIsFavorite(favs.some(f => f.id === product.id)))
      .catch(() => {})
  }, [user, product])

  useEffect(() => {
    if (!user || !product || user.id === product.user?.id) return
    client('/wallet')
      .then(data => setWalletBalance(Number(data?.balance || 0)))
      .catch(() => {})
  }, [user, product])

  useEffect(() => {
    if (!product?.user?.id) return
    client(`/users/${product.user.id}/reviews`)
      .then(data => setSellerReviews(data))
      .catch(() => setSellerReviews([]))
  }, [product?.user?.id])

  const handleFavorite = async () => {
    if (!user) { openLogin(); return }
    setFavoriteLoading(true)
    try {
      if (isFavorite) {
        await client(`/favorites/${productId}`, { method: 'DELETE' })
        setIsFavorite(false)
      } else {
        await client(`/favorites/${productId}`, { method: 'POST' })
        setIsFavorite(true)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setFavoriteLoading(false)
    }
  }

  const handleBuy = async () => {
    if (!user) { openLogin(); return }
    if (walletBalance !== null && walletBalance < product.price) {
      setBuyError('Saldo insuficiente. Recarga tu monedero antes de comprar.')
      return
    }
    setBuyLoading(true)
    setBuyError('')
    try {
      await client('/purchases', { method: 'POST', body: { product_id: product.id } })
      setBuySuccess(true)
      setProduct(prev => ({ ...prev, available: 'reservado' }))
    } catch (err) {
      if (err.message === 'Este producto ya no está disponible.') {
        setGone(true)
      } else {
        setBuyError(err.message || 'Error al realizar la compra.')
      }
    } finally {
      setBuyLoading(false)
    }
  }

  const handleContact = async () => {
    if (!user) { openLogin(); return }
    setContactError('')
    try {
      const order = await client('/chat/conversations', {
        method: 'POST',
        body: { product_id: productId },
      })
      window.dispatchEvent(new CustomEvent('navigate:profile:chat', {
        detail: { orderId: order.id }
      }))
    } catch (err) {
      if (err.message === 'Este producto ya no está disponible.') {
        setGone(true)
      } else {
        setContactError(err.message || 'No se pudo iniciar la conversación.')
      }
    }
  }

  const conditionBadge = {
    nuevo:      'tb-condition-badge--nuevo',
    casi_nuevo: 'tb-condition-badge--casi_nuevo',
    usado:      'tb-condition-badge--usado',
  }
  const conditionLabel = {
    nuevo:      'Nuevo',
    casi_nuevo: 'Casi nuevo',
    usado:      'Usado',
  }

  if (loading) {
    return (
      <div className="tb-page">
        <Header />
        <div className="tb-state-loading">
          <p className="tb-text-muted">Cargando producto...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="tb-page">
        <Header />
        <div className="tb-state-loading">
          <p className="tb-text-muted">Producto no encontrado</p>
        </div>
      </div>
    )
  }

  const images = product.images || []

  return (
    <div className="tb-page">
      <Header />
      <main className="tb-container-narrow">

        <button
          onClick={() => window.dispatchEvent(new CustomEvent(canGoBack ? 'navigate:back' : 'navigate:home'))}
          className="tb-btn-back"
        >
          <Icon name="arrow-left" size={16} /> Volver
        </button>

        <div className="tb-card" style={{ padding: 0 }}>
          <div className="tb-product-detail-grid">

            <div className="tb-product-gallery">
              <div className="tb-product-main-image">
                {images.length > 0 ? (
                  <img
                    src={images[selectedImage]?.image_url}
                    alt={product.name}
                    className="tb-img-contain"
                  />
                ) : (
                  <div className="tb-no-image">Sin imagen</div>
                )}
              </div>

              {images.length > 1 && (
                <div className="tb-product-thumbs">
                  {images.map((img, index) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(index)}
                      className={`tb-product-thumb${selectedImage === index ? ' tb-product-thumb--active' : ''}`}
                    >
                      <img
                        src={img.image_url}
                        alt={`${product.name} ${index + 1}`}
                        className="tb-img-contain-sm"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="tb-product-info-panel">
              {product.category && (
                <p className="tb-product-category">{product.category.name}</p>
              )}

              <h1 className="tb-product-title">{product.name}</h1>

              <p className="tb-product-price">{Number(product.price).toFixed(2)}€</p>

              <div className="tb-condition-row">
                <span className={`tb-condition-badge ${conditionBadge[product.condition] ?? ''}`}>
                  {conditionLabel[product.condition] ?? product.condition}
                </span>
              </div>

              {product.description && (
                <div className="tb-product-desc-section">
                  <p className="tb-product-desc-label">Descripción</p>
                  <p className="tb-product-desc-text">{product.description}</p>
                </div>
              )}

              {product.user && (() => {
                const avg = sellerReviews?.length
                  ? (sellerReviews.reduce((s, r) => s + r.rating, 0) / sellerReviews.length)
                  : null
                return (
                  <div
                    className="tb-seller-card tb-seller-card--clickable"
                    onClick={() => setReviewsModalOpen(o => !o)}
                  >
                    <div className="tb-seller-card-row">
                      <div className="tb-seller-avatar">
                        {product.user.avatar_url ? (
                          <img src={product.user.avatar_url} alt="Avatar" className="tb-img-cover-circle" />
                        ) : (
                          product.user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="tb-seller-text">
                        <p className="tb-seller-name">
                          {product.user.name} {product.user.lastname}
                        </p>
                        <p className="tb-seller-role">Vendedor</p>
                        {avg !== null && (
                          <div className="tb-seller-card-rating">
                            <div className="tb-stars">
                              {[1,2,3,4,5].map(s => (
                                <Icon key={s} name={s <= Math.round(avg) ? 'star-filled' : 'star'} size={12} color="var(--tb-red)" />
                              ))}
                            </div>
                            <span className="tb-seller-card-rating-text">
                              {avg.toFixed(1)} · {sellerReviews.length} valoracion{sellerReviews.length !== 1 ? 'es' : ''}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="tb-seller-card-end">
                        <Icon
                          name="chevron-down"
                          size={16}
                          color="var(--fg-3)"
                          style={{ transform: reviewsModalOpen ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })()}

              <div className="tb-product-actions">
                {gone && (
                  <div className="tb-notice">
                    Este producto ya no está disponible.
                  </div>
                )}

                {!gone && user && user.id !== product.user?.id && buySuccess && (
                  <div className="tb-notice">
                    Solicitud pendiente — esperando confirmación del vendedor
                  </div>
                )}

                {!gone && user && user.id !== product.user?.id && !buySuccess && product.available === 'disponible' && (
                  <>
                    <button onClick={handleBuy} disabled={buyLoading} className="tb-btn-buy">
                      {buyLoading ? 'Procesando...' : 'Comprar'}
                    </button>
                    {buyError && <p className="tb-hint-error" style={{ textAlign: 'center' }}>{buyError}</p>}
                  </>
                )}

                {!gone && user && user.id !== product.user?.id && !buySuccess && product.available === 'reservado' && (
                  <div className="tb-notice">Producto reservado</div>
                )}

                {!gone && user && user.id !== product.user?.id && product.available !== 'vendido' && (
                  <>
                    <button onClick={handleContact} className="tb-btn-contact">
                      Contactar con el vendedor
                    </button>
                    {contactError && <p className="tb-hint-error" style={{ textAlign: 'center' }}>{contactError}</p>}
                  </>
                )}

                {!gone && product.available !== 'vendido' && user?.id !== product.user?.id && (
                  <button
                    onClick={handleFavorite}
                    disabled={favoriteLoading}
                    className={`tb-btn-favorite${isFavorite ? ' tb-btn-favorite--active' : ''}`}
                  >
                    <Icon name={isFavorite ? 'heart-filled' : 'heart'} size={18} />
                    {favoriteLoading
                      ? 'Cargando...'
                      : isFavorite
                      ? 'Guardado en favoritos'
                      : 'Guardar en favoritos'}
                  </button>
                )}

                {modal === 'login' && (
                  <Login onSwitch={() => openRegister()} onSuccess={closeModal} onClose={closeModal} />
                )}
                {modal === 'register' && (
                  <Register onSwitch={() => openLogin()} onSuccess={closeModal} onClose={closeModal} />
                )}

                {user && user.id === product.user?.id && product.available === 'disponible' && (
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('navigate:sell', { detail: { productId: product.id } }))}
                    className="tb-btn-secondary"
                  >
                    <Icon name="edit" size={15} /> Editar producto
                  </button>
                )}

                {!user && product.available !== 'vendido' && (
                  <p className="tb-hint-text">
                    Inicia sesion para contactar o guardar favoritos
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {reviewsModalOpen && (
          <SellerReviewsModal
            seller={product.user}
            reviews={sellerReviews}
          />
        )}
      </main>
    </div>
  )
}

