import { useState, useEffect } from 'react'
import { useAuth } from './context/AuthContext'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import Profile from './pages/Profile'
import Sell from './pages/Sell'

function App() {
  const { loading } = useAuth()
  const [history, setHistory] = useState(() => {
    try {
      const raw = localStorage.getItem('trb_current_page')
      if (raw) return [JSON.parse(raw)]
    } catch {}
    return [{ name: 'home', params: {} }]
  })

  const page     = history[history.length - 1]
  const canGoBack = history.length > 1

  useEffect(() => {
    console.log(page)
    localStorage.setItem('trb_current_page', JSON.stringify(page))
  }, [page])

  useEffect(() => {
    const navigate = (newPage) => setHistory(prev => [...prev, newPage])
    const goBack   = ()       => setHistory(prev => prev.length > 1 ? prev.slice(0, -1) : prev)

    const handlers = {
      'navigate:product': (e) => {
        const fromSection = e.detail?.fromSection
        if (fromSection) {
          setHistory(prev => {
            const withSection = [...prev]
            withSection[withSection.length - 1] = { name: 'profile', params: { section: fromSection } }
            return [...withSection, { name: 'product', params: { id: e.detail?.productId } }]
          })
        } else {
          navigate({ name: 'product', params: { id: e.detail?.productId } })
        }
      },
      'navigate:profile':      (e)  => navigate({ name: 'profile', params: {section: e.detail?.section} }),
      'navigate:profile:chat': (e) => navigate({ name: 'profile', params: { section: 'chat', orderId: e.detail?.orderId } }),
      'navigate:sell':         ()  => navigate({ name: 'sell',    params: {} }),
      'navigate:home':         ()  => setHistory([{ name: 'home', params: {} }]), 
      'navigate:back':         ()  => goBack(),
    }

    Object.entries(handlers).forEach(([event, handler]) => window.addEventListener(event, handler))
    return () => Object.entries(handlers).forEach(([event, handler]) => window.removeEventListener(event, handler))
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