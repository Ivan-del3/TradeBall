import { useState } from 'react'
import client from '../../api/client'
import Icon from '../Icon'

export default function ReviewPopup({ orderId, reviewedName, onDone }) {
  const [rating, setRating]   = useState(0)
  const [hover, setHover]     = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async () => {
    if (!rating) { setError('Selecciona una valoración'); return }
    setLoading(true)
    setError('')
    try {
      await client('/reviews', {
        method: 'POST',
        body: { order_id: orderId, rating, comment: comment.trim() || null },
      })
      onDone(true)
    } catch (err) {
      setError(err.message || 'Error al enviar la valoración.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="tb-overlay" onClick={e => { e.stopPropagation(); if (e.target === e.currentTarget) onDone(false) }}>
      <div className="tb-popup">
        <div className="tb-modal-header">
          <h3 className="tb-modal-title--sm">Valorar a {reviewedName}</h3>
          <button onClick={() => onDone(false)} className="tb-popup-close">
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className="tb-review-stars-select">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              className="tb-star-btn"
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(star)}
            >
              <Icon
                name={(hover || rating) >= star ? 'star-filled' : 'star'}
                size={34}
                color="var(--tb-red)"
              />
            </button>
          ))}
        </div>

        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Describe tu experiencia (opcional)"
          rows={3}
          maxLength={1000}
          className="tb-textarea"
        />
        {comment.length >= 900 && (
          <p className="tb-hint-warn">{1000 - comment.length} caracteres restantes</p>
        )}

        {error && <p className="tb-hint-error">{error}</p>}

        <div className="tb-popup-actions">
          <button
            onClick={handleSubmit}
            disabled={loading || !rating}
            className="tb-btn-primary"
            style={{ flex: 1 }}
          >
            {loading ? 'Enviando...' : 'Enviar valoración'}
          </button>
          <button onClick={() => onDone(false)} className="tb-btn-secondary">
            Omitir
          </button>
        </div>
      </div>
    </div>
  )
}
