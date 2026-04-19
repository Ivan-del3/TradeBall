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
      <main className="max-w-7xl mx-auto px-4 py-8">
        <Filters
          categories={categories}
          filters={filters}
          onChange={setFilters}
        />
        {loading ? (
          <div className="flex justify-center py-20">
            <p className="text-gray-400">Cargando productos...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex justify-center py-20">
            <p className="text-gray-400">No se encontraron productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}