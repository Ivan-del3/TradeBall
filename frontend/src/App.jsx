import { useState, useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import Profile from './pages/Profile'
import Sell from './pages/Sell'

function App() {
  const { loading }     = useAuth()
  const [page, setPage] = useState({ name: 'home', params: {} })

  useEffect(() => {
    const handlers = {
      'navigate:product':      (e) => setPage({ name: 'product', params: { id: e.detail?.productId } }),
      'navigate:profile':      ()  => setPage({ name: 'profile', params: {} }),
      'navigate:profile:chat': (e) => setPage({ name: 'profile', params: { section: 'chat', orderId: e.detail?.orderId } }),
      'navigate:sell':         ()  => setPage({ name: 'sell',    params: {} }),
      'navigate:home':         ()  => setPage({ name: 'home',    params: {} }),
    }

    Object.entries(handlers).forEach(([event, handler]) => {
      window.addEventListener(event, handler)
    })

    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        window.removeEventListener(event, handler)
      })
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Cargando...</p>
      </div>
    )
  }

  switch (page.name) {
    case 'product': return <ProductDetail productId={page.params.id} />
    case 'profile': return <Profile initialSection={page.params.section} initialOrderId={page.params.orderId} />
    case 'sell':    return <Sell />
    default:        return <Home />
  }
}

export default App