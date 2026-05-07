import { useState, useEffect } from 'react'
import client from '../../api/client'
import { LoadingCard, Empty } from './shared'
import Icon from '../Icon'

export default function Reviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client('/reviews')
      .then(data => { setReviews(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <LoadingCard />

  const average = reviews.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <div className="tb-card">
      <div className="tb-section-header">
        <h2 className="tb-section-title">Valoraciones</h2>
        {average && (
          <div className="tb-rating-badge">
            <Icon name="star-filled" size={16} color="var(--tb-red)" />
            <span className="tb-rating-score">{average}</span>
            <span className="tb-rating-count">({reviews.length})</span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <Empty text="No tienes valoraciones todavia" />
      ) : (
        <div className="tb-review-list">
          {reviews.map(review => (
            <ReviewRow key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  )
}

function ReviewRow({ review }) {
  return (
    <div className="tb-review-item">
      <div className="tb-review-header">
        <div className="tb-reviewer-info">
          <div className="tb-reviewer-avatar">
            {review.user?.name?.charAt(0).toUpperCase()}
          </div>
          <span className="tb-reviewer-name">{review.user?.name}</span>
        </div>
        <div className="tb-stars">
          {[1,2,3,4,5].map(star => (
            <Icon
              key={star}
              name={star <= review.rating ? 'star-filled' : 'star'}
              size={15}
              color="var(--tb-red)"
            />
          ))}
        </div>
      </div>
      {review.comment && (
        <p className="tb-review-comment">{review.comment}</p>
      )}
      <p className="tb-review-date">
        {new Date(review.created_at).toLocaleDateString('es-ES')}
      </p>
    </div>
  )
}
