import { useState, useEffect, useRef } from 'react'
import { useAuth } from './context/AuthContext'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import Profile from './pages/Profile'
import Sell from './pages/Sell'

function App() {
  const { loading, user } = useAuth()
  const [history, setHistory] = useState(() => {
    try {
      const rawHistory = localStorage.getItem('trb_history')
      if (rawHistory) return JSON.parse(rawHistory)
      const rawPage = localStorage.getItem('trb_current_page')
      if (rawPage) return [JSON.parse(rawPage)]
    } catch {}
    return [{ name: 'home', params: {} }]
  })

  const historyRef = useRef(history)
  useEffect(() => { historyRef.current = history }, [history])

  const page     = history[history.length - 1]
  const canGoBack = history.length > 1

  useEffect(() => {
    const handleBeforeUnload = () => {
      const stack = historyRef.current
      localStorage.setItem('trb_history', JSON.stringify(stack))
      localStorage.setItem('trb_current_page', JSON.stringify(stack[stack.length - 1]))
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  useEffect(() => {
    const navigate = (newPage) => setHistory(prev => [...prev, newPage].slice(-10))
    const goBack   = ()       => setHistory(prev => prev.length > 1 ? prev.slice(0, -1) : prev)

    const handlers = {
      'navigate:product': (e) => {
        const fromSection = e.detail?.fromSection
        if (fromSection) {
          setHistory(prev => {
            const withSection = [...prev]
            withSection[withSection.length - 1] = { name: 'profile', params: { section: fromSection } }
            return [...withSection, { name: 'product', params: { id: e.detail?.productId } }].slice(-10)
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

  // Si la sesión expiró o el token fue invalidado, redirige a home
  // para no renderizar páginas que requieren usuario autenticado.
  useEffect(() => {
    if (!loading && !user && (page.name === 'profile' || page.name === 'sell')) {
      setHistory([{ name: 'home', params: {} }])
    }
  }, [loading, user, page.name])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Cargando...</p>
      </div>
    )
  }

  if (!user && page.name !== 'home' && page.name !== 'product') {
    return <Home />
  }

  switch (page.name) {
    case 'product': return <ProductDetail productId={page.params.id} canGoBack={canGoBack} />
    case 'profile': return <Profile initialSection={page.params.section} initialOrderId={page.params.orderId} />
    case 'sell':    return <Sell />
    default:        return <Home />
  }
}

export default App