import { useState, useEffect } from 'react'
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
  const [searchInput, setSearchInput] = useState('')
  const [filters, setFilters]         = useState({
    search: '', category_id: '', condition: '', min_price: '', max_price: ''
  })

  useEffect(() => {
    client('/categories').then(setCategories)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchInput }))
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.append(k, v)
    })
    client(`/products?${params.toString()}`)
      .then(data  => { if (!cancelled) setProducts(data.data ?? []) })
      .catch(()   => { if (!cancelled) setProducts([]) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [filters])

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
              <div className="tb-product-grid">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
