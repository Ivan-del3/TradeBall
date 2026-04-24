import { useState, useEffect } from 'react'
import client from '../../api/client'
import { LoadingCard, Empty } from './shared'

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
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">Valoraciones</h2>
        {average && (
          <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 rounded-full">
            <span className="text-yellow-400">★</span>
            <span className="text-sm font-bold text-gray-900">{average}</span>
            <span className="text-xs text-gray-400">({reviews.length})</span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <Empty text="No tienes valoraciones todavia" />
      ) : (
        <div className="space-y-4">
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
    <div className="border border-gray-100 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-black">
            {review.user?.name?.charAt(0).toUpperCase()} 
          </div>
          <span className="text-sm font-medium text-gray-900">
            {review.user?.name} 
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          {[1,2,3,4,5].map(star => (
            <span key={star} className={star <= review.rating ? 'text-yellow-400' : 'text-gray-200'}>★</span>
          ))}
        </div>
      </div>
      {review.comment && (
        <p className="text-sm text-gray-600">{review.comment}</p>
      )}
      <p className="text-xs text-gray-400 mt-2">
        {new Date(review.created_at).toLocaleDateString('es-ES')}
      </p>
    </div>
  )
}