import { useState, useEffect } from 'react'
import client from '../api/client'
import Header from '../components/Header'
import ProductCard from '../components/ProductCard'
import Filters from '../components/Filters'

export default function Home() {
  const [products, setProducts]     = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [filters, setFilters]       = useState({
    search: '', category_id: '', condition: '', min_price: '', max_price: ''
  })

  useEffect(() => {
    client('/categories').then(setCategories)
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.append(k, v)
    })
    client(`/products?${params.toString()}`)
      .then(data => setProducts(data.data))
      .finally(() => setLoading(false))
  }, [filters])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="px-[5%] py-8">
        <div className="mb-6">
        <input
          id="search-products"
          name="search"
          type="text"
          placeholder="Buscar productos Pokemon..."
          value={filters.search}
          onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
          aria-label="Buscar productos"
          className="w-full border border-gray-200 rounded-full px-5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white shadow-sm"
        />
        </div>

        <div className="flex">
          <div className="w-[20%] pr-6">
            <Filters categories={categories} filters={filters} onChange={setFilters} />
          </div>

          <div className="w-[80%]">
            {loading ? (
              <div className="flex justify-center py-20">
                <p className="text-gray-400">Cargando productos...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="flex justify-center py-20">
                <p className="text-gray-400">No se encontraron productos</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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