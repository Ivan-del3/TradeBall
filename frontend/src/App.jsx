import { useState, useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import { AuthModalProvider } from './context/AuthModalContext'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'

function App() {
  const { loading }     = useAuth()
  const [page, setPage] = useState({ name: 'home', params: {} })

  useEffect(() => {
    const handler = (e) => {
      const productId = e.detail?.productId
      if (productId) setPage({ name: 'product', params: { id: productId } })
    }
    window.addEventListener('navigate:product', handler)
    return () => window.removeEventListener('navigate:product', handler)
  }, [])

  useEffect(() => {
    const handler = () => setPage({ name: 'home', params: {} })
    window.addEventListener('navigate:home', handler)
    return () => window.removeEventListener('navigate:home', handler)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Cargando...</p>
      </div>
    )
  }

  return (
    <AuthModalProvider>
      {page.name === 'product' ? (
        <ProductDetail productId={page.params.id} />
      ) : (
        <Home />
      )}
    </AuthModalProvider>
  )
}

export default App