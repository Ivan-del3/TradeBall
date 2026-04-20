export default function ProductCard({ product }) {
  const image = product.main_image?.image_url || product.images?.[0]?.image_url

  const conditionLabel = {
    nuevo:      { text: 'Nuevo',      color: 'bg-green-100 text-green-700' },
    casi_nuevo: { text: 'Casi nuevo', color: 'bg-blue-100 text-blue-700' },
    usado:      { text: 'Usado',      color: 'bg-gray-100 text-gray-600' },
  }

  const condition = conditionLabel[product.condition]

  const handleClick = () => {
    window.dispatchEvent(new CustomEvent('navigate:product', {
      detail: { productId: product.id }
    }))
  }

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition group cursor-pointer"
    >
      <div className="aspect-square bg-gray-100 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="w-full h-full object-contain p-2 group-hover:scale-105 transition"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            Sin imagen
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">{product.name}</p>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">{Number(product.price).toFixed(2)}€</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${condition.color}`}>
            {condition.text}
          </span>
        </div>
        <p className="text-xs text-gray-400 mt-1">{product.category?.name}</p>
      </div>
    </div>
  )
}