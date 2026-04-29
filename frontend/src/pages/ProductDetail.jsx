import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import client from '../api/client'
import Header from '../components/Header'
import Login from './Login'
import { useAuthModal } from '../context/AuthModalContext'
import Register from './Register'
import Home from './Home'

export default function ProductDetail({ productId }) {
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
  const { modal, openLogin, openRegister, closeModal } = useAuthModal()
  const [home, setHome] = useState(false)

  useEffect(() => {
    client(`/products/${productId}`)
      .then(data => {
        setProduct(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [productId])

  // Comprobar si ya es favorito
  useEffect(() => {
    if (!user || !product) return
    client('/favorites')
      .then(favs => {
        const isFav = favs.some(f => f.id === product.id)
        setIsFavorite(isFav)
      })
      .catch(() => {})
  }, [user, product])

  // Cargar saldo del monedero si el usuario no es el propietario del producto
  useEffect(() => {
    if (!user || !product || user.id === product.user?.id) return
    client('/wallet')
      .then(data => setWalletBalance(Number(data?.balance || 0)))
      .catch(() => {})
  }, [user, product])

  const handleFavorite = async () => {
    if (!user) {
      openLogin()
      return
    }
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
      await client('/purchases', {
        method: 'POST',
        body: { product_id: product.id },
      })
      setBuySuccess(true)
      setProduct(prev => ({ ...prev, available: 'reservado' }))
    } catch (err) {
      setBuyError(err.message || 'Error al realizar la compra.')
    } finally {
      setBuyLoading(false)
    }
  }

  const handleContact = async () => {
    if (!user) {
      openLogin()
      return
    }
    try {
      const order = await client('/chat/conversations', {
        method: 'POST',
        body: { product_id: productId },
      })
      window.dispatchEvent(new CustomEvent('navigate:profile:chat', {
        detail: { orderId: order.id }
      }))
    } catch (err) {
      console.error(err)
    }
  }

  const conditionLabel = {
    nuevo:      { text: 'Nuevo',      color: 'bg-green-100 text-green-700 border-green-200' },
    casi_nuevo: { text: 'Casi nuevo', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    usado:      { text: 'Usado',      color: 'bg-gray-100 text-gray-600 border-gray-200' },
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center py-32">
          <p className="text-gray-400">Cargando producto...</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex justify-center items-center py-32">
          <p className="text-gray-400">Producto no encontrado</p>
        </div>
      </div>
    )
  }

  const images    = product.images || []
  const condition = conditionLabel[product.condition]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8">

        <button
          onClick={() => window.dispatchEvent(new CustomEvent('navigate:home'))}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-6 transition"
        >
          ← Volver
        </button>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">

            
            <div className="p-6 border-r border-gray-100">
              <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden mb-3">
                {images.length > 0 ? (
                  <img
                    src={images[selectedImage]?.image_url}
                    alt={product.name}
                    className="w-full h-full object-contain p-4"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    Sin imagen
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {images.map((img, index) => (
                    <button
                      key={img.id}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition ${
                        selectedImage === index
                          ? 'border-yellow-400'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={img.image_url}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-contain p-1"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 flex flex-col">
              {product.category && (
                <span className="text-xs text-gray-400 uppercase tracking-wider mb-2">
                  {product.category.name}
                </span>
              )}

              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                {product.name}
              </h1>

              <p className="text-3xl font-bold text-gray-900 mb-4">
                {Number(product.price).toFixed(2)}€
              </p>

              <div className="flex items-center gap-3 mb-6">
                <span className={`text-sm px-3 py-1 rounded-full border font-medium ${condition.color}`}>
                  {condition.text}
                </span>
              </div>

              {product.description && (
                <div className="mb-6">
                  <h2 className="text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wider">
                    Descripcion
                  </h2>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {product.user && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-6">
                  <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center font-bold text-black">
                  {product.user.avatar_url ? (
                    <img src={product.user.avatar_url} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    product.user.name.charAt(0).toUpperCase()
                  )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {product.user.name} {product.user.lastname}
                    </p>
                    <p className="text-xs text-gray-400">Vendedor</p>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 mt-auto">
                {user && user.id !== product.user?.id && product.available === 'disponible' && (
                  <>
                    {buySuccess ? (
                      <div className="w-full bg-green-50 border border-green-200 text-green-700 font-semibold py-3 rounded-xl text-center text-sm">
                        Solicitud enviada al vendedor
                      </div>
                    ) : (
                      <button
                        onClick={handleBuy}
                        disabled={buyLoading}
                        className="w-full bg-black text-white font-semibold py-3 rounded-xl hover:bg-gray-800 transition disabled:opacity-50"
                      >
                        {buyLoading ? 'Procesando...' : 'Comprar'}
                      </button>
                    )}
                    {buyError && (
                      <p className="text-xs text-red-500 text-center -mt-1">{buyError}</p>
                    )}
                  </>
                )}

                {user && user.id !== product.user?.id && product.available === 'reservado' && (
                  <div className="w-full bg-yellow-50 border border-yellow-200 text-yellow-700 font-semibold py-3 rounded-xl text-center text-sm">
                    Producto reservado
                  </div>
                )}

                {user && user.id !== product.user?.id && (
                  <button
                    onClick={handleContact}
                    className="w-full bg-yellow-400 text-black font-semibold py-3 rounded-xl hover:bg-yellow-300 transition"
                  >
                    Contactar con el vendedor
                  </button>
                )}

                {!product.already_purchased && user?.id !== product.user?.id && (
                  <button
                    onClick={handleFavorite}
                    disabled={favoriteLoading}
                    className={`w-full py-3 rounded-xl font-semibold border-2 transition flex items-center justify-center gap-2 ${
                      isFavorite
                        ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    <span className={isFavorite ? 'text-red-500' : 'text-gray-400'}>
                      {isFavorite ? '♥' : '♡'}
                    </span>
                    {favoriteLoading
                      ? 'Cargando...'
                      : isFavorite
                      ? 'Guardado en favoritos'
                      : 'Guardar en favoritos'}
                  </button>
                )}

                {modal === 'login' && (
                  <Login
                    onSwitch={() => openRegister()}
                    onSuccess={closeModal}
                    onClose={closeModal}
                  />
                )}
                {modal === 'register' && (
                  <Register
                    onSwitch={() => openLogin()}
                    onSuccess={closeModal}
                    onClose={closeModal}
                  />
                )}

                {!user && (
                  <p className="text-center text-xs text-gray-400">
                    Inicia sesion para contactar o guardar favoritos
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}