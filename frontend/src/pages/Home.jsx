import { useState, useEffect, useRef } from 'react'
import client from '../api/client'
import Header from '../components/Header'
import ProductCard from '../components/ProductCard'
import Filters from '../components/Filters'
import { usePageTitle } from '../hooks/usePageTitle'

export default function Home() {
  usePageTitle(null)
  const [products, setProducts]       = useState([])
  const [categories, setCategories]   = useState([])
  const [loading, setLoading]         = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore]         = useState(false)
  const [page, setPage]               = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [filters, setFilters]         = useState({
    search: '', category_id: '', condition: '', min_price: '', max_price: '', sort_price: ''
  })
  const isFirstLoad = useRef(true)

  useEffect(() => {
    client('/categories').then(setCategories)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput }))
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Reset to page 1 when filters change
  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false
      return
    }
    setPage(1)
    setProducts([])
  }, [filters])

  useEffect(() => {
    let cancelled = false
    const isLoadMore = page > 1

    if (isLoadMore) {
      setLoadingMore(true)
    } else {
      setLoading(true)
    }

    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.append(k, v)
    })
    params.append('page', page)

    client(`/products?${params.toString()}`)
      .then(data => {
        if (cancelled) return
        const newProducts = data.data ?? []
        setProducts(prev => isLoadMore ? [...prev, ...newProducts] : newProducts)
        setHasMore(data.current_page < data.last_page)
      })
      .catch(() => {
        if (!cancelled) setProducts(prev => isLoadMore ? prev : [])
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false)
          setLoadingMore(false)
        }
      })

    return () => { cancelled = true }
  }, [filters, page])

  return (
    <div className="tb-page">
      <Header />
      <main className="tb-home-main">
        <div className="tb-search-wrapper">
          <input
            id="search-products"
            name="search"
            type="text"
            placeholder="Buscar productos Pokemon..."
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            maxLength={40}
            aria-label="Buscar productos"
            className="tb-search-bar"
          />
        </div>

        <div className="tb-home-layout">
          <div className="tb-sidebar-col">
            <Filters categories={categories} filters={filters} onChange={setFilters} />
          </div>

          <div className="tb-content-col">
            {loading ? (
              <div className="tb-loading-state">
                <p className="tb-text-muted">Cargando productos...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="tb-loading-state">
                <p className="tb-text-muted">No se encontraron productos</p>
              </div>
            ) : (
              <>
                <div className="tb-product-grid">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {hasMore && (
                  <div className="tb-load-more-wrapper">
                    <button
                      className="tb-load-more-btn"
                      onClick={() => setPage(prev => prev + 1)}
                      disabled={loadingMore}
                    >
                      {loadingMore ? 'Cargando...' : <>Cargar más <span aria-hidden="true">↓</span></>}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
