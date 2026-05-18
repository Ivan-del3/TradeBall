import { useState } from 'react'
import Icon from './Icon'

export default function Filters({ categories, filters, onChange }) {
  const [open, setOpen] = useState(false)
  const update = (key, value) => onChange(prev => ({ ...prev, [key]: value }))

  const activeFilters = [
    filters.category_id,
    filters.condition,
    filters.min_price,
    filters.max_price,
    filters.sort_price,
  ].filter(Boolean).length

  const clearAll = () => onChange(prev => ({
    ...prev,
    category_id: '',
    condition: '',
    min_price: '',
    max_price: '',
    sort_price: '',
  }))

  return (
    <aside className="tb-filters-aside">
      <button
        onClick={() => setOpen(!open)}
        className={`tb-filter-toggle${activeFilters > 0 ? ' tb-filter-toggle--active' : ''}`}
      >
        <span className="tb-filter-toggle-label">
          <Icon name="filter" size={18} />
          Filtros
          {activeFilters > 0 && (
            <span className="tb-filter-badge">{activeFilters}</span>
          )}
        </span>
        <Icon
          name="chevron-down"
          size={16}
          style={{
            color: 'var(--fg-3)',
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 180ms',
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
          <div className="tb-filter-panel">
            {activeFilters > 0 && (
              <div className="tb-filter-clear-row">
                <button onClick={clearAll} className="tb-btn-clear">Limpiar todo</button>
              </div>
            )}
            <div className="tb-filter-groups">
              <div>
                <label htmlFor="filter-category" className="tb-label-meta">Categoría</label>
                <select
                  id="filter-category"
                  name="category_id"
                  value={filters.category_id}
                  onChange={e => update('category_id', e.target.value)}
                  className="tb-select"
                >
                  <option value="">Todas</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="filter-condition" className="tb-label-meta">Estado</label>
                <select
                  id="filter-condition"
                  name="condition"
                  value={filters.condition}
                  onChange={e => update('condition', e.target.value)}
                  className="tb-select"
                >
                  <option value="">Cualquiera</option>
                  <option value="nuevo">Nuevo</option>
                  <option value="casi_nuevo">Casi nuevo</option>
                  <option value="usado">Usado</option>
                </select>
              </div>

              <div>
                <label htmlFor="filter-sort-price" className="tb-label-meta">Ordenar por precio</label>
                <select
                  id="filter-sort-price"
                  name="sort_price"
                  value={filters.sort_price}
                  onChange={e => update('sort_price', e.target.value)}
                  className="tb-select"
                >
                  <option value="">Sin ordenar</option>
                  <option value="asc">Menor a mayor</option>
                  <option value="desc">Mayor a menor</option>
                </select>
              </div>

              <div>
                <label className="tb-label-meta">Precio</label>
                <div className="tb-price-range">
                  <input
                    id="filter-min-price"
                    name="min_price"
                    type="number"
                    placeholder="Min"
                    min="0"
                    max="99999"
                    value={filters.min_price}
                    onChange={e => update('min_price', e.target.value)}
                    onBlur={e => {
                      const v = Number(e.target.value)
                      if (e.target.value !== '' && (v < 0 || v > 99999)) update('min_price', '')
                    }}
                    aria-label="Precio mínimo"
                    className="tb-input"
                  />
                  <span className="tb-range-sep">—</span>
                  <input
                    id="filter-max-price"
                    name="max_price"
                    type="number"
                    placeholder="Max"
                    min="0"
                    max="99999"
                    value={filters.max_price}
                    onChange={e => update('max_price', e.target.value)}
                    onBlur={e => {
                      const v = Number(e.target.value)
                      if (e.target.value !== '' && (v < 0 || v > 99999)) update('max_price', '')
                    }}
                    aria-label="Precio máximo"
                    className="tb-input"
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
