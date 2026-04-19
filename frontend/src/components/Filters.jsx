export default function Filters({ categories, filters, onChange }) {
  const update = (key, value) => onChange(prev => ({ ...prev, [key]: value }))

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Buscador */}
      <input
        type="text"
        placeholder="Buscar productos Pokémon..."
        value={filters.search}
        onChange={e => update('search', e.target.value)}
        className="flex-1 min-w-48 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
      />

      {/* Categoría */}
      <select
        value={filters.category_id}
        onChange={e => update('category_id', e.target.value)}
        className="border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
      >
        <option value="">Todas las categorías</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>

      {/* Condición */}
      <select
        value={filters.condition}
        onChange={e => update('condition', e.target.value)}
        className="border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white"
      >
        <option value="">Cualquier estado</option>
        <option value="nuevo">Nuevo</option>
        <option value="casi_nuevo">Casi nuevo</option>
        <option value="usado">Usado</option>
      </select>

      {/* Precio */}
      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder="Min €"
          value={filters.min_price}
          onChange={e => update('min_price', e.target.value)}
          className="w-20 border border-gray-200 rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <span className="text-gray-400 text-sm">—</span>
        <input
          type="number"
          placeholder="Max €"
          value={filters.max_price}
          onChange={e => update('max_price', e.target.value)}
          className="w-20 border border-gray-200 rounded-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
      </div>
    </div>
  )
}