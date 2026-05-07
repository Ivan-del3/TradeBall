import { useReducer, useEffect, useRef } from 'react'
import { useAuth } from './context/AuthContext'
import Home from './pages/Home'
import ProductDetail from './pages/ProductDetail'
import Profile from './pages/Profile'
import Sell from './pages/Sell'

function navReducer(state, action) {
  switch (action.type) {
    case 'PUSH':
      return {
        history: [...state.history, action.page].slice(-10),
        future: [],
      }
    case 'PUSH_FROM_SECTION': {
      const withSection = [...state.history]
      withSection[withSection.length - 1] = { name: 'profile', params: { section: action.fromSection } }
      return {
        history: [...withSection, action.page].slice(-10),
        future: [],
      }
    }
    case 'BACK':
      if (state.history.length <= 1) return state
      return {
        history: state.history.slice(0, -1),
        future: [state.history[state.history.length - 1], ...state.future].slice(0, 10),
      }
    case 'FORWARD':
      if (state.future.length === 0) return state
      return {
        history: [...state.history, state.future[0]].slice(-10),
        future: state.future.slice(1),
      }
    case 'RESET':
      return { history: [{ name: 'home', params: {} }], future: [] }
    default:
      return state
  }
}

function loadInitialState() {
  try {
    const history = JSON.parse(sessionStorage.getItem('trb_history') || 'null')
    const future  = JSON.parse(sessionStorage.getItem('trb_future')  || 'null')
    if (history) return { history, future: future ?? [] }
    const page = JSON.parse(sessionStorage.getItem('trb_current_page') || 'null')
    if (page) return { history: [page], future: [] }
  } catch {}
  return { history: [{ name: 'home', params: {} }], future: [] }
}

function App() {
  const { loading, user } = useAuth()
  const [nav, dispatch] = useReducer(navReducer, null, loadInitialState)

  const page         = nav.history[nav.history.length - 1]
  const canGoBack    = nav.history.length > 1
  const canGoForward = nav.future.length > 0

  // Persist both stacks immediately on every change
  useEffect(() => {
    sessionStorage.setItem('trb_history', JSON.stringify(nav.history))
    sessionStorage.setItem('trb_current_page', JSON.stringify(nav.history[nav.history.length - 1]))
    sessionStorage.setItem('trb_future', JSON.stringify(nav.future))
  }, [nav])

  // Track browser history index to detect back vs forward in popstate
  const browserIdxRef = useRef(window.history.state?.idx ?? 0)

  useEffect(() => {
    window.history.replaceState({ idx: browserIdxRef.current }, '')
  }, [])

  useEffect(() => {
    const push = (page) => {
      dispatch({ type: 'PUSH', page })
      browserIdxRef.current += 1
      window.history.pushState({ idx: browserIdxRef.current }, '', window.location.pathname)
    }

    const back = (updateBrowser = true) => {
      dispatch({ type: 'BACK' })
      if (updateBrowser) {
        browserIdxRef.current -= 1
        window.history.pushState({ idx: browserIdxRef.current }, '', window.location.pathname)
      }
    }

    const forward = (updateBrowser = true) => {
      dispatch({ type: 'FORWARD' })
      if (updateBrowser) {
        browserIdxRef.current += 1
        window.history.pushState({ idx: browserIdxRef.current }, '', window.location.pathname)
      }
    }

    const handlePopState = (e) => {
      const newIdx = e.state?.idx ?? 0
      const diff   = newIdx - browserIdxRef.current
      browserIdxRef.current = newIdx
      if (diff < 0) back(false)
      else if (diff > 0) forward(false)
    }

    const handlers = {
      'navigate:product': (e) => {
        const fromSection = e.detail?.fromSection
        if (fromSection) {
          dispatch({ type: 'PUSH_FROM_SECTION', fromSection, page: { name: 'product', params: { id: e.detail?.productId } } })
          browserIdxRef.current += 1
          window.history.pushState({ idx: browserIdxRef.current }, '', window.location.pathname)
        } else {
          push({ name: 'product', params: { id: e.detail?.productId } })
        }
      },
      'navigate:profile':      (e) => push({ name: 'profile', params: { section: e.detail?.section } }),
      'navigate:profile:chat': (e) => push({ name: 'profile', params: { section: 'chat', orderId: e.detail?.orderId } }),
      'navigate:sell':         ()  => push({ name: 'sell', params: {} }),
      'navigate:home':         ()  => {
        dispatch({ type: 'RESET' })
        browserIdxRef.current = 0
        window.history.replaceState({ idx: 0 }, '')
      },
      'navigate:back':    () => back(),
      'navigate:forward': () => forward(),
    }

    Object.entries(handlers).forEach(([ev, fn]) => window.addEventListener(ev, fn))
    window.addEventListener('popstate', handlePopState)
    return () => {
      Object.entries(handlers).forEach(([ev, fn]) => window.removeEventListener(ev, fn))
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [page])

  useEffect(() => {
    if (!loading && !user && (page.name === 'profile' || page.name === 'sell')) {
      dispatch({ type: 'RESET' })
    }
  }, [loading, user, page.name])

  if (loading) {
    return (
      <div className="tb-loading-screen">
        <p className="tb-text-muted">Cargando...</p>
      </div>
    )
  }

  if (!user && page.name !== 'home' && page.name !== 'product') {
    return <Home />
  }

  switch (page.name) {
    case 'product': return <ProductDetail productId={page.params.id} canGoBack={canGoBack} canGoForward={canGoForward} />
    case 'profile': return <Profile initialSection={page.params.section} initialOrderId={page.params.orderId} canGoForward={canGoForward} />
    case 'sell':    return <Sell canGoForward={canGoForward} />
    default:        return <Home canGoForward={canGoForward} />
  }
}

export default App
