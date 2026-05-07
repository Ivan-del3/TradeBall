export default function ProductCard({ product }) {
  const image = product.main_image?.image_url || product.images?.[0]?.image_url

  const conditionBadge = {
    nuevo:      { text: 'Nuevo',      cls: 'tb-badge tb-badge--nuevo' },
    casi_nuevo: { text: 'Casi nuevo', cls: 'tb-badge tb-badge--casi-nuevo' },
    usado:      { text: 'Usado',      cls: 'tb-badge tb-badge--usado' },
  }

  const condition = conditionBadge[product.condition] ?? { text: product.condition, cls: 'tb-badge' }

  const handleClick = () => {
    window.dispatchEvent(new CustomEvent('navigate:product', {
      detail: { productId: product.id }
    }))
  }

  return (
    <div onClick={handleClick} className="tb-product-card">
      <div className="tb-product-card-image">
        {image ? (
          <img src={image} alt={product.name} className="tb-product-card-img" />
        ) : (
          <div className="tb-product-card-no-image">Sin imagen</div>
        )}
      </div>
      <div className="tb-product-card-body">
        <p className="tb-product-card-name">{product.name}</p>
        <div className="tb-product-card-footer">
          <span className="tb-product-card-price">{Number(product.price).toFixed(2)}€</span>
          <span className={condition.cls}>{condition.text}</span>
        </div>
        <p className="tb-product-card-category">{product.category?.name}</p>
      </div>
    </div>
  )
}
