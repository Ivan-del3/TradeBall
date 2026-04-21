import { useState } from 'react'

export default function Filters({ categories, filters, onChange }) {
  const [open, setOpen] = useState(false)
  const update = (key, value) => onChange(prev => ({ ...prev, [key]: value }))

  const activeFilters = [
    filters.category_id,
    filters.condition,
    filters.min_price,
    filters.max_price,
  ].filter(Boolean).length

  const clearAll = () => onChange(prev => ({
    ...prev,
    category_id: '',
    condition: '',
    min_price: '',
    max_price: '',
  }))

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Buscar productos Pokemon..."
          value={filters.search}
          onChange={e => update('search', e.target.value)}
          className="flex-1 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />

        <button
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border-2 transition ${
            activeFilters > 0
              ? 'border-yellow-400 bg-yellow-50 text-yellow-700'
              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
          }`}
        >
          Filtros
          {activeFilters > 0 && (
            <span className="bg-yellow-400 text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {open && (
        <div className="mt-3 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 text-sm">Filtros</h3>
            {activeFilters > 0 && (
              <button
                onClick={clearAll}
                className="text-xs text-gray-400 hover:text-gray-600 transition"
              >
                Limpiar todo
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">
                Categoria
              </label>
              <select
                value={filters.category_id}
                onChange={e => update('category_id', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
              >
                <option value="">Todas</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">
                Estado
              </label>
              <select
                value={filters.condition}
                onChange={e => update('condition', e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
              >
                <option value="">Cualquiera</option>
                <option value="nuevo">Nuevo</option>
                <option value="casi_nuevo">Casi nuevo</option>
                <option value="usado">Usado</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">
                Precio
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.min_price}
                  onChange={e => update('min_price', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <span className="text-gray-300">—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.max_price}
                  onChange={e => update('max_price', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}