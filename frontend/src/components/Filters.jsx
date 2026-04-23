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
    <aside className="w-full">
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-medium border-2 transition-colors ${
          activeFilters > 0
            ? 'border-yellow-400 bg-yellow-50 text-yellow-700'
            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
        }`}
      >
        <span className="flex items-center gap-2">
          Filtros
          {activeFilters > 0 && (
            <span className="bg-yellow-400 text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {activeFilters}
            </span>
          )}
        </span>

        <span
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRight: '2px solid currentColor',
            borderBottom: '2px solid currentColor',
            transform: open ? 'rotate(225deg)' : 'rotate(45deg)',
            transition: 'transform 0.3s ease',
            marginBottom: open ? '-4px' : '4px',
          }}
        />
      </button>

      <div
        style={{
          display: 'grid',
          gridTemplateRows: open ? '1fr' : '0fr',
          transition: 'grid-template-rows 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div className="mt-3 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            {activeFilters > 0 && (
              <div className="flex justify-end mb-3">
                <button onClick={clearAll} className="text-xs text-gray-400 hover:text-gray-600 transition">
                  Limpiar todo
                </button>
              </div>
            )}
            <div className="flex flex-col gap-5">
              <div>
                <label htmlFor="filter-category" className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">
                  Categoría
                </label>
                <select
                  id="filter-category"
                  name="category_id"
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
                <label htmlFor="filter-condition" className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">
                  Estado
                </label>
                <select
                  id="filter-condition"
                  name="condition"
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
                    id="filter-min-price"
                    name="min_price"
                    type="number"
                    placeholder="Min"
                    value={filters.min_price}
                    onChange={e => update('min_price', e.target.value)}
                    aria-label="Precio mínimo"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                  <span className="text-gray-300 shrink-0">—</span>
                  <input
                    id="filter-max-price"
                    name="max_price"
                    type="number"
                    placeholder="Max"
                    value={filters.max_price}
                    onChange={e => update('max_price', e.target.value)}
                    aria-label="Precio máximo"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}