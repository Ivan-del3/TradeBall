import Icon from './Icon'

export default function SellerReviewsModal({ seller, reviews }) {
  const average = reviews?.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : null

  return (
    <div className="tb-card tb-smr-card">
      <div className="tb-smr-header">
        <div>
          <h3 className="tb-smr-title">Valoraciones de {seller.name} {seller.lastname}</h3>
          {average !== null && (
            <div className="tb-smr-summary">
              {[1,2,3,4,5].map(s => (
                <Icon key={s} name={s <= Math.round(average) ? 'star-filled' : 'star'} size={14} color="var(--tb-red)" />
              ))}
              <span className="tb-smr-avg">{average.toFixed(1)}</span>
              <span className="tb-smr-count">· {reviews.length} valoracion{reviews.length !== 1 ? 'es' : ''}</span>
            </div>
          )}
        </div>
      </div>

      <div className="tb-smr-list">
        {!reviews ? (
          <p className="tb-smr-empty">Cargando valoraciones...</p>
        ) : reviews.length === 0 ? (
          <p className="tb-smr-empty">Este vendedor aún no tiene valoraciones.</p>
        ) : reviews.map(review => (
          <div key={review.id} className="tb-smr-item">
            <div className="tb-smr-item-header">
              <div className="tb-reviewer-info">
                <div className="tb-reviewer-avatar">
                  {review.user?.avatar_url
                    ? <img src={review.user.avatar_url} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    : review.user?.name?.charAt(0).toUpperCase()
                  }
                </div>
                <div>
                  <span className="tb-reviewer-name">{review.user?.name} {review.user?.lastname}</span>
                  <p className="tb-review-date" style={{ marginTop: 0 }}>
                    {new Date(review.created_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
              <div className="tb-stars">
                {[1,2,3,4,5].map(s => (
                  <Icon key={s} name={s <= review.rating ? 'star-filled' : 'star'} size={15} color="var(--tb-red)" />
                ))}
              </div>
            </div>

            {review.comment && (
              <p className="tb-review-comment">{review.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
